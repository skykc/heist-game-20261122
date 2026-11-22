// main.js — VAULTBREAK: the game loop and the state machine.
// Title (the first room already patrolling behind it) → playing →
// caught / room clear → the next room → the getaway. The loop owns the
// alarm: guards and cameras raise it while they see the thief, it cools
// down while nobody does, and at 100% the run is over.

import { LEVELS } from './levels.js';
import { createGuard, createCamera, updateGuard, updateCamera, guardTouching } from './guards.js';
import { createPlayer, updatePlayer, throwCoin, dropSmoke, fireEMP, ageEffects } from './player.js';
import { createInput } from './input.js';
import { drawRoom, drawVignette } from './render.js';
import { drawHUD, drawTitle, drawHelp, drawCaught, drawRoomClear, drawWin } from './hud.js';
import {
  unlockAudio, toggleMute, sfxCoin, sfxPickup, sfxSpotted, sfxAlarmTick,
  sfxSmoke, sfxEMP, sfxStep, sfxCaught, sfxRoomClear, sfxWin,
} from './audio.js';
import { dist, angleTo, pointInRect } from './geom.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

// One live run of the game. `s` is handed to the HUD so it can read
// everything it draws.
const s = {
  state: 'title',        // title | playing | caught | roomclear | win
  helpOpen: false,
  levelIndex: 0,
  level: LEVELS[0],
  player: null,
  guards: [],
  cameras: [],
  loot: [],
  coins: [],
  smokes: [],
  alarm: 0,
  time: 0,               // seconds in the current room
  totalTime: 0,
  score: 0,
  roomScore: 0,          // loot value lifted in the current room
  lootValue: 0,          // loot value lifted in the whole run
  message: '',
  messageColor: '#ffd76a',
  messageT: 0,
  caughtReason: '',
  timeBonus: 0,
  alarmTickT: 0,
};

function setMessage(text, color) {
  s.message = text;
  s.messageColor = color || '#ffd76a';
  s.messageT = 2.6;
}

// (Re)build a room: fresh guards, cameras, loot and tools.
function setupLevel(index) {
  const level = LEVELS[index];
  s.levelIndex = index;
  s.level = level;
  s.player = createPlayer(level.playerStart);
  s.guards = level.guards.map((g, i) => createGuard(g, i));
  s.cameras = level.cameras.map((c, i) => createCamera(c, i));
  s.loot = level.loot.map((l) => ({ ...l, taken: false }));
  s.coins = [];
  s.smokes = [];
  s.alarm = 0;
  s.time = 0;
  s.roomScore = 0;
  s.message = '';
  s.messageT = 0;
  s.caughtReason = '';
}

// The room's walls plus its cover: everything that blocks feet and sight.
function blockers() {
  return s.level.walls.concat(s.level.cover);
}

function allLootTaken() {
  return s.loot.every((l) => l.taken);
}

function atExit() {
  const e = s.level.exit;
  if (e.circle) return dist(s.player.x, s.player.y, e.cx, e.cy) < e.r;
  return pointInRect(s.player.x, s.player.y, e, 4);
}

function endRun(reason) {
  s.state = 'caught';
  s.caughtReason = reason;
  sfxCaught();
}

// Guards patrol on their own behind the title screen, so the first
// screenshot already shows cones sweeping over a live room.
function demoStep(dt, t) {
  for (let i = 0; i < s.guards.length; i++) {
    const g = s.guards[i];
    const wp = g.waypoints[g.wpIndex];
    const d = dist(g.x, g.y, wp[0], wp[1]);
    if (d < 6) {
      g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
      g.pauseT = 0.7;
    } else if (g.pauseT > 0) {
      g.pauseT -= dt;
      g.angle += dt * 0.9;
    } else {
      const a = angleTo(g.x, g.y, wp[0], wp[1]);
      g.angle = a;
      g.x += Math.cos(a) * g.speed * dt;
      g.y += Math.sin(a) * g.speed * dt;
    }
  }
  for (let i = 0; i < s.cameras.length; i++) {
    const cam = s.cameras[i];
    cam.angle = cam.base + Math.sin(t * cam.rate + cam.phase) * cam.sweep;
  }
}

