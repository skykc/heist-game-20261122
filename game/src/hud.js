// hud.js — everything the player reads: the giant alarm meter, the
// loot count, the tools, the objective, and the screens that say
// WIN or LOSE in words big enough to read when the screenshot shrinks.

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// The top bar: alarm meter (huge), loot, tools, room and time.
export function drawHUD(ctx, s) {
  // Bar background.
  ctx.fillStyle = '#0d0f18';
  ctx.fillRect(0, 0, 1280, 76);
  ctx.fillStyle = '#2a2f42';
  ctx.fillRect(0, 74, 1280, 2);

  // Room name.
  ctx.fillStyle = '#e8d9a0';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(s.level.name, 16, 22);
  ctx.fillStyle = '#9aa0b8';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(s.level.sub, 16, 48);

  // ALARM meter: the single most important number in the game.
  const alarm = Math.max(0, Math.min(100, s.alarm));
  const ax = 330;
  const ay = 16;
  const aw = 420;
  const ah = 30;
  ctx.fillStyle = '#e8d9a0';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', ax, ay + 10);
  ctx.fillStyle = '#1a1d2a';
  roundRect(ctx, ax + 78, ay, aw, ah, 6);
  ctx.fill();
  const frac = alarm / 100;
  const col = alarm < 40 ? '#39c25a' : alarm < 70 ? '#f2b01e' : '#ff4030';
  ctx.fillStyle = col;
  if (frac > 0) {
    roundRect(ctx, ax + 80, ay + 2, Math.max(8, (aw - 4) * frac), ah - 4, 5);
    ctx.fill();
  }
  ctx.strokeStyle = '#565e80';
  ctx.lineWidth = 2;
  roundRect(ctx, ax + 78, ay, aw, ah, 6);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(Math.round(alarm) + '%', ax + 78 + aw + 12, ay + 16);
  // Objective under the meter.
  ctx.fillStyle = '#c8cede';
  ctx.font = '13px system-ui, sans-serif';
  const taken = s.loot.filter((l) => l.taken).length;
  ctx.fillText(
    taken < s.loot.length
      ? 'Steal all loot, then reach the EXIT'
      : 'All loot lifted — get to the EXIT!',
    ax, 62,
  );

  // Loot count.
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('◆ LOOT ' + taken + '/' + s.loot.length, 980, 26);

  // Tools.
  ctx.fillStyle = '#c8cede';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(
    'COIN ×' + s.player.coins + '   SMOKE ×' + s.player.smoke + '   EMP ×' + s.player.emp,
    980, 52,
  );

  // Score and time, far right.
  ctx.fillStyle = '#e8d9a0';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('$' + s.score.toLocaleString('en-US'), 1264, 26);
  ctx.fillStyle = '#9aa0b8';
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(fmtTime(s.time), 1264, 52);

  // Flashing message line under the bar.
  if (s.message && s.messageT > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.messageT);
    ctx.fillStyle = s.messageColor || '#ffd76a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.message, 640, 108);
    ctx.restore();
  }
}

export function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function dimScreen(ctx, alpha) {
  ctx.fillStyle = 'rgba(5, 6, 12, ' + alpha + ')';
  ctx.fillRect(0, 0, 1280, 720);
}

function bigTitle(ctx, text, y, color, size) {
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 640, y);
}

// Title screen, drawn over the live first room: the guards are already
// patrolling behind the title, so the cover shot shows the whole game.
export function drawTitle(ctx, t) {
  dimScreen(ctx, 0.62);
  ctx.fillStyle = '#c9a24b';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('M I D N I G H T   A T   T H E   M E R I D I A N   M U S E U M', 640, 170);
  bigTitle(ctx, 'VAULTBREAK', 250, '#f2e6c8', 96);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText('One thief. Three rooms. Every guard watching.', 640, 320);
  const lines = [
    'WASD / ARROWS — move quietly',
    'MOUSE CLICK — throw a coin to distract a guard',
    'Q or SPACE — smoke bomb (blocks every cone)   ·   E — EMP (kills cameras 8s)',
    'Lift ALL the loot, then reach the EXIT before the alarm hits 100%',
  ];
  ctx.fillStyle = '#c8cede';
  ctx.font = '17px system-ui, sans-serif';
  for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i], 640, 380 + i * 30);
  const blink = Math.sin(t * 4) > -0.2;
  if (blink) {
    ctx.fillStyle = '#39ff7a';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText('PRESS ENTER TO BEGIN THE HEIST', 640, 540);
  }
  ctx.fillStyle = '#7a8199';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('H — help    ·    M — mute    ·    R — restart a room', 640, 600);
}

