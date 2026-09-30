// Small UI icons (48 x 48 SVG). The game art itself is generated images (see sprites.js).

const INK = '#2B2340';

function starPath(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}

export const ICONS = {
  gear: `<svg viewBox="0 0 48 48"><path d="M24 6l4 1 1 5 4 2 4-3 3 3-3 4 2 4 5 1 1 4-1 4-5 1-2 4 3 4-3 3-4-3-4 2-1 5-4 1-4-1-1-5-4-2-4 3-3-3 3-4-2-4-5-1-1-4 1-4 5-1 2-4-3-4 3-3 4 3 4-2 1-5z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="24" r="7" fill="#8C93A8" stroke="${INK}" stroke-width="3"/></svg>`,
  map: `<svg viewBox="0 0 48 48"><path d="M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z" fill="#8CCB5E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M18 7v29M30 12v29" stroke="${INK}" stroke-width="3"/><path d="M10 26q8-8 14-2t14-6" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 3"/></svg>`,
  check: `<svg viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg viewBox="0 0 48 48"><path d="M24 10v28M10 24h28" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 48 48"><rect x="10" y="21" width="28" height="21" rx="5" fill="#B9C0D0" stroke="${INK}" stroke-width="3"/><path d="M16 21v-5a8 8 0 0 1 16 0v5" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="24" cy="31" r="3" fill="${INK}"/></svg>`,
  star: `<svg viewBox="0 0 48 48"><path d="${starPath(24, 25, 20, 9)}" fill="#FFD84A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  badges: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#F0B429" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="24" r="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="${starPath(24, 24.5, 8, 3.6)}" fill="#FFD84A" stroke="${INK}" stroke-width="2"/></svg>`,
  speaker: `<svg viewBox="0 0 48 48"><path d="M8 18h8l10-8v28l-10-8H8z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M32 17q5 7 0 14M36 12q9 12 0 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 48 48"><path d="M18 12l14 12-14 12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  down: `<svg viewBox="0 0 48 48"><path d="M24 44L6 22H16V4H32V22H42Z" fill="#FFC93C" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 48 48"><path d="M17 11l20 13-20 13z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`,
};
