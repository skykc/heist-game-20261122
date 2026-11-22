// player.js — the thief: movement with wall collision, and the three
// tools of the trade. Every tool costs something, so each use is a choice:
// a coin is quiet but only distracts, smoke hides you but is spent fast,
// and the EMP kills every camera at once — once per room.

import { circleHitsRect, resolveCircleRect } from './geom.js';

export const PLAYER_SPEED = 175;
export const COIN_THROW_RANGE = 320;

// A fresh thief at the room's starting point.
export function createPlayer(start) {
  return {
    x: start.x,
    y: start.y,
    r: 14,
    dir: 0,            // facing angle, for the drawn hood
    moving: false,
    coins: 3,          // thrown coins: distract the nearest guard
    smoke: 2,          // smoke bombs: a cloud that blocks every cone
    emp: 1,            // EMP charges: shut every camera down for 8 seconds
    stepT: 0,          // footstep sound timer
  };
}

// Move with WASD or the arrow keys, sliding along walls and cover.
// blockers are the room's walls plus its cover pieces.
export function updatePlayer(p, dt, input, blockers) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  p.moving = mx !== 0 || my !== 0;
  if (!p.moving) return;
  const len = Math.sqrt(mx * mx + my * my);
  mx /= len;
  my /= len;
  p.dir = Math.atan2(my, mx);
  const nx = p.x + mx * PLAYER_SPEED * dt;
  const ny = p.y + my * PLAYER_SPEED * dt;
  // Move one axis at a time so the thief slides along a wall instead of
  // sticking to it.
  let pos = { x: nx, y: p.y };
  for (let i = 0; i < blockers.length; i++) {
    if (circleHitsRect(pos.x, pos.y, p.r, blockers[i])) {
      pos = resolveCircleRect(pos.x, pos.y, p.r, blockers[i]);
    }
  }
  p.x = pos.x;
  pos = { x: p.x, y: ny };
  for (let i = 0; i < blockers.length; i++) {
    if (circleHitsRect(pos.x, pos.y, p.r, blockers[i])) {
      pos = resolveCircleRect(pos.x, pos.y, p.r, blockers[i]);
    }
  }
  p.y = pos.y;
  p.stepT -= dt;
}

// Throw a coin toward (tx, ty), at most COIN_THROW_RANGE away.
// Returns the coin entity, or null when no coin is left.
export function throwCoin(p, tx, ty, coins) {
  if (p.coins <= 0) return null;
  const dx = tx - p.x;
  const dy = ty - p.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const range = Math.min(d, COIN_THROW_RANGE);
  const a = Math.atan2(dy, dx);
  p.coins -= 1;
  const coin = {
    x: p.x + Math.cos(a) * range,
    y: p.y + Math.sin(a) * range,
    ttl: 12,           // the coin stays interesting for 12 seconds
    born: 0,
  };
  coins.push(coin);
  return coin;
}

// Drop a smoke bomb at the thief's feet. Returns the cloud, or null.
export function dropSmoke(p, smokes) {
  if (p.smoke <= 0) return null;
  p.smoke -= 1;
  const cloud = { x: p.x, y: p.y, r: 95, ttl: 5 };
  smokes.push(cloud);
  return cloud;
}

// Fire the EMP: every camera in the room goes dark for 8 seconds.
// Returns true when a charge was spent.
export function fireEMP(p, cameras) {
  if (p.emp <= 0) return false;
  p.emp -= 1;
  for (let i = 0; i < cameras.length; i++) cameras[i].disabledT = 8;
  return true;
}

// Age the coins and smoke clouds; dead ones are removed in place.
export function ageEffects(dt, coins, smokes) {
  for (let i = coins.length - 1; i >= 0; i--) {
    coins[i].ttl -= dt;
    if (coins[i].ttl <= 0) coins.splice(i, 1);
  }
  for (let i = smokes.length - 1; i >= 0; i--) {
    smokes[i].ttl -= dt;
    if (smokes[i].ttl <= 0) smokes.splice(i, 1);
  }
}
