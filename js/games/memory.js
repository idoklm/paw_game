// Memory: turn over cards and find two cards with the same letter.
// Each turned card says its letter name. After a few misses, one matching pair peeks open for a moment.

import { letterPhrase } from '../phrases.js';
import { h, shuffle, onTap } from '../ui.js';
import { makeItem, targetsFor, idleTimer } from './kit.js';

export const goalsFor = (env) => env.pace.pairs;

const PAW = `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="31" rx="10" ry="8.5" fill="#fff"/><circle cx="13" cy="20" r="4.6" fill="#fff"/><circle cx="20" cy="13" r="4.6" fill="#fff"/><circle cx="28" cy="13" r="4.6" fill="#fff"/><circle cx="35" cy="20" r="4.6" fill="#fff"/></svg>`;

export async function play(env) {
  const { play: layer, ctx } = env;
  const pairs = goalsFor(env);
  const letters = targetsFor(env, pairs).filter((c, i, a) => a.indexOf(c) === i);
  while (letters.length < pairs) letters.push(env.known.find((c) => !letters.includes(c)));
  const deck = shuffle([...letters, ...letters]);
  const cols = pairs === 2 ? 2 : 3;
  const x0 = 560 - ((cols - 1) * 230) / 2;
  const cards = deck.map((ch, i) => {
    const el = h(`<div class="mcard enter" role="button" aria-label="קלף"><div class="mcard-in">
<div class="mcard-face mcard-back">${PAW}</div><div class="mcard-face mcard-front"></div></div></div>`);
    el.querySelector('.mcard-front').append(makeItem(env.itemType, ch, 'card'));
    el.style.left = `${x0 + (i % cols) * 230}px`;
    el.style.top = `${300 + Math.floor(i / cols) * 265}px`;
    el.style.animationDelay = `${i * 0.06}s`;
    el.addEventListener('animationend', () => el.classList.remove('enter'), { once: true });
    layer.append(el);
    return { ch, el, open: false, matched: false };
  });
  env.say('memory.intro');

  await new Promise((resolve, reject) => {
    let first = null, lock = false, found = 0, misses = 0;
    const idle = idleTimer(ctx, 12000, () => env.say('memory.intro'));
    ctx.onLeave(() => reject(env.abort()));
    const flip = (c, open) => { c.open = open; c.el.classList.toggle('open', open); };
    const peek = async () => {
      const pair = cards.filter((c) => !c.matched && c.ch === cards.find((x) => !x.matched)?.ch);
      pair.forEach((c) => flip(c, true));
      await env.wait(1100);
      pair.forEach((c) => { if (!c.matched && c !== first) flip(c, false); });
    };
    for (const c of cards) {
      onTap(c.el, async () => {
        if (lock || c.open || c.matched || !ctx.alive) return;
        idle.poke();
        flip(c, true);
        env.say(letterPhrase('short', c.ch));
        if (!first) { first = c; return; }
        const a = first;
        first = null;
        lock = true;
        if (a.ch === c.ch) {
          a.matched = c.matched = true;
          await env.wait(350);
          env.sfx('correct');
          env.actor.cheer();
          for (const m of [a, c]) { m.el.classList.add('matched'); env.sparkleEl(m.el); }
          env.goal();
          found++;
          await env.wait(700);
          if (found >= pairs) {
            idle.stop();
            await Promise.race([env.say(env.praiseId()), env.wait(2000)]);
            resolve();
            return;
          }
          env.say(env.praiseId());
          lock = false;
        } else {
          misses++;
          await env.wait(900);
          env.sfx('boing');
          flip(a, false);
          flip(c, false);
          if (misses === 1 || misses % 3 === 0) env.say('memory.again');
          if (misses % (env.young ? 3 : 4) === 0) await peek();
          lock = false;
        }
      }, { sound: 'tap' });
    }
  });
  await env.wait(300);
  cards.forEach((c) => env.popOut(c.el));
  await env.wait(350);
  ctx.check();
}
