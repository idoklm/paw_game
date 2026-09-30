// Sound effects made with Web Audio. No files, works offline.

let ctx = null;
let enabled = true;

export function setSfx(on) { enabled = on; }

export function unlockSfx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function tone(freq, start, dur, { type = 'sine', vol = 0.18, slideTo = null } = {}) {
  const t0 = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(start, dur, { vol = 0.12, from = 800, to = 3000 } = {}) {
  const t0 = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

const SOUNDS = {
  tap: () => tone(660, 0, 0.08, { type: 'triangle', vol: 0.1 }),
  correct: () => { tone(784, 0, 0.16); tone(988, 0.09, 0.16); tone(1319, 0.18, 0.3); },
  wrong: () => tone(330, 0, 0.32, { type: 'triangle', vol: 0.14, slideTo: 220 }),
  pop: () => { tone(500, 0, 0.12, { slideTo: 1400, vol: 0.16 }); noise(0, 0.08, { vol: 0.06 }); },
  whoosh: () => noise(0, 0.45, { vol: 0.1, from: 400, to: 2400 }),
  sparkle: () => [1568, 1976, 2349, 2637, 3136].forEach((f, i) => tone(f, i * 0.06, 0.22, { vol: 0.07 })),
  fanfare: () => {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.12, 0.2, { type: 'triangle', vol: 0.16 }));
    tone(1047, 0.36, 0.6, { type: 'triangle', vol: 0.18 });
    tone(784, 0.36, 0.6, { vol: 0.08 });
  },
  horn: () => { tone(392, 0, 0.14, { type: 'square', vol: 0.05 }); tone(392, 0.2, 0.18, { type: 'square', vol: 0.05 }); },
  boing: () => tone(180, 0, 0.35, { type: 'sine', vol: 0.18, slideTo: 420 }),
};

export function sfx(name) {
  if (!enabled || !ctx || !SOUNDS[name]) return;
  try { SOUNDS[name](); } catch { /* audio device busy */ }
}