export function drawHelp(ctx) {
  dimScreen(ctx, 0.78);
  bigTitle(ctx, 'HOW TO STEAL A MUSEUM', 120, '#f2e6c8', 44);
  const lines = [
    ['MOVE', 'WASD or arrow keys. Walls and display cases block you — and block sight.'],
    ['COIN', 'Click anywhere to throw a coin (3 per room). A nearby guard walks over to look.'],
    ['SMOKE', 'Q or SPACE drops a smoke bomb (2 per room). Cones cannot see through smoke.'],
    ['EMP', 'E fires the EMP (1 per room). Every camera goes dark for 8 seconds.'],
    ['ALARM', 'Guards and cameras raise the alarm while they see you. At 100% you are caught.'],
    ['CAUGHT', 'A guard touching you ends the run at once. Break line of sight to cool down.'],
    ['WIN', 'Lift every loot piece, then reach the EXIT. Clear all 3 rooms for the getaway.'],
  ];
  ctx.textAlign = 'left';
  for (let i = 0; i < lines.length; i++) {
    const y = 190 + i * 52;
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.fillText(lines[i][0], 300, y);
    ctx.fillStyle = '#c8cede';
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillText(lines[i][1], 420, y);
  }
  ctx.fillStyle = '#39ff7a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRESS H TO CLOSE', 640, 590);
}

export function drawCaught(ctx, reason, score) {
  dimScreen(ctx, 0.55);
  ctx.fillStyle = 'rgba(255, 40, 30, 0.12)';
  ctx.fillRect(0, 0, 1280, 720);
  bigTitle(ctx, 'CAUGHT!', 260, '#ff5040', 110);
  ctx.fillStyle = '#f2e6c8';
  ctx.font = 'bold 24px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(reason, 640, 350);
  ctx.fillStyle = '#c8cede';
  ctx.font = '19px system-ui, sans-serif';
  ctx.fillText('The museum keeps its treasures — this time. Score so far: $' + score.toLocaleString('en-US'), 640, 400);
  const blink = Math.sin(Date.now() / 300) > -0.2;
  if (blink) {
    ctx.fillStyle = '#39ff7a';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('PRESS R TO TRY THE ROOM AGAIN', 640, 480);
  }
}

export function drawRoomClear(ctx, levelName, roomScore, timeBonus, total) {
  dimScreen(ctx, 0.5);
  bigTitle(ctx, 'ROOM CLEAR', 240, '#39ff7a', 88);
  ctx.fillStyle = '#f2e6c8';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(levelName + ' — cleaned out.', 640, 330);
  ctx.fillStyle = '#c8cede';
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText('Loot $' + roomScore.toLocaleString('en-US') + '   ·   Speed bonus $' + timeBonus.toLocaleString('en-US'), 640, 380);
  ctx.fillText('Total so far: $' + total.toLocaleString('en-US'), 640, 420);
  const blink = Math.sin(Date.now() / 300) > -0.2;
  if (blink) {
    ctx.fillStyle = '#39ff7a';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('PRESS ENTER FOR THE NEXT ROOM', 640, 500);
  }
}

export function drawWin(ctx, score, time, lootValue) {
  dimScreen(ctx, 0.6);
  bigTitle(ctx, 'THE GETAWAY', 220, '#ffd76a', 96);
  ctx.fillStyle = '#f2e6c8';
  ctx.font = 'bold 30px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HEIST COMPLETE — every room cleaned, every guard fooled.', 640, 310);
  ctx.fillStyle = '#c8cede';
  ctx.font = '21px system-ui, sans-serif';
  ctx.fillText('Loot lifted: $' + lootValue.toLocaleString('en-US') + '   ·   Total time: ' + fmtTime(time), 640, 360);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.fillText('FINAL SCORE  $' + score.toLocaleString('en-US'), 640, 430);
  const blink = Math.sin(Date.now() / 300) > -0.2;
  if (blink) {
    ctx.fillStyle = '#39ff7a';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('PRESS R TO RUN IT AGAIN', 640, 520);
  }
}
