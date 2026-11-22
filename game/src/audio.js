// audio.js — every sound is synthesized with WebAudio: no audio files,
// no network. The context is created on the first user gesture (browsers
// refuse audio before one), and every call is safe when it is missing,
// so the game also runs silently in a headless screenshot run.

let ctx = null;
let master = null;
let muted = false;
let humNodes = null;

function ensureCtx() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch (err) {
    ctx = null;
  }
  return ctx;
}

// Call from any user gesture (key or click) to unlock audio.
export function unlockAudio() {
  const c = ensureCtx();
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {});
  }
  startHum();
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

// One short tone, optionally sliding to a second frequency.
function tone(freq, dur, type, gain, slideTo) {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  try {
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    g.gain.setValueAtTime(gain || 0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch (err) {
    // Audio is decoration: never let it break the game.
  }
}

// A soft filtered-noise puff (smoke, footsteps, the EMP zap).
function noiseBurst(dur, gain, filterFreq) {
  if (muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  try {
    const t0 = c.currentTime;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 900;
    const g = c.createGain();
    g.gain.setValueAtTime(gain || 0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(master);
    src.start(t0);
  } catch (err) {
    // Audio is decoration: never let it break the game.
  }
}

export function sfxCoin() {
  tone(1320, 0.09, 'triangle', 0.16);
  setTimeout(() => tone(1760, 0.12, 'triangle', 0.14), 70);
}

export function sfxPickup() {
  tone(660, 0.1, 'sine', 0.16);
  setTimeout(() => tone(880, 0.1, 'sine', 0.16), 80);
  setTimeout(() => tone(1320, 0.16, 'sine', 0.14), 160);
}

export function sfxSpotted() {
  tone(220, 0.22, 'sawtooth', 0.18, 440);
}

export function sfxAlarmTick() {
  tone(980, 0.07, 'square', 0.07);
}

export function sfxSmoke() {
  noiseBurst(0.5, 0.2, 700);
}

export function sfxEMP() {
  noiseBurst(0.35, 0.2, 3200);
  tone(1800, 0.3, 'sawtooth', 0.08, 120);
}

export function sfxStep() {
  noiseBurst(0.05, 0.045, 500);
}

export function sfxCaught() {
  tone(330, 0.25, 'sawtooth', 0.2, 110);
  setTimeout(() => tone(220, 0.4, 'sawtooth', 0.2, 55), 200);
}

export function sfxRoomClear() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => setTimeout(() => tone(n, 0.18, 'triangle', 0.16), i * 110));
}

export function sfxWin() {
  const notes = [523, 659, 784, 1046, 1318, 1568];
  notes.forEach((n, i) => setTimeout(() => tone(n, 0.28, 'triangle', 0.16), i * 140));
}

// Low ambient hum of the museum at night: a quiet drone that starts
// after the first gesture and never stops.
function startHum() {
  if (humNodes || muted) return;
  const c = ensureCtx();
  if (!c || !master) return;
  try {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55;
    const osc2 = c.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 55.7;
    const g = c.createGain();
    g.gain.value = 0.035;
    osc.connect(g);
    osc2.connect(g);
    g.connect(master);
    osc.start();
    osc2.start();
    humNodes = { osc, osc2, g };
  } catch (err) {
    humNodes = null;
  }
}
