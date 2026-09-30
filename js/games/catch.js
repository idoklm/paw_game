// Catch: items move across the screen; touch every item with the asked letter.
// Motion depends on the item: bubbles and balloons rise, apples and stars fall, fish and crates
// swim to the left, shells and eggs pop up in place.

import { letterPhrase } from '../phrases.js';
import { confusable } from '../curriculum.js';
import { shuffle, pick } from '../ui.js';
import { makeItem, centerIn, REGULAR } from './kit.js';

const MOTION = { bubble: 'up', balloon: 'up', fish: 'left', crate: 'left', apple: 'down', star: 'down', shell: 'pop', egg: 'pop' };

export const goalsFor = (env) => env.pace.goals;

export async function play(env) {
  const { play: layer, ctx, stage, pace, young } = env;
  const target = pick(env.st.letters);
  const motion = MOTION[env.itemType];
  const need = goalsFor(env);
  const speed = pace.catchSpeed;
  let distract = shuffle([...env.st.letters, ...env.known]).filter((c) => c !== target && (!young || !confusable(c, target)));
  if (distract.length < 2) distract = distract.concat(shuffle(REGULAR).filter((c) => c !== target && !confusable(c, target)).slice(0, 4));
  let popped = 0, wrongTaps = 0, over = false;
  const live = [];
  const lanesX = [150, 330, 510, 690, 870];
  const lanesY = [300, 450, 600];
  const slots = [[170, 290], [410, 250], [650, 290], [890, 260], [250, 530], [490, 570], [730, 550], [930, 480]];

  const spawn = (i, first = false) => {
    if (over) return;
    const onScreen = live.filter((o) => o && o.ch === target && !o.gone).length;
    const ch = onScreen < 1 || Math.random() < 0.4 ? target : pick(distract);
    const el = makeItem(env.itemType, ch, 'small');
    const o = { ch, el, gone: false, t0: performance.now(), phase: Math.random() * 6.28 };
    // First items start spread over the screen, so there is something to touch at once.
    const spread = (a0, a1) => a0 + ((a1 - a0) * ((i * 0.618) % 1));
    if (motion === 'up') { o.x = lanesX[i % lanesX.length]; o.y = first ? spread(320, 820) : 900; }
    else if (motion === 'down') { o.x = lanesX[i % lanesX.length]; o.y = first ? spread(-80, 420) : -140; }
    else if (motion === 'left') { o.y = lanesY[i % lanesY.length]; o.x = first ? spread(200, 1300) : 1400; }
    else { const s = slots[i % slots.length]; o.x = s[0]; o.y = s[1]; o.life = (young ? 5200 : 3900) + Math.random() * 800; el.classList.add('enter'); }
    el.style.left = `${o.x}px`;
    el.style.top = `${o.y}px`;
    layer.append(el);
    live[i] = o;
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (o.gone || over || !ctx.alive) return;
      if (o.ch === target) {
        if (popped >= need) return;
        o.gone = true;
        popped++;
        if (popped >= need) over = true;
        env.sfx('pop');
        const c = centerIn(el, stage);
        env.sparkle(c.x, c.y);
        env.actor.cheer(700);
        env.popOut(el);
        env.goal();
        if (popped < need) setTimeout(() => ctx.alive && !over && spawn(i), 700);
      } else {
        wrongTaps++;
        env.sfx('boing');
        env.wobble(el);
        if (wrongTaps % 2 === 0) env.say(letterPhrase('catch', target));
      }
    });
  };

  for (let i = 0; i < pace.catchItems; i++) spawn(i, true);
  env.say(letterPhrase('catch', target));
  let lastTalk = performance.now();

  await new Promise((resolve, reject) => {
    let last = performance.now(), raf = 0;
    ctx.onLeave(() => { cancelAnimationFrame(raf); reject(env.abort()); });
    const tick = (now) => {
      if (!ctx.alive) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (let i = 0; i < live.length; i++) {
        const o = live[i];
        if (!o || o.gone) continue;
        const wob = Math.sin(now / 700 + o.phase) * 18;
        if (motion === 'up') { o.y -= speed * dt; if (o.y < -130) { o.gone = true; o.el.remove(); spawn(i); continue; } o.el.style.transform = `translateX(${wob}px)`; }
        else if (motion === 'down') { o.y += speed * dt; if (o.y > 900) { o.gone = true; o.el.remove(); spawn(i); continue; } o.el.style.transform = `translateX(${wob}px) rotate(${wob / 3}deg)`; }
        else if (motion === 'left') { o.x -= speed * 1.3 * dt; if (o.x < -140) { o.gone = true; o.el.remove(); spawn(i); continue; } o.el.style.transform = `translateY(${wob}px)`; }
        else if (now - o.t0 > o.life) { o.gone = true; env.popOut(o.el); setTimeout(() => ctx.alive && !over && spawn(i), 500); continue; }
        o.el.style.left = `${o.x}px`;
        o.el.style.top = `${o.y}px`;
      }
      if (now - lastTalk > 11000) { lastTalk = now; env.say(letterPhrase('catch', target)); }
      if (popped >= need) { over = true; resolve(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  for (const o of live) if (o && !o.gone) { o.gone = true; env.popOut(o.el); }
  await env.wait(400);
  ctx.check();
}
