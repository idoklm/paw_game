// Sort: drag each item to the sign with the same letter. Two signs, one item at a time.
// On the island station the two signs are a final letter and its regular form (ם and מ).
// Hints: a wrong sign sends the item back; after two misses the right sign glows.

import { letterPhrase } from '../phrases.js';
import { LETTER } from '../curriculum.js';
import { h, shuffle } from '../ui.js';
import { makeItem, centerIn, idleTimer } from './kit.js';

export const goalsFor = (env) => env.pace.goals;

function pickPair(env) {
  const finals = env.st.letters.filter((c) => LETTER[c].base);
  if (finals.length) {
    const f = shuffle(finals)[0];
    return shuffle([f, LETTER[f].base]);
  }
  return shuffle(env.st.letters).slice(0, 2);
}

export async function play(env) {
  const { play: layer, ctx, stage } = env;
  const pair = pickPair(env);
  const boards = pair.map((ch, i) => {
    const el = h(`<div class="board enter" aria-label="${ch}"><span class="glyph">${ch}</span></div>`);
    el.style.left = `${i ? 760 : 360}px`;
    el.style.top = '600px';
    el.style.animationDelay = `${i * 0.1}s`;
    layer.append(el);
    return { ch, el };
  });
  const order = [];
  for (let i = 0; i < goalsFor(env); i++) order.push(pair[i % 2]);
  env.say('sort.intro');
  await env.wait(1500);

  for (const ch of shuffle(order)) {
    ctx.check();
    await one(env, ch, boards, layer, stage);
  }
  boards.forEach((b) => env.popOut(b.el));
  await env.wait(400);
  ctx.check();
}

function one(env, ch, boards, layer, stage) {
  const { ctx } = env;
  const home = { x: 560, y: 250 };
  const item = makeItem(env.itemType, ch);
  item.classList.add('enter', 'draggable');
  item.style.left = `${home.x}px`;
  item.style.top = `${home.y}px`;
  layer.append(item);
  env.say(letterPhrase('name', ch));
  const right = boards.find((b) => b.ch === ch);
  let misses = 0, solved = false;

  return new Promise((resolve, reject) => {
    const idle = idleTimer(ctx, 10000, (n) => {
      if (n >= 2) right.el.classList.add('hint');
      env.say(letterPhrase('name', ch));
    });
    ctx.onLeave(() => reject(env.abort()));
    let drag = null;
    const toStage = (e) => {
      const sr = stage.getBoundingClientRect();
      const k = sr.width / 1280;
      return { x: (e.clientX - sr.left) / k, y: (e.clientY - sr.top) / k };
    };
    const move = (x, y) => { item.style.left = `${x}px`; item.style.top = `${y}px`; };
    item.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!ctx.alive || solved) return;
      idle.poke();
      item.classList.remove('enter');
      item.setPointerCapture(e.pointerId);
      const p = toStage(e);
      drag = { dx: parseFloat(item.style.left) - p.x, dy: parseFloat(item.style.top) - p.y };
      item.classList.add('dragging');
      env.sfx('tap');
    });
    item.addEventListener('pointermove', (e) => {
      if (!drag || solved) return;
      const p = toStage(e);
      move(p.x + drag.dx, p.y + drag.dy);
      for (const b of boards) {
        const c = centerIn(b.el, stage);
        b.el.classList.toggle('near', Math.hypot(c.x - (p.x + drag.dx), c.y - (p.y + drag.dy)) < 170);
      }
    });
    const drop = async (e) => {
      if (!drag || solved) return;
      drag = null;
      item.classList.remove('dragging');
      const at = { x: parseFloat(item.style.left), y: parseFloat(item.style.top) };
      const target = boards.find((b) => { const c = centerIn(b.el, stage); return Math.hypot(c.x - at.x, c.y - at.y) < 170; });
      boards.forEach((b) => b.el.classList.remove('near'));
      if (!target) {
        item.animate([{ left: `${at.x}px`, top: `${at.y}px` }, { left: `${home.x}px`, top: `${home.y}px` }], { duration: 350, easing: 'ease-out' });
        move(home.x, home.y);
        return;
      }
      env.record(ch, target.ch, misses === 0);
      if (target === right) {
        solved = true;
        idle.stop();
        const c = centerIn(target.el, stage);
        item.animate([{ left: `${at.x}px`, top: `${at.y}px` }, { left: `${c.x}px`, top: `${c.y - 20}px` }], { duration: 220, easing: 'ease-out', fill: 'forwards' });
        move(c.x, c.y - 20);
        env.sfx('correct');
        env.sparkle(c.x, c.y);
        env.actor.cheer();
        target.el.classList.remove('hint');
        target.el.classList.add('got');
        setTimeout(() => target.el.classList.remove('got'), 600);
        await env.wait(250);
        env.say(env.praiseId());
        await env.goal(item);
        resolve();
        return;
      }
      misses++;
      env.sfx('boing');
      env.actor.oops();
      env.wobble(target.el);
      item.animate([{ left: `${at.x}px`, top: `${at.y}px` }, { left: `${home.x}px`, top: `${home.y}px` }], { duration: 400, easing: 'ease-out' });
      move(home.x, home.y);
      env.say('sort.try');
      if (misses >= 2) right.el.classList.add('hint');
    };
    item.addEventListener('pointerup', drop);
    item.addEventListener('pointercancel', drop);
  });
}
