// geom.js — small geometry helpers shared by the player, the guards and the
// cameras. Everything here is pure math: no DOM, no canvas, no network.

// Clamp a value into [lo, hi].
export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// Euclidean distance between two points.
export function dist(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Angle from (x1, y1) to (x2, y2), in radians.
export function angleTo(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// Smallest signed difference between two angles, in [-PI, PI].
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// True when the circle (cx, cy, r) touches or overlaps rect {x, y, w, h}.
export function circleHitsRect(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

// Push a circle out of a rectangle it overlaps. Returns a corrected
// {x, y}; when there is no overlap the position is unchanged.
export function resolveCircleRect(cx, cy, r, rect) {
  const nx = clamp(cx, rect.x, rect.x + rect.w);
  const ny = clamp(cy, rect.y, rect.y + rect.h);
  let dx = cx - nx;
  let dy = cy - ny;
  const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return { x: cx, y: cy };
  if (d2 === 0) {
    // Centre is inside the rectangle: push out along the smallest axis.
    const left = cx - rect.x;
    const right = rect.x + rect.w - cx;
    const top = cy - rect.y;
    const bottom = rect.y + rect.h - cy;
    const m = Math.min(left, right, top, bottom);
    if (m === left) return { x: rect.x - r, y: cy };
    if (m === right) return { x: rect.x + rect.w + r, y: cy };
    if (m === top) return { x: cx, y: rect.y - r };
    return { x: cx, y: rect.y + rect.h + r };
  }
  const d = Math.sqrt(d2);
  dx /= d;
  dy /= d;
  return { x: nx + dx * r, y: ny + dy * r };
}

// True when the segment (x1, y1)-(x2, y2) touches rect {x, y, w, h}.
// Slab test: the segment enters the rect's x-slab and y-slab at the same time.
export function segmentHitsRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  // X slab.
  if (dx === 0) {
    if (x1 < rect.x || x1 > rect.x + rect.w) return false;
  } else {
    let t1 = (rect.x - x1) / dx;
    let t2 = (rect.x + rect.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  // Y slab.
  if (dy === 0) {
    if (y1 < rect.y || y1 > rect.y + rect.h) return false;
  } else {
    let t1 = (rect.y - y1) / dy;
    let t2 = (rect.y + rect.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

// True when the segment from A to B crosses the circle (cx, cy, r).
export function segmentHitsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 0) t = clamp(((cx - x1) * dx + (cy - y1) * dy) / len2, 0, 1);
  const px = x1 + dx * t;
  const py = y1 + dy * t;
  const ox = px - cx;
  const oy = py - cy;
  return ox * ox + oy * oy < r * r;
}

// Line of sight: true when no blocker rectangle stands between the points.
export function losClear(x1, y1, x2, y2, blockers) {
  for (let i = 0; i < blockers.length; i++) {
    if (segmentHitsRect(x1, y1, x2, y2, blockers[i])) return false;
  }
  return true;
}

// Is the point (x, y) inside rect (with a small margin allowed)?
export function pointInRect(x, y, rect, margin) {
  const m = margin || 0;
  return x >= rect.x - m && x <= rect.x + rect.w + m &&
    y >= rect.y - m && y <= rect.y + rect.h + m;
}
