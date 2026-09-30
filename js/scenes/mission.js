// A rescue mission = one short lesson (about 2 to 3 minutes):
// 1. A short story.  2. The new letters, one by one.  3. Two different mini-games.  4. Badges.
// The mini-games change between stations and on a replay. The child never fails.

import { ICONS } from '../art/icons.js';
import { bg, sprite, ITEM_FOR_THEME } from '../art/sprites.js';
import { STATION, PACE, GAMES, lettersBefore } from '../curriculum.js';
import { say, sayAll, stopSpeech } from '../audio.js';
import { PRAISE_IDS, letterPhrase } from '../phrases.js';
import { sfx } from '../sfx.js';
import { h, onTap, onHold, iconButton, captainRadio, puppyActor, confetti, sparkle, wait, pick, shuffle, sceneBg, Abort } from '../ui.js';
import { getProfile, recordAnswer, completeStation, updateProfile } from '../store.js';
import { makeItem, tapOnce, centerIn } from '../games/kit.js';
import * as find from '../games/find.js';
import * as catcher from '../games/catch.js';
import * as memory from '../games/memory.js';
import * as sort from '../games/sort.js';
import * as paint from '../games/paint.js';

const MINI = { find, catch: catcher, memory, sort, paint };

const PAW = `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="31" rx="11" ry="9" fill="#2B2340"/><circle cx="12" cy="19" r="5" fill="#2B2340"/><circle cx="20" cy="12" r="5" fill="#2B2340"/><circle cx="28" cy="12" r="5" fill="#2B2340"/><circle cx="36" cy="19" r="5" fill="#2B2340"/></svg>`;

// First visit: the station's own two games. A replay: two other games, different from last time.
function chooseGames(p, st) {
  if (!p.done[st.n]) return st.games;
  const last = (p.lastGames || {})[st.n] || st.games;
  const pool = shuffle(GAMES.filter((g) => !last.includes(g)));
  return [pool[0], pool[1] || shuffle(GAMES)[0]];
}

