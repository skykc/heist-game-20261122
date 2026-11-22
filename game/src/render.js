// render.js — every pixel of the museum is drawn here, procedurally:
// marble floors, gold-framed paintings, glass display cases, the vault,
// the rooftop helipad, and the people in it. No image files, no fonts
// from the network: the game is canvas and system fonts only.

import { PLAY } from './levels.js';

// Draw a filled, translucent vision cone from (x, y) along `angle`.
function drawCone(ctx, x, y, angle, fov, range, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - fov / 2, angle + fov / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// The marble floor: large dark tiles with faint gold veins and a red
// carpet runner down the middle of the room.
function drawFloor(ctx, level) {
  const tile = 80;
  for (let ty = PLAY.y; ty < PLAY.y + PLAY.h; ty += tile) {
    for (let tx = PLAY.x; tx < PLAY.x + PLAY.w; tx += tile) {
      const even = ((tx - PLAY.x) / tile + (ty - PLAY.y) / tile) % 2 === 0;
      ctx.fillStyle = even ? '#232838' : '#20242f';
      ctx.fillRect(tx, ty, tile, tile);
      ctx.strokeStyle = 'rgba(200, 170, 90, 0.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + 0.5, ty + 0.5, tile, tile);
    }
  }
  // Red carpet runner down the centre, with a gold border.
  ctx.fillStyle = '#5a1f24';
  ctx.fillRect(600, PLAY.y, 80, PLAY.h);
  ctx.fillStyle = '#8a6a2f';
  ctx.fillRect(596, PLAY.y, 4, PLAY.h);
  ctx.fillRect(680, PLAY.y, 4, PLAY.h);
  ctx.strokeStyle = 'rgba(220, 180, 90, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(606, PLAY.y + 10, 68, PLAY.h - 20);

  if (level.id === 2) {
    // Rooftop: skylight panels and a painted helipad ring on the concrete.
    ctx.fillStyle = 'rgba(120, 170, 255, 0.10)';
    ctx.fillRect(120, 120, 160, 100);
    ctx.fillRect(1000, 480, 160, 100);
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(120, 120, 160, 100);
    ctx.strokeRect(1000, 480, 160, 100);
    ctx.strokeStyle = '#3a4a6a';
    ctx.beginPath();
    ctx.moveTo(120, 170); ctx.lineTo(280, 170);
    ctx.moveTo(200, 120); ctx.lineTo(200, 220);
    ctx.moveTo(1000, 530); ctx.lineTo(1160, 530);
    ctx.moveTo(1080, 480); ctx.lineTo(1080, 580);
    ctx.stroke();
  }
}

// Stone walls with a lit top edge, so the room reads at a glance.
function drawWalls(ctx, walls) {
  for (let i = 0; i < walls.length; i++) {
    const w = walls[i];
    ctx.fillStyle = '#12141d';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#3d4360';
    if (w.h <= 16) ctx.fillRect(w.x, w.y + w.h - 3, w.w, 3);
    else ctx.fillRect(w.x + w.w - 3, w.y, 3, w.h);
  }
}

// Display cases, pillars, the vault safe and rooftop AC units.
function drawCover(ctx, cover) {
  for (let i = 0; i < cover.length; i++) {
    const c = cover[i];
    if (c.kind === 'case') {
      ctx.fillStyle = '#2c2118';
      ctx.fillRect(c.x, c.y + c.h - 14, c.w, 14);
      ctx.fillStyle = 'rgba(140, 200, 255, 0.20)';
      ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, c.h - 18);
      ctx.strokeStyle = '#c9a24b';
      ctx.lineWidth = 3;
      ctx.strokeRect(c.x + 2, c.y + 2, c.w - 4, c.h - 4);
      ctx.fillStyle = 'rgba(255, 230, 150, 0.5)';
      ctx.fillRect(c.x + c.w / 2 - 12, c.y + c.h / 2 - 4, 24, 8);
    } else if (c.kind === 'pillar') {
      ctx.fillStyle = '#0e0f16';
      ctx.fillRect(c.x - 3, c.y - 3, c.w + 6, c.h + 6);
      ctx.fillStyle = '#4a4f6e';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.fillStyle = '#6a70a0';
      ctx.fillRect(c.x + 4, c.y + 4, c.w - 8, 6);
    } else if (c.kind === 'vault') {
      ctx.fillStyle = '#1a2030';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#8a94b8';
      ctx.lineWidth = 4;
      ctx.strokeRect(c.x + 4, c.y + 4, c.w - 8, c.h - 8);
      // The vault wheel.
      ctx.strokeStyle = '#c9a24b';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(c.x + c.w / 2 - 26, c.y + c.h / 2);
      ctx.lineTo(c.x + c.w / 2 + 26, c.y + c.h / 2);
      ctx.moveTo(c.x + c.w / 2, c.y + c.h / 2 - 26);
      ctx.lineTo(c.x + c.w / 2, c.y + c.h / 2 + 26);
      ctx.stroke();
      ctx.fillStyle = '#c9a24b';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VAULT', c.x + c.w / 2, c.y + c.h - 12);
    } else if (c.kind === 'ac') {
      ctx.fillStyle = '#2a2f42';
      ctx.fillRect(c.x, c.y, c.w, c.h);
      ctx.strokeStyle = '#565e80';
      ctx.lineWidth = 2;
      for (let v = 0; v < 4; v++) {
        ctx.beginPath();
        ctx.moveTo(c.x + 12, c.y + 14 + v * 20);
        ctx.lineTo(c.x + c.w - 12, c.y + 14 + v * 20);
        ctx.stroke();
      }
      ctx.fillStyle = '#8a94b8';
      ctx.beginPath();
      ctx.arc(c.x + c.w - 24, c.y + 24, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Gold-framed paintings hung on the top wall, each a tiny abstract.
function drawPaintings(ctx, t) {
  const spots = [180, 420, 880, 1100];
  for (let i = 0; i < spots.length; i++) {
    const x = spots[i];
    ctx.fillStyle = '#c9a24b';
    ctx.fillRect(x - 34, 96, 68, 46);
    ctx.fillStyle = ['#7a2a2a', '#2a4a7a', '#2a7a4a', '#7a5a2a'][i];
    ctx.fillRect(x - 30, 100, 60, 38);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(x - 12 + Math.sin(t * 0.6 + i) * 6, 116, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20, 20, 30, 0.55)';
    ctx.fillRect(x - 30, 128, 60, 10);
  }
}

// Loot pieces, each with a pulsing glow so the target is obvious.
function drawLoot(ctx, loot, t) {
  for (let i = 0; i < loot.length; i++) {
    const l = loot[i];
    if (l.taken) continue;
    const pulse = 0.55 + Math.sin(t * 3 + i * 1.3) * 0.25;
    ctx.save();
    ctx.globalAlpha = pulse * 0.5;
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(l.x, l.y);
    if (l.kind === 'painting') {
      ctx.fillStyle = '#c9a24b';
      ctx.fillRect(-22, -16, 44, 32);
      ctx.fillStyle = '#3a2a6a';
      ctx.fillRect(-18, -12, 36, 24);
      ctx.fillStyle = '#ffd76a';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (l.kind === 'gold') {
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(-20, -4, 40, 12);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-16, -12, 32, 12);
      ctx.fillRect(-8, -20, 16, 10);
    } else if (l.kind === 'diamond') {
      ctx.fillStyle = '#7fe7ff';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, -4);
      ctx.lineTo(0, 16);
      ctx.lineTo(-16, -4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, -4);
      ctx.lineTo(0, 4);
      ctx.lineTo(-8, -4);
      ctx.closePath();
      ctx.fill();
    } else if (l.kind === 'crown') {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-20, 10);
      ctx.lineTo(-20, -8);
      ctx.lineTo(-10, 2);
      ctx.lineTo(0, -14);
      ctx.lineTo(10, 2);
      ctx.lineTo(20, -8);
      ctx.lineTo(20, 10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d21f3c';
      ctx.beginPath();
      ctx.arc(0, 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    // Label under the loot.
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(l.label.toUpperCase(), l.x, l.y + 34);
  }
}

// The exit: a green door (rooms 1-2) or the helipad (room 3).
function drawExit(ctx, exit, open, t) {
  if (exit.circle) {
    ctx.save();
    ctx.strokeStyle = open ? '#39ff7a' : '#5a6a8a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(exit.cx, exit.cy, exit.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = open ? 'rgba(57, 255, 122, 0.20)' : 'rgba(90, 106, 138, 0.12)';
    ctx.beginPath();
    ctx.arc(exit.cx, exit.cy, exit.r - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = open ? '#39ff7a' : '#8a94b8';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', exit.cx, exit.cy + 1);
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillText('HELIPAD', exit.cx, exit.cy + exit.r + 16);
    ctx.restore();
    if (open) {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.25;
      ctx.strokeStyle = '#39ff7a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(exit.cx, exit.cy, exit.r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }
  const x = exit.x;
  const y = exit.y;
  ctx.fillStyle = open ? '#0f5a2a' : '#2a2f42';
  ctx.fillRect(x, y - 16, exit.w, 16 + exit.h);
  ctx.fillStyle = open ? '#39ff7a' : '#5a6a8a';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT — OPEN' : 'EXIT — LOCKED', x + exit.w / 2, y - 4);
  if (open) {
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.25;
    ctx.fillStyle = '#39ff7a';
    ctx.fillRect(x, y, exit.w, exit.h);
    ctx.restore();
  }
}

// The thief: a hooded figure, dark cloak with a pale face slit.
function drawPlayer(ctx, p, t) {
  ctx.save();
  ctx.translate(p.x, p.y);
  // Soft shadow.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cloak.
  ctx.fillStyle = '#1c1a26';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a4460';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Hood point in the facing direction.
  ctx.fillStyle = '#1c1a26';
  ctx.beginPath();
  ctx.moveTo(Math.cos(p.dir) * 14, Math.sin(p.dir) * 14);
  ctx.lineTo(Math.cos(p.dir + 0.5) * 8, Math.sin(p.dir + 0.5) * 8);
  ctx.lineTo(Math.cos(p.dir - 0.5) * 8, Math.sin(p.dir - 0.5) * 8);
  ctx.closePath();
  ctx.fill();
  // Face slit with two glinting eyes.
  ctx.fillStyle = '#f2e6c8';
  ctx.beginPath();
  ctx.arc(Math.cos(p.dir) * 5, Math.sin(p.dir) * 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(Math.cos(p.dir) * 6 - 2, Math.sin(p.dir) * 6 - 1.5, 1.2, 0, Math.PI * 2);
  ctx.arc(Math.cos(p.dir) * 6 + 2, Math.sin(p.dir) * 6 + 1.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Aim line to the mouse while playing, so the coin throw reads.
  if (p.aiming) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 215, 106, 0.55)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.aimX, p.aimY);
    ctx.stroke();
    ctx.restore();
  }
}

// A guard: navy uniform, cap, and a cone of torchlight ahead.
function drawGuard(ctx, g, alert) {
  const coneColor = alert ? '#ff5040' : '#ffd76a';
  const coneAlpha = alert ? 0.30 : 0.16;
  drawCone(ctx, g.x, g.y, g.angle, g.fov, g.range, coneColor, coneAlpha);
  // Torch beam edge.
  ctx.save();
  ctx.strokeStyle = alert ? 'rgba(255, 80, 64, 0.5)' : 'rgba(255, 215, 106, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.angle - g.fov / 2) * g.range, g.y + Math.sin(g.angle - g.fov / 2) * g.range);
  ctx.moveTo(g.x, g.y);
  ctx.lineTo(g.x + Math.cos(g.angle + g.fov / 2) * g.range, g.y + Math.sin(g.angle + g.fov / 2) * g.range);
  ctx.stroke();
  ctx.restore();
  // Body.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(g.x, g.y + 11, 15, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22305a';
  ctx.beginPath();
  ctx.arc(g.x, g.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a5a8a';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cap.
  ctx.fillStyle = '#16203e';
  ctx.beginPath();
  ctx.arc(g.x, g.y - 3, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(g.x - 10, g.y - 6, 20, 4);
  // Torch dot.
  ctx.fillStyle = alert ? '#ff5040' : '#fff2b0';
  ctx.beginPath();
  ctx.arc(g.x + Math.cos(g.angle) * 14, g.y + Math.sin(g.angle) * 14, 3.5, 0, Math.PI * 2);
  ctx.fill();
  if (g.state === 'investigate') {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', g.x, g.y - 24);
  } else if (g.state === 'chase') {
    ctx.fillStyle = '#ff5040';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', g.x, g.y - 24);
  }
}

// A CCTV camera: wall mount, sweeping lens, and its pale cone.
function drawCamera(ctx, cam, t) {
  const disabled = cam.disabledT > 0;
  if (!disabled) {
    drawCone(ctx, cam.x, cam.y, cam.angle, cam.fov, cam.range, '#9fb8ff', 0.13);
  }
  ctx.fillStyle = '#2a2f42';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#565e80';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.rotate(cam.angle);
  ctx.fillStyle = disabled ? '#3a3f55' : '#1a2030';
  ctx.fillRect(0, -4, 16, 8);
  ctx.fillStyle = disabled ? '#555' : '#cfe0ff';
  ctx.beginPath();
  ctx.arc(16, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Blinking status light.
  const blink = disabled ? false : Math.sin(t * 5 + cam.index) > 0;
  ctx.fillStyle = disabled ? '#666' : blink ? '#ff4040' : '#7a2020';
  ctx.beginPath();
  ctx.arc(cam.x, cam.y - 11, 3, 0, Math.PI * 2);
  ctx.fill();
  if (disabled) {
    ctx.fillStyle = '#9aa0b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFLINE', cam.x, cam.y + 24);
  }
}

// Thrown coins and smoke clouds.
function drawEffects(ctx, coins, smokes, t) {
  for (let i = 0; i < coins.length; i++) {
    const c = coins[i];
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  for (let i = 0; i < smokes.length; i++) {
    const s = smokes[i];
    const fade = Math.min(1, s.ttl);
    ctx.save();
    ctx.globalAlpha = 0.55 * fade;
    ctx.fillStyle = '#9aa0b8';
    for (let k = 0; k < 5; k++) {
      const a = k * 1.256 + t * 0.3;
      ctx.beginPath();
      ctx.arc(s.x + Math.cos(a) * s.r * 0.45, s.y + Math.sin(a) * s.r * 0.45, s.r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// Draw one whole room: floor, exit, cover, loot, cones, people, effects.
export function drawRoom(ctx, level, guards, cameras, loot, player, coins, smokes, t, showPlayer) {
  drawFloor(ctx, level);
  drawExit(ctx, level.exit, loot.every((l) => l.taken), t);
  drawCover(ctx, level.cover);
  drawPaintings(ctx, t);
  drawLoot(ctx, loot, t);
  for (let i = 0; i < cameras.length; i++) drawCamera(ctx, cameras[i], t);
  for (let i = 0; i < guards.length; i++) {
    drawGuard(ctx, guards[i], guards[i].state === 'chase');
  }
  drawEffects(ctx, coins, smokes, t);
  if (showPlayer) drawPlayer(ctx, player, t);
  drawWalls(ctx, level.walls);
}

// A soft dark vignette over the edges, for the night-museum mood.
// Kept light: the whole room must stay readable in a small screenshot.
export function drawVignette(ctx) {
  const g = ctx.createRadialGradient(640, 360, 320, 640, 360, 760);
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);
}
