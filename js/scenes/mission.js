// A rescue mission = one lesson.
// 1. The captain tells the story.  2. Each new letter is shown and touched.
// 3. "Find the letter" rounds (3 choices) with hints.  4. A catch round.  5. Badges.
// The child never fails and never loses points.

import { missionBackdrop, itemSVG, ITEM_FOR_THEME, ICONS } from '../art/scenes.js';
import { puppySVG } from '../art/puppies.js';
import { STATION, LETTERS, PACE, lettersBefore, confusable } from '../curriculum.js';
import { say, sayAll, stopSpeech } from '../audio.js';
import { PRAISE_IDS, letterPhrase } from '../phrases.js';
import { sfx } from '../sfx.js';
import { h, onTap, onHold, iconButton, captainRadio, bindPuppyTalk, confetti, sparkle, wait, shuffle, pick, centerOf, Abort } from '../ui.js';
import { getProfile, recordAnswer, completeStation, letterStatus } from '../store.js';

const PAW = `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="31" rx="11" ry="9" fill="#2B2340"/><circle cx="12" cy="19" r="5" fill="#2B2340"/><circle cx="20" cy="12" r="5" fill="#2B2340"/><circle cx="28" cy="12" r="5" fill="#2B2340"/><circle cx="36" cy="19" r="5" fill="#2B2340"/></svg>`;

// How items move in the catch round.
const MOTION = { bubble: 'up', balloon: 'up', fish: 'left', crate: 'left', apple: 'down', star: 'down', shell: 'pop', egg: 'pop' };

const REGULAR = LETTERS.filter((l) => !l.base).map((l) => l.ch);

