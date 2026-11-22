// levels.js — the three rooms of the Meridian Museum heist.
// Each room is a floor plan: walls and cover block movement and sight,
// guards walk patrol routes, cameras sweep fixed arcs, loot waits to be
// lifted, and the exit opens only once every loot piece is taken.
// Coordinates are in the 1280x720 canvas space; the HUD bar owns y 0..76.

export const PLAY = { x: 40, y: 76, w: 1200, h: 636 };

// Shared boundary walls for every room (stone shell of the museum).
function boundaryWalls() {
  return [
    { x: 40, y: 76, w: 1200, h: 16 },    // top
    { x: 40, y: 696, w: 1200, h: 16 },   // bottom
    { x: 40, y: 76, w: 16, h: 636 },     // left
    { x: 1224, y: 76, w: 16, h: 636 },   // right
  ];
}

export const LEVELS = [
  {
    id: 0,
    name: 'THE GALLERY',
    sub: 'Room 1 of 3 — lift the Star Sapphire',
    par: 90,
    playerStart: { x: 92, y: 648 },
    // The exit trigger sits IN FRONT of the bottom wall (y 680), not
    // inside it: the wall pushes the thief's centre back to y 682, so a
    // trigger at y 696 could never be stepped into.
    exit: { x: 600, y: 680, w: 80, h: 16, label: 'EXIT' },
    walls: [
      ...boundaryWalls(),
      // Mid partition with THREE gaps: left corridor, centre hall, right corridor.
      { x: 200, y: 380, w: 320, h: 16 },
      { x: 760, y: 380, w: 320, h: 16 },
    ],
    cover: [
      { x: 300, y: 150, w: 110, h: 60, kind: 'case' },
      { x: 700, y: 150, w: 110, h: 60, kind: 'case' },
      { x: 180, y: 500, w: 110, h: 60, kind: 'case' },
      { x: 900, y: 500, w: 110, h: 60, kind: 'case' },
      { x: 604, y: 260, w: 36, h: 36, kind: 'pillar' },
      { x: 604, y: 500, w: 36, h: 36, kind: 'pillar' },
    ],
    guards: [
      {
        x: 200, y: 160, speed: 60, fov: 1.25, range: 230,
        waypoints: [[200, 160], [1080, 160]],
      },
      {
        x: 1080, y: 600, speed: 55, fov: 1.25, range: 230,
        waypoints: [[1080, 600], [200, 600]],
      },
    ],
    cameras: [
      // Watches the centre gap of the mid partition.
      { x: 640, y: 92, base: Math.PI / 2, sweep: 0.9, rate: 0.55, range: 260, fov: 1.05 },
      { x: 1224, y: 380, base: Math.PI, sweep: 0.7, rate: 0.7, range: 240, fov: 1.0 },
    ],
    loot: [
      { x: 640, y: 130, kind: 'painting', value: 500, label: 'Star Sapphire portrait' },
      { x: 250, y: 530, kind: 'gold', value: 300, label: 'Gold bars' },
      { x: 1020, y: 150, kind: 'diamond', value: 800, label: 'The Meridian Diamond' },
    ],
  },
  {
    id: 1,
    name: 'THE VAULT',
    sub: 'Room 2 of 3 — crack the central safe',
    par: 110,
    playerStart: { x: 92, y: 648 },
    // Same fix as room 1: the trigger sits in front of the top wall
    // (y 92), where the thief's centre can actually reach it.
    exit: { x: 600, y: 92, w: 80, h: 16, label: 'EXIT' },
    walls: [
      ...boundaryWalls(),
      // Upper partition: centre gap only, watched from above.
      { x: 56, y: 300, w: 360, h: 16 },
      { x: 864, y: 300, w: 360, h: 16 },
      // Lower partition: three gaps, the safe sits between them.
      { x: 300, y: 520, w: 300, h: 16 },
      { x: 680, y: 520, w: 300, h: 16 },
    ],
    cover: [
      { x: 560, y: 340, w: 160, h: 140, kind: 'vault' },
      { x: 250, y: 150, w: 100, h: 55, kind: 'case' },
      { x: 930, y: 150, w: 100, h: 55, kind: 'case' },
      { x: 250, y: 600, w: 100, h: 55, kind: 'case' },
      { x: 930, y: 600, w: 100, h: 55, kind: 'case' },
      { x: 460, y: 420, w: 36, h: 36, kind: 'pillar' },
      { x: 800, y: 420, w: 36, h: 36, kind: 'pillar' },
    ],
    guards: [
      {
        x: 150, y: 150, speed: 65, fov: 1.25, range: 230,
        waypoints: [[150, 150], [1130, 150]],
      },
      {
        x: 150, y: 420, speed: 60, fov: 1.25, range: 230,
        waypoints: [[150, 420], [1130, 420]],
      },
      {
        x: 1130, y: 620, speed: 70, fov: 1.25, range: 230,
        waypoints: [[1130, 620], [150, 620]],
      },
    ],
    cameras: [
      { x: 640, y: 92, base: Math.PI / 2, sweep: 0.9, rate: 0.6, range: 260, fov: 1.05 },
      { x: 56, y: 420, base: 0, sweep: 0.7, rate: 0.75, range: 240, fov: 1.0 },
      { x: 1224, y: 620, base: Math.PI, sweep: 0.7, rate: 0.65, range: 240, fov: 1.0 },
    ],
    loot: [
      { x: 640, y: 180, kind: 'gold', value: 300, label: 'Vault gold' },
      { x: 200, y: 420, kind: 'gold', value: 300, label: 'Gold bars' },
      { x: 1080, y: 180, kind: 'painting', value: 500, label: 'The Duchess portrait' },
      { x: 640, y: 610, kind: 'diamond', value: 800, label: 'The Midnight Diamond' },
    ],
  },
  {
    id: 2,
    name: 'THE ROOFTOP',
    sub: 'Room 3 of 3 — grab the crown, reach the helicopter',
    par: 120,
    playerStart: { x: 92, y: 648 },
    exit: { cx: 1080, cy: 130, r: 56, circle: true, label: 'HELIPAD' },
    walls: [
      ...boundaryWalls(),
    ],
    cover: [
      { x: 300, y: 200, w: 140, h: 90, kind: 'ac' },
      { x: 800, y: 450, w: 140, h: 90, kind: 'ac' },
      { x: 200, y: 500, w: 40, h: 40, kind: 'pillar' },
      { x: 1000, y: 200, w: 40, h: 40, kind: 'pillar' },
    ],
    guards: [
      {
        x: 150, y: 150, speed: 70, fov: 1.25, range: 240,
        waypoints: [[150, 150], [1130, 150]],
      },
      {
        x: 1130, y: 600, speed: 65, fov: 1.25, range: 240,
        waypoints: [[1130, 600], [150, 600]],
      },
      {
        // The rover: fast, walks a square around the roof.
        x: 300, y: 250, speed: 95, fov: 1.35, range: 250,
        waypoints: [[300, 250], [980, 250], [980, 550], [300, 550]],
      },
    ],
    cameras: [
      { x: 56, y: 360, base: 0, sweep: 0.8, rate: 0.7, range: 250, fov: 1.05 },
      { x: 1224, y: 360, base: Math.PI, sweep: 0.8, rate: 0.7, range: 250, fov: 1.05 },
      { x: 640, y: 92, base: Math.PI / 2, sweep: 1.0, rate: 0.55, range: 260, fov: 1.05 },
    ],
    loot: [
      { x: 640, y: 150, kind: 'crown', value: 1000, label: 'The Meridian Crown' },
      { x: 200, y: 350, kind: 'painting', value: 500, label: 'The Rooftop canvas' },
      { x: 1050, y: 550, kind: 'gold', value: 300, label: 'Gold bars' },
      { x: 640, y: 620, kind: 'diamond', value: 800, label: 'The Dawn Diamond' },
    ],
  },
];