export async function show(root, params, ctx, go) {
  const p = getProfile(params.profile);
  const n = Number(params.n);
  const st = STATION[n];
  if (!p || !st) { go('profiles', {}); return; }
  const pace = PACE[p.age] || PACE['5-6'];
  const itemType = ITEM_FOR_THEME[st.theme];
  const stage = document.getElementById('stage');
  const games = chooseGames(p, st);
  updateProfile(p.id, { lastGames: { ...(p.lastGames || {}), [n]: games } });

  root.innerHTML = sceneBg(bg(`bg-${st.theme}`));
  const layer = h('<div class="play"></div>');
  root.append(layer);
  const actor = puppyActor(p.puppy, 'm-actor enter');
  root.append(actor.el);
  ctx.onLeave(actor.bindTalk());
  const radio = captainRadio(root);
  ctx.onLeave(() => radio.destroy());
  const home = iconButton(ICONS.map, 'corner-tl small parent-btn');
  onHold(home, 1200, () => go('map', { profile: p.id }));
  root.append(home);

  const env = {
    root, play: layer, stage, ctx, p, st, pace, itemType, actor, radio,
    young: p.age === '3-4',
    known: [...lettersBefore(n), ...st.letters],
    // After the scene is left, late handlers must not speak or play sounds on the next screen.
    say: (id) => (ctx.alive ? say(id) : Promise.resolve(false)),
    sayAll: (ids) => (ctx.alive ? sayAll(ids) : Promise.resolve(false)),
    sfx: (name) => { if (ctx.alive) sfx(name); },
    stopSpeech, wait,
    abort: () => new Abort(),
    praiseId: () => pick(PRAISE_IDS),
    record: (target, chosen, firstTry) => recordAnswer(p, target, chosen, firstTry),
    sparkle: (x, y) => sparkle(layer, x, y),
    sparkleEl: (el) => { const c = centerIn(el, stage); sparkle(layer, c.x, c.y); },
    popOut: (el) => el.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 260, fill: 'forwards' }).finished.then(() => el.remove()).catch(() => {}),
    wobble: (el) => { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); setTimeout(() => el.classList.remove('wrong'), 520); },
  };

  // progress: one paw per goal, a star at the end
  const prog = h('<div class="progress"></div>');
  root.append(prog);
  const total = games.reduce((s, g) => s + MINI[g].goalsFor(env), 0);
  for (let i = 0; i < total; i++) prog.append(h(`<div class="dot">${PAW}</div>`));
  prog.append(h(`<div class="dot big">${ICONS.star}</div>`));
  let filled = 0;
  // A goal: the item (if given) flies into the next paw, and the paw fills.
  env.goal = async (fromEl) => {
    const dot = prog.children[Math.min(filled, prog.children.length - 1)];
    filled++;
    if (fromEl && fromEl.isConnected) {
      const a = centerIn(fromEl, stage), b = centerIn(dot, stage);
      await fromEl.animate([
        { transform: 'translate(0,0) scale(1)' },
        { transform: `translate(${(b.x - a.x) * 0.5}px, ${(b.y - a.y) * 0.5 - 80}px) scale(.7)`, offset: 0.5 },
        { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(.15)`, opacity: 0.3 },
      ], { duration: 600, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {});
      fromEl.remove();
    }
    dot.classList.add('on');
    sfx('pop');
  };

  // ---------- 1. story ----------
  radio.show();
  await wait(400);
  ctx.check();
  await sayAll([`story.${st.theme}`, `ready.${p.puppy}`]);
  ctx.check();
  actor.cheer();
  if (n === 8) { await say('finalNote'); ctx.check(); }

  // ---------- 2. the new letters ----------
  for (const ch of st.letters) {
    const item = makeItem(itemType, ch, 'big');
    item.style.left = '560px';
    item.style.top = '450px';
    item.classList.add('enter');
    layer.append(item);
    sfx('whoosh');
    say(letterPhrase('intro', ch));
    await wait(500);
    ctx.check();
    item.classList.remove('enter');
    item.classList.add('float');
    await tapOnce(ctx, item, () => say(letterPhrase('intro', ch)));
    stopSpeech();
    sfx('correct');
    env.sparkleEl(item);
    actor.cheer(900);
    item.classList.remove('float');
    item.classList.add('tapped');
    await say(letterPhrase('short', ch));
    ctx.check();
    await env.popOut(item);
  }

  // ---------- 3. two mini-games ----------
  for (let i = 0; i < games.length; i++) {
    if (i > 0) {
      await say('nextGame');
      ctx.check();
    }
    await MINI[games[i]].play(env);
    ctx.check();
  }

  // ---------- 4. badges ----------
  prog.lastElementChild.classList.add('on');
  const fresh = completeStation(p, n, st.letters);
  sfx('fanfare');
  confetti(root, { x: 640, y: 260, count: 90 });
  actor.cheerOn();
  radio.cheer(true);
  await say('done');
  ctx.check();
  radio.cheer(false);
  const row = h('<div class="badge-row"></div>');
  root.append(row);
  for (const ch of st.letters) {
    const b = h(`<div class="badge enter"><img src="${sprite('item-badge')}" alt="" draggable="false"><span class="glyph">${ch}</span></div>`);
    row.append(b);
    sfx('sparkle');
    await say(fresh.includes(ch) ? letterPhrase('badge', ch) : letterPhrase('short', ch));
    ctx.check();
  }
  actor.rest();
  say('backToMap');
  const back = h(`<button class="big-btn pulse" type="button" aria-label="חזרה למפה" style="left:565px;top:560px">${ICONS.map}</button>`);
  onTap(back, () => go('map', { profile: p.id }));
  root.append(back);
  await tapOnce(ctx, back, () => say('backToMap'), 12000).catch(() => {});
}
