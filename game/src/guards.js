// guards.js — the museum's night watch: patrolling guards with vision
// cones, and the fixed CCTV cameras that sweep their arcs.
// A guard patrols its waypoints, investigates a thrown coin, and chases
// a thief it has just seen. A camera never moves, but its lens sweeps.

import { angleTo, angleDiff, dist, losClear, segmentHitsCircle } from './geom.js';

// Build a guard from a level definition.
export function createGuard(def, index) {
  return {
    kind: 'guard',
    index,
    x: def.x,
    y: def.y,
    r: 16,
    speed: def.speed,
    fov: def.fov,
    range: def.range,
    waypoints: def.waypoints,
    wpIndex: 1,
    angle: 0,
    state: 'patrol',       // patrol | investigate | chase
    stateT: 0,
    investigateX: 0,
    investigateY: 0,
    lastSeenX: 0,
    lastSeenY: 0,
    seenT: 0,              // seconds since the guard last saw the thief
    pauseT: 0,
  };
}

// Build a camera from a level definition.
export function createCamera(def, index) {
  return {
    kind: 'camera',
    index,
    x: def.x,
    y: def.y,
    base: def.base,
    sweep: def.sweep,
    rate: def.rate,
    range: def.range,
    fov: def.fov,
    angle: def.base,
    phase: index * 1.7,    // cameras start out of phase with each other
    disabledT: 0,          // seconds of EMP shutdown left
  };
}

// Can watcher (guard or camera) see the point (px, py)?
// Sight needs: inside range, inside the cone, a clear line, and no smoke
// between the watcher and the point (or hiding the point itself).
export function canSee(watcher, px, py, blockers, smokes) {
  const d = dist(watcher.x, watcher.y, px, py);
  if (d > watcher.range) return false;
  if (Math.abs(angleDiff(angleTo(watcher.x, watcher.y, px, py), watcher.angle)) > watcher.fov / 2) return false;
  if (!losClear(watcher.x, watcher.y, px, py, blockers)) return false;
  for (let i = 0; i < smokes.length; i++) {
    const s = smokes[i];
    if (dist(px, py, s.x, s.y) < s.r) return false; // thief hidden in smoke
    if (segmentHitsCircle(watcher.x, watcher.y, px, py, s.x, s.y, s.r)) return false;
  }
  return true;
}

// Move a guard one step. Returns 'seen' when the guard spots the thief
// this frame, so the caller can raise the alarm.
export function updateGuard(g, dt, t, player, blockers, smokes, coins) {
  g.seenT += dt;
  let seen = false;

  // A coin landing nearby pulls a patrolling guard over to look.
  if (g.state === 'patrol') {
    for (let i = 0; i < coins.length; i++) {
      const c = coins[i];
      if (dist(g.x, g.y, c.x, c.y) < 300) {
        g.state = 'investigate';
        g.stateT = 0;
        g.investigateX = c.x;
        g.investigateY = c.y;
        break;
      }
    }
  }

  if (g.state === 'patrol') {
    const wp = g.waypoints[g.wpIndex];
    const d = dist(g.x, g.y, wp[0], wp[1]);
    if (d < 6) {
      g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
      g.pauseT = 0.7; // a beat at each end of the route, looking around
    } else if (g.pauseT > 0) {
      g.pauseT -= dt;
      g.angle += dt * 0.9; // slow scan while paused
    } else {
      const a = angleTo(g.x, g.y, wp[0], wp[1]);
      g.angle = a;
      g.x += Math.cos(a) * g.speed * dt;
      g.y += Math.sin(a) * g.speed * dt;
    }
  } else if (g.state === 'investigate') {
    g.stateT += dt;
    const d = dist(g.x, g.y, g.investigateX, g.investigateY);
    if (d > 8) {
      const a = angleTo(g.x, g.y, g.investigateX, g.investigateY);
      g.angle = a;
      g.x += Math.cos(a) * g.speed * 1.15 * dt;
      g.y += Math.sin(a) * g.speed * 1.15 * dt;
    } else if (g.stateT > 3.2) {
      g.state = 'patrol';
      g.stateT = 0;
    } else {
      g.angle += dt * 1.4; // look around the spot where the coin fell
    }
  } else if (g.state === 'chase') {
    g.stateT += dt;
    const d = dist(g.x, g.y, g.lastSeenX, g.lastSeenY);
    if (d > 10 && g.stateT < 2.2) {
      const a = angleTo(g.x, g.y, g.lastSeenX, g.lastSeenY);
      g.angle = a;
      g.x += Math.cos(a) * g.speed * 1.7 * dt;
      g.y += Math.sin(a) * g.speed * 1.7 * dt;
    } else {
      g.state = 'patrol';
      g.stateT = 0;
    }
  }

  // Sight check: only a live guard (not blinded by smoke) can spot.
  let blinded = false;
  for (let i = 0; i < smokes.length; i++) {
    if (dist(g.x, g.y, smokes[i].x, smokes[i].y) < smokes[i].r) { blinded = true; break; }
  }
  if (!blinded && canSee(g, player.x, player.y, blockers, smokes)) {
    seen = true;
    g.seenT = 0;
    g.lastSeenX = player.x;
    g.lastSeenY = player.y;
    if (g.state !== 'chase') {
      g.state = 'chase';
      g.stateT = 0;
    } else {
      // Still looking at the thief: the chase does not time out
      // while the thief stays in sight.
      g.stateT = 0;
    }
  }
  return seen;
}

// Sweep a camera's lens. Returns 'seen' when it spots the thief.
export function updateCamera(cam, dt, t, player, blockers, smokes) {
  if (cam.disabledT > 0) {
    cam.disabledT -= dt;
    return false;
  }
  cam.angle = cam.base + Math.sin(t * cam.rate + cam.phase) * cam.sweep;
  return canSee(cam, player.x, player.y, blockers, smokes);
}

// True when any guard stands close enough to grab the thief.
export function guardTouching(guards, player) {
  for (let i = 0; i < guards.length; i++) {
    if (dist(guards[i].x, guards[i].y, player.x, player.y) < guards[i].r + player.r + 2) {
      return guards[i];
    }
  }
  return null;
}