function updatePlaying(dt, t) {
  const p = s.player;
  const blocks = blockers();

  // Tools first: a click throws a coin, Q/Space drops smoke, E fires EMP.
  if (input.throwAt) {
    const coin = throwCoin(p, input.throwAt.x, input.throwAt.y, s.coins);
    if (coin) {
      sfxCoin();
      setMessage('Coin thrown — a guard goes to look…', '#ffd76a');
    } else {
      setMessage('No coins left!', '#ff8080');
    }
  }
  if (input.smokePressed) {
    const cloud = dropSmoke(p, s.smokes);
    if (cloud) {
      sfxSmoke();
      setMessage('Smoke! Cones cannot see through it.', '#c8cede');
    } else {
      setMessage('No smoke bombs left!', '#ff8080');
    }
  }
  if (input.empPressed) {
    if (fireEMP(p, s.cameras)) {
      sfxEMP();
      setMessage('EMP fired — all cameras dark for 8 seconds!', '#9fb8ff');
    } else {
      setMessage('No EMP charges left!', '#ff8080');
    }
  }

  updatePlayer(p, dt, input, blocks);
  if (p.moving) {
    if (p.stepT <= 0) {
      sfxStep();
      p.stepT = 0.34;
    }
  }
  p.aiming = input.mouseIn;
  p.aimX = input.mouseX;
  p.aimY = input.mouseY;
  ageEffects(dt, s.coins, s.smokes);

  // Sight: every guard and camera that sees the thief raises the alarm.
  let anyoneSees = false;
  for (let i = 0; i < s.guards.length; i++) {
    const wasChase = s.guards[i].state === 'chase';
    const seen = updateGuard(s.guards[i], dt, t, p, blocks, s.smokes, s.coins);
    if (seen) {
      anyoneSees = true;
      s.alarm += 30 * dt;
      if (!wasChase) {
        sfxSpotted();
        setMessage('SPOTTED! Break line of sight!', '#ff8080');
      }
    }
  }
  for (let i = 0; i < s.cameras.length; i++) {
    const seen = updateCamera(s.cameras[i], dt, t, p, blocks, s.smokes);
    if (seen) {
      anyoneSees = true;
      s.alarm += 22 * dt;
      setMessage('Camera on you — move!', '#ff8080');
    }
  }
  if (!anyoneSees) {
    s.alarm = Math.max(0, s.alarm - 7 * dt);
  } else {
    s.alarmTickT -= dt;
    if (s.alarm > 70 && s.alarmTickT <= 0) {
      sfxAlarmTick();
      s.alarmTickT = 0.5;
    }
  }
  s.alarm = Math.min(100, s.alarm);

  // A guard close enough to touch ends the run at once.
  if (guardTouching(s.guards, p)) {
    endRun('A guard grabbed you in the gallery.');
    return;
  }
  if (s.alarm >= 100) {
    endRun('The alarm hit 100% — the museum locked down.');
    return;
  }

  // Loot: walk over a piece to lift it.
  for (let i = 0; i < s.loot.length; i++) {
    const l = s.loot[i];
    if (!l.taken && dist(p.x, p.y, l.x, l.y) < 32) {
      l.taken = true;
      s.score += l.value;
      s.roomScore += l.value;
      s.lootValue += l.value;
      sfxPickup();
      const left = s.loot.filter((x) => !x.taken).length;
      setMessage(
        left > 0
          ? 'Lifted: ' + l.label + ' (+$' + l.value + ') — ' + left + ' to go'
          : 'All loot lifted! Get to the EXIT!',
        '#39ff7a',
      );
    }
  }

  // The exit opens once the room is clean.
  if (allLootTaken() && atExit()) {
    s.timeBonus = Math.max(0, Math.round((s.level.par - s.time) * 10));
    s.score += s.timeBonus;
    sfxRoomClear();
    s.state = s.levelIndex + 1 < LEVELS.length ? 'roomclear' : 'win';
    if (s.state === 'win') sfxWin();
  }
}

function update(dt, t) {
  if (input.helpPressed) s.helpOpen = !s.helpOpen;
  if (input.mutePressed) toggleMute();
  if (input.enterPressed || (input.throwAt && s.state === 'title')) unlockAudio();

  if (s.helpOpen) {
    input.consumeEdges();
    return;
  }

  if (s.state === 'title') {
    demoStep(dt, t);
    if (input.enterPressed || input.throwAt) {
      s.state = 'playing';
      setMessage('Stay out of the cones. Lift the loot. Vanish.', '#ffd76a');
    }
  } else if (s.state === 'playing') {
    s.time += dt;
    s.totalTime += dt;
    updatePlaying(dt, t);
  } else if (s.state === 'caught') {
    if (input.retryPressed) {
      setupLevel(s.levelIndex);
      s.state = 'playing';
    }
  } else if (s.state === 'roomclear') {
    if (input.enterPressed) {
      setupLevel(s.levelIndex + 1);
      s.state = 'playing';
      setMessage(s.level.name + ' — ' + s.level.sub, '#ffd76a');
    }
  } else if (s.state === 'win') {
    if (input.retryPressed) {
      s.score = 0;
      s.lootValue = 0;
      s.totalTime = 0;
      setupLevel(0);
      s.state = 'title';
    }
  }

  if (s.messageT > 0) s.messageT -= dt;
  input.consumeEdges();
}

function render(t) {
  ctx.clearRect(0, 0, 1280, 720);
  const showPlayer = s.state !== 'title';
  drawRoom(ctx, s.level, s.guards, s.cameras, s.loot, s.player, s.coins, s.smokes, t, showPlayer);
  drawVignette(ctx);
  drawHUD(ctx, s);
  if (s.state === 'title') drawTitle(ctx, t);
  else if (s.state === 'caught') drawCaught(ctx, s.caughtReason, s.score);
  else if (s.state === 'roomclear') drawRoomClear(ctx, s.level.name, s.roomScore, s.timeBonus, s.score);
  else if (s.state === 'win') drawWin(ctx, s.score, s.totalTime, s.lootValue);
  if (s.helpOpen) drawHelp(ctx);
}

let last = performance.now();
let firstFrame = true;

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  const t = now / 1000;
  update(dt, t);
  render(t);
  if (firstFrame) {
    firstFrame = false;
    window.__shotReady = true;
  }
  window.__vaultbreak = {
    state: s.state,
    level: s.level.name,
    alarm: Math.round(s.alarm),
    loot: s.loot.filter((l) => l.taken).length + '/' + s.loot.length,
    score: s.score,
    // Staging helper for the maker's screenshots: jump straight into
    // a room, playing, without pressing through the earlier ones.
    gotoLevel: (i) => {
      const n = Math.max(0, Math.min(LEVELS.length - 1, i | 0));
      setupLevel(n);
      s.state = 'playing';
      setMessage(s.level.name + ' — ' + s.level.sub, '#ffd76a');
    },
  };
  requestAnimationFrame(frame);
}

setupLevel(0);
requestAnimationFrame(frame);
