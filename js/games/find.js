// Find the letter: three items, one has the letter the captain asks for.
// Hints: 1st mistake = the captain names the touched letter and asks again; 2nd = the right item
// glows and jumps; 3rd = the other items fade and the captain points to it. Idle 9 s = ask again.

import { letterPhrase } from '../phrases.js';
import { shuffle } from '../ui.js';
import { makeItem, distractors, targetsFor, centerIn } from './kit.js';

export const goalsFor = (env) => env.pace.goals;

export async function play(env) {
  for (const t of targetsFor(env, goalsFor(env))) await round(env, t);
}

async function round(env, target) {
  const { play: layer, ctx, stage } = env;
  const choices = shuffle([target, ...distractors(env, target, env.pace.choices - 1)]);
  const xs = shuffle([250, 570, 890]);
  const ys = [440, 405, 455];
  const items = choices.map((ch, i) => {
    const el = makeItem(env.itemType, ch);
    el.style.left = `${xs[i]}px`;
    el.style.top = `${ys[i]}px`;
    el.classList.add('enter');
    el.style.animationDelay = `${i * 0.08}s`;
    layer.append(el);
    return { ch, el };
  });
  await env.wait(450);
  ctx.check();
  items.forEach(({ el }) => { el.classList.remove('enter'); el.style.animationDelay = ''; el.classList.add('float'); });
  const ask = () => env.say(letterPhrase('find', target));
  ask();

  await new Promise((resolve, reject) => {
    let mistakes = 0, idleCount = 0, done = false, hinted = false, idle = null;
    const right = items.find((i) => i.ch === target);
    const hint = (level) => {
      if (level >= 2) { hinted = true; right.el.classList.remove('float'); right.el.classList.add('hint'); }
      if (level >= 3) items.forEach((i) => { if (i !== right) i.el.classList.add('faded'); });
    };
    const armIdle = () => {
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!ctx.alive || done) return;
        if (++idleCount >= 2) hint(2);
        ask();
        armIdle();
      }, 9000);
    };
    ctx.onLeave(() => { clearTimeout(idle); reject(env.abort()); });
    for (const it of items) {
      it.el.addEventListener('pointerdown', async (e) => {
        e.preventDefault();
        if (done || !ctx.alive) return;
        armIdle();
        if (it.ch === target) {
          done = true;
          clearTimeout(idle);
          env.record(target, target, mistakes === 0 && !hinted);
          env.stopSpeech();
          env.sfx('correct');
          const c = centerIn(it.el, stage);
          env.sparkle(c.x, c.y);
          env.actor.cheer();
          items.forEach((o) => { if (o !== it) env.popOut(o.el); });
          it.el.classList.remove('float', 'hint');
          const voice = env.sayAll([letterPhrase('short', target), env.praiseId()]);
          await env.goal(it.el);
          await Promise.race([voice, env.wait(2200)]);
          resolve();
          return;
        }
        env.record(target, it.ch, mistakes === 0 && !hinted);
        mistakes++;
        env.sfx('wrong');
        env.actor.oops();
        env.wobble(it.el);
        if (mistakes === 1) env.sayAll([letterPhrase('name', it.ch), letterPhrase('find', target)]);
        else if (mistakes === 2) { hint(2); env.sayAll(['look', letterPhrase('find', target)]); }
        else { hint(3); env.say(letterPhrase('here', target)); }
      });
    }
    armIdle();
  });
  ctx.check();
}