export async function show(root, params, ctx, go) {
  const p = getProfile(params.profile);
  const n = Number(params.n);
  const st = STATION[n];
  if (!p || !st) { go('profiles', {}); return; }
  const pace = PACE[p.age] || PACE['5-6'];
  const itemType = ITEM_FOR_THEME[st.theme];
  const stage = document.getElementById('stage');

  root.innerHTML = missionBackdrop(st.theme);
  const play = h('<div class="play"></div>');
  root.append(play);
  const pupWrap = h(`<div class="m-pup">${puppySVG(p.puppy)}</div>`);
  root.append(pupWrap);
  const pup = pupWrap.querySelector('.pup');
  ctx.onLeave(bindPuppyTalk(pup));
  const radio = captainRadio(root);
  ctx.onLeave(() => radio.destroy());
  const home = iconButton(ICONS.map, 'corner-tl small parent-btn');
  onHold(home, 1200, () => go('map', { profile: p.id }));
  root.append(home);

  const prog = h('<div class="progress"></div>');
  root.append(prog);
  const buildDots = (count) => {
    for (let i = 0; i < count; i++) prog.append(h(`<div class="dot">${PAW}</div>`));
    prog.append(h(`<div class="dot big">${ICONS.star}</div>`));
  };
  let filled = 0;
  const fillDot = () => { const d = prog.children[filled++]; if (d) d.classList.add('on'); };
  const nextDot = () => prog.children[filled] || prog.lastElementChild;

  let cheerTimer = null;
  const cheer = (ms = 1300) => {
    pup.classList.add('is-cheer');
    clearTimeout(cheerTimer);
    cheerTimer = setTimeout(() => pup.classList.remove('is-cheer'), ms);
  };

  const makeItem = (ch, size = '', variant = 0) => {
    const el = h(`<div class="item ${itemType} ${size}" role="button" aria-label="${ch}">${itemSVG(itemType, variant)}<span class="glyph">${ch}</span></div>`);
    el.dataset.ch = ch;
    return el;
  };

  // Resolves on the first touch of `el`. Calls idle() after idleMs without a touch, again and again.
  const tapOnce = (el, idle, idleMs = 9000) => new Promise((resolve, reject) => {
    let timer = null, settled = false;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => { if (!ctx.alive || settled) return; await idle(); if (ctx.alive && !settled) arm(); }, idleMs);
    };
    const handler = (e) => { e.preventDefault(); cleanup(); resolve(e); };
    const cleanup = () => { settled = true; clearTimeout(timer); el.removeEventListener('pointerdown', handler); };
    el.addEventListener('pointerdown', handler);
    ctx.onLeave(() => { cleanup(); reject(new Abort()); });
    arm();
  });

  const flyTo = (el, target, dur = 650) => {
    const a = centerOf(el, stage), b = centerOf(target, stage);
    return el.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${(b.x - a.x) * 0.5}px, ${(b.y - a.y) * 0.5 - 80}px) scale(.7)`, offset: 0.5 },
      { transform: `translate(${b.x - a.x}px, ${b.y - a.y}px) scale(.18)`, opacity: 0.4 },
    ], { duration: dur, easing: 'ease-in', fill: 'forwards' }).finished;
  };

  const popOut = (el) => el.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }], { duration: 260, fill: 'forwards' }).finished.then(() => el.remove());

  // ---------- step 2: new letters ----------
  async function intro(ch) {
    const item = makeItem(ch, 'big');
    item.style.left = '560px';
    item.style.top = '440px';
    item.classList.add('enter');
    play.append(item);
    sfx('whoosh');
    await say(letterPhrase('intro', ch));
    ctx.check();
    item.classList.remove('enter');
    item.classList.add('float');
    say(letterPhrase('touch', ch));
    await tapOnce(item, () => say(letterPhrase('touch', ch)));
    stopSpeech();
    sfx('correct');
    sparkle(play, 560, 440);
    cheer();
    item.classList.remove('float');
    item.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 400 });
    await say(letterPhrase('name', ch));
    ctx.check();
    await wait(200);
    await popOut(item);
  }

  // ---------- step 3: find the letter ----------
  function makeChoices(target) {
    const known = [...lettersBefore(n), ...st.letters];
    const young = p.age === '3-4';
    const allowed = (c) => c !== target && (!young || !confusable(c, target) || (letterStatus(p, c) === 'known' && letterStatus(p, target) === 'known'));
    const pool = known.filter(allowed);
    const cur = shuffle(st.letters.filter((c) => pool.includes(c)));
    const others = shuffle(pool.filter((c) => !st.letters.includes(c)));
    const picks = [];
    const want = pace.choices - 1;
    for (const c of [cur[0], ...others, ...cur.slice(1)]) {
      if (picks.length >= want) break;
      if (c && !picks.includes(c)) picks.push(c);
    }
    if (picks.length < want) {
      const extra = shuffle(REGULAR).filter((c) => allowed(c) && !picks.includes(c) && !confusable(c, target));
      picks.push(...extra.slice(0, want - picks.length));
    }
    return shuffle([target, ...picks]);
  }

  function planRounds() {
    const before = lettersBefore(n);
    const reviewCount = before.length ? Math.round(pace.rounds * 0.3) : 0;
    // Every new letter is asked at least once, even when a station has many letters.
    const newCount = Math.max(st.letters.length, pace.rounds - reviewCount);
    const list = [];
    for (let i = 0; i < newCount; i++) list.push(st.letters[i % st.letters.length]);
    const weak = shuffle(before.filter((c) => letterStatus(p, c) !== 'known'));
    const strong = shuffle(before.filter((c) => letterStatus(p, c) === 'known'));
    const review = [...weak, ...strong];
    for (let i = 0; i < reviewCount; i++) list.push(review[i % review.length]);
    // shuffle, but never the same target twice in a row
    for (let tries = 0; tries < 50; tries++) {
      const s = shuffle(list);
      if (s.every((c, i) => i === 0 || c !== s[i - 1])) return s;
    }
    return list;
  }

  async function findRound(target) {
    const choices = makeChoices(target);
    const xs = shuffle([250, 570, 890]);
    const ys = [430, 400, 450];
    const items = choices.map((ch, i) => {
      const el = makeItem(ch, '', Math.floor(Math.random() * 6));
      el.style.left = `${xs[i]}px`;
      el.style.top = `${ys[i]}px`;
      el.classList.add('enter');
      el.style.animationDelay = `${i * 0.08}s`;
      play.append(el);
      return { ch, el };
    });
    await wait(500);
    ctx.check();
    items.forEach(({ el }) => { el.classList.remove('enter'); el.style.animationDelay = ''; el.classList.add('float'); });
    const ask = () => say(letterPhrase('find', target));
    ask();

    await new Promise((resolve, reject) => {
      let mistakes = 0, idleCount = 0, done = false, idleTimer = null, hinted = false;
      const right = items.find((i) => i.ch === target);
      const hint = (level) => {
        if (level >= 2) { hinted = true; right.el.classList.remove('float'); right.el.classList.add('hint'); }
        if (level >= 3) items.forEach((i) => { if (i !== right) i.el.classList.add('faded'); });
      };
      const armIdle = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
          if (!ctx.alive || done) return;
          idleCount++;
          if (idleCount >= 2) hint(2);
          ask();
          armIdle();
        }, 9000);
      };
      ctx.onLeave(() => { clearTimeout(idleTimer); reject(new Abort()); });
      for (const it of items) {
        it.el.addEventListener('pointerdown', async (e) => {
          e.preventDefault();
          if (done || !ctx.alive) return;
          armIdle();
          if (it.ch === target) {
            done = true;
            clearTimeout(idleTimer);
            recordAnswer(p, target, target, mistakes === 0 && !hinted);
            stopSpeech();
            sfx('correct');
            const c = centerOf(it.el, stage);
            sparkle(play, c.x, c.y);
            cheer();
            items.forEach((o) => { if (o !== it) popOut(o.el); });
            it.el.classList.remove('float', 'hint');
            const voice = sayAll([letterPhrase('name', target), pick(PRAISE_IDS)]);
            await flyTo(it.el, nextDot());
            it.el.remove();
            fillDot();
            sfx('pop');
            await Promise.race([voice, wait(2600)]);
            resolve();
            return;
          }
          recordAnswer(p, target, it.ch, mistakes === 0 && !hinted);
          mistakes++;
          sfx('wrong');
          it.el.classList.remove('wrong');
          void it.el.offsetWidth;
          it.el.classList.add('wrong');
          setTimeout(() => it.el.classList.remove('wrong'), 520);
          if (mistakes === 1) sayAll([letterPhrase('intro', it.ch), letterPhrase('find', target)]);
          else if (mistakes === 2) { hint(2); sayAll(['look', letterPhrase('find', target)]); }
          else { hint(3); say(letterPhrase('here', target)); }
        });
      }
      armIdle();
    });
    ctx.check();
  }

  // ---------- step 4: catch round ----------
  async function catchRound(target) {
    await say('catchIntro');
    ctx.check();
    const motion = MOTION[itemType];
    const young = p.age === '3-4';
    const distractors = shuffle([...st.letters, ...lettersBefore(n)]).filter((c) => c !== target && (!young || !confusable(c, target)));
    if (distractors.length < 2) distractors.push(...shuffle(REGULAR).filter((c) => c !== target && !confusable(c, target)).slice(0, 4));
    const need = pace.catchTargets;
    const speed = pace.catchSpeed;
    let popped = 0, wrongTaps = 0;
    const live = [];

    const lanesX = [140, 310, 480, 650, 820];
    const lanesY = [300, 450, 600];
    const slots = [[160, 280], [400, 240], [640, 280], [880, 250], [240, 520], [480, 560], [720, 540], [900, 470]];

    const spawn = (i, first = false) => {
      const onScreenTargets = live.filter((o) => o && o.ch === target && !o.gone).length;
      const ch = onScreenTargets < 1 || Math.random() < 0.4 ? target : pick(distractors);
      const el = makeItem(ch, 'small', Math.floor(Math.random() * 6));
      const o = { ch, el, gone: false, t0: performance.now(), phase: Math.random() * 6.28 };
      // First items start spread over the screen, so there is something to touch at once.
      const spread = (a0, a1) => a0 + ((a1 - a0) * ((i * 0.618) % 1));
      if (motion === 'up') { o.x = lanesX[i % lanesX.length]; o.y = first ? spread(320, 820) : 900; }
      else if (motion === 'down') { o.x = lanesX[i % lanesX.length]; o.y = first ? spread(-80, 420) : -140; }
      else if (motion === 'left') { o.y = lanesY[i % lanesY.length]; o.x = first ? spread(200, 1300) : 1400; }
      else { const s = slots[i % slots.length]; o.x = s[0]; o.y = s[1]; o.life = (young ? 5200 : 3800) + Math.random() * 800; el.classList.add('enter'); }
      el.style.left = `${o.x}px`;
      el.style.top = `${o.y}px`;
      play.append(el);
      live[i] = o;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (o.gone || !ctx.alive) return;
        if (o.ch === target) {
          o.gone = true;
          popped++;
          sfx('pop');
          const c = centerOf(el, stage);
          sparkle(play, c.x, c.y);
          cheer(700);
          popOut(el);
          if (popped < need) setTimeout(() => ctx.alive && popped < need && spawn(i), 700);
        } else {
          wrongTaps++;
          sfx('boing');
          el.classList.remove('wrong');
          void el.offsetWidth;
          el.classList.add('wrong');
          if (wrongTaps % 2 === 0) say(letterPhrase('catch', target));
        }
      });
    };

    const count = pace.catchItems;
    for (let i = 0; i < count; i++) spawn(i, true);
    say(letterPhrase('catch', target));
    let lastTalk = performance.now();

    await new Promise((resolve, reject) => {
      let last = performance.now();
      let raf = 0;
      ctx.onLeave(() => { cancelAnimationFrame(raf); reject(new Abort()); });
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
          else if (now - o.t0 > o.life) { o.gone = true; popOut(o.el); setTimeout(() => ctx.alive && popped < need && spawn(i), 500); continue; }
          o.el.style.left = `${o.x}px`;
          o.el.style.top = `${o.y}px`;
        }
        if (now - lastTalk > 11000) { lastTalk = now; say(letterPhrase('catch', target)); }
        if (popped >= need) { resolve(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    for (const o of live) if (o && !o.gone) { o.gone = true; popOut(o.el); }
    fillDot();
    ctx.check();
  }

  // ---------- run ----------
  const plan = planRounds();
  buildDots(plan.length);
  radio.show();
  await wait(500);
  ctx.check();
  await sayAll([`story.${st.theme}`, `ready.${p.puppy}`]);
  ctx.check();
  cheer();
  await say('go');
  ctx.check();
  if (n === 8) { await say('finalNote'); ctx.check(); }
  for (const ch of st.letters) await intro(ch);
  for (const t of plan) await findRound(t);
  await catchRound(pick(st.letters));

  // ---------- step 5: badges ----------
  const fresh = completeStation(p, n, st.letters);
  sfx('fanfare');
  confetti(root, { x: 640, y: 260, count: 80 });
  pup.classList.add('is-cheer');
  radio.cheer(true);
  await say('done');
  ctx.check();
  radio.cheer(false);
  const row = h('<div class="badge-row"></div>');
  root.append(row);
  for (const ch of st.letters) {
    const b = h(`<div class="item badge small enter">${itemSVG('badge')}<span class="glyph">${ch}</span></div>`);
    row.append(b);
    sfx('sparkle');
    await say(fresh.includes(ch) ? letterPhrase('badge', ch) : letterPhrase('name', ch));
    ctx.check();
  }
  pup.classList.remove('is-cheer');
  say('backToMap');
  const back = h(`<button class="big-btn pulse" type="button" aria-label="חזרה למפה" style="left:565px;top:520px">${ICONS.map}</button>`);
  onTap(back, () => go('map', { profile: p.id }));
  root.append(back);
  await tapOnce(back, () => say('backToMap'), 12000).catch(() => {});
}
