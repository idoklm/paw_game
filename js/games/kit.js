// Shared tools for the mini-games. mission.js builds one `env` per mission and passes it to each game.

import { sprite, ITEM_GLYPH } from '../art/sprites.js';
import { LETTERS, confusable } from '../curriculum.js';
import { letterStatus } from '../store.js';
import { h, shuffle, Abort } from '../ui.js';

export const REGULAR = LETTERS.filter((l) => !l.base).map((l) => l.ch);

// A letter on a themed item (bubble, crate, ...). size: '' | 'big' | 'small'.
export function makeItem(type, ch, size = '') {
  const g = ITEM_GLYPH[type];
  const el = h(`<div class="item ${type} ${size}" role="button" aria-label="${ch}">
<div class="item-body"><img class="item-art" src="${sprite(`item-${type}`)}" alt="" draggable="false">
<span class="glyph" style="left:${g.x * 100}%;top:${g.y * 100}%;--gs:${g.s}">${ch}</span></div></div>`);
  el.dataset.ch = ch;
  return el;
}

// Resolves on the first touch of `el`. Calls idle() after idleMs without a touch, again and again.
export function tapOnce(ctx, el, idle, idleMs = 9000) {
  return new Promise((resolve, reject) => {
    let timer = null, settled = false;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (!ctx.alive || settled) return;
        await idle();
        if (ctx.alive && !settled) arm();
      }, idleMs);
    };
    const handler = (e) => { e.preventDefault(); cleanup(); resolve(e); };
    const cleanup = () => { settled = true; clearTimeout(timer); el.removeEventListener('pointerdown', handler); };
    el.addEventListener('pointerdown', handler);
    ctx.onLeave(() => { cleanup(); reject(new Abort()); });
    arm();
  });
}

// A repeating idle reminder. Returns { poke() to restart the wait, stop() }.
export function idleTimer(ctx, ms, fn) {
  let timer = null, count = 0, stopped = false;
  const arm = () => {
    clearTimeout(timer);
    if (stopped) return;
    timer = setTimeout(() => { if (!ctx.alive || stopped) return; count++; fn(count); arm(); }, ms);
  };
  ctx.onLeave(() => { stopped = true; clearTimeout(timer); });
  arm();
  return { poke() { arm(); }, stop() { stopped = true; clearTimeout(timer); } };
}

// Distractor letters for a target: known letters first, never a look-alike for young children
// unless the child already knows both letters.
export function distractors(env, target, count) {
  const { p, young, known, st } = env;
  const allowed = (c) => c !== target && (!young || !confusable(c, target) || (letterStatus(p, c) === 'known' && letterStatus(p, target) === 'known'));
  const cur = shuffle(st.letters.filter(allowed));
  const others = shuffle(known.filter((c) => allowed(c) && !st.letters.includes(c)));
  const picks = [];
  for (const c of [cur[0], ...others, ...cur.slice(1)]) {
    if (picks.length >= count) break;
    if (c && !picks.includes(c)) picks.push(c);
  }
  if (picks.length < count) {
    for (const c of shuffle(REGULAR)) {
      if (picks.length >= count) break;
      if (allowed(c) && !picks.includes(c) && !confusable(c, target)) picks.push(c);
    }
  }
  return picks;
}

// Targets for a game: the new letters first (each at least once), then weak review letters.
export function targetsFor(env, count) {
  const list = shuffle(env.st.letters).slice(0, count);
  const review = shuffle(env.known.filter((c) => !env.st.letters.includes(c) && letterStatus(env.p, c) !== 'known'));
  while (list.length < count) list.push(review.length ? review.shift() : env.st.letters[list.length % env.st.letters.length]);
  // never the same letter twice in a row
  for (let tries = 0; tries < 30; tries++) {
    const s = shuffle(list);
    if (s.every((c, i) => i === 0 || c !== s[i - 1])) return s;
  }
  return list;
}

export function centerIn(el, stage) {
  const r = el.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const k = sr.width / 1280;
  return { x: (r.left + r.width / 2 - sr.left) / k, y: (r.top + r.height / 2 - sr.top) / k };
}
