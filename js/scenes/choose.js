// Choose a puppy. A tap introduces the puppy; the green button under it confirms.
// Then a short parent step: the child's name (optional) and age group.

import { ICONS } from '../art/icons.js';
import { bg } from '../art/sprites.js';
import { PUPPIES } from '../team.js';
import { say, sayAll, stopSpeech } from '../audio.js';
import { sfx } from '../sfx.js';
import { h, onTap, captainRadio, confetti, iconButton, sceneBg, puppyActor } from '../ui.js';
import { createProfile, profiles } from '../store.js';

export async function show(root, params, ctx, go) {
  root.innerHTML = sceneBg(bg('bg-title'));
  const radio = captainRadio(root, 'left');
  ctx.onLeave(() => radio.destroy());

  if (profiles().length) {
    const back = iconButton(ICONS.back, 'btn-sea corner-tr small');
    onTap(back, () => go('profiles', {}));
    root.append(back);
  }

  const line = h('<div class="lineup"></div>');
  root.append(line);
  let chosen = null;
  const slots = PUPPIES.map((p, i) => {
    const slot = h(`<div class="slot" role="button" aria-label="${p.name}"><div class="pedestal" style="--c:${p.color}"></div>
<button class="big-btn ok" type="button" aria-label="בחירה">${ICONS.check}</button></div>`);
    const actor = puppyActor(p.id, 'enter');
    actor.el.style.animationDelay = `${0.1 + i * 0.08}s`;
    slot.prepend(actor.el);
    slot.style.left = `${(PUPPIES.length - 1 - i) * 206}px`; // first puppy on the right (Hebrew reads right to left)
    ctx.onLeave(actor.bindTalk());
    line.append(slot);
    return { p, slot, actor };
  });

  const select = async (s) => {
    chosen = s;
    for (const o of slots) {
      o.slot.classList.toggle('chosen', o === s);
      o.slot.classList.toggle('dim', o !== s);
    }
    s.actor.cheer(1200);
    const ok = await sayAll([`pup.${s.p.id}`]);
    if (ok && chosen === s) await say('chooseOk');
  };

  for (const s of slots) {
    onTap(s.slot, (e) => {
      if (e.target.closest('.ok')) return;
      select(s);
    });
    onTap(s.slot.querySelector('.ok'), () => {
      if (chosen !== s) return;
      sfx('fanfare');
      confetti(root, { x: parseFloat(s.slot.style.left) + 100, y: 360 });
      stopSpeech();
      parentStep(root, s.p, go);
    }, { sound: null });
  }

  radio.show();
  await say('choose');
}

function parentStep(root, puppy, go) {
  const wrap = h(`<div class="sheet-wrap"><div class="sheet">
<h2>ילד/ה חדש/ה בצוות</h2>
<p>את המסך הזה ממלא מבוגר. השם מופיע רק על הכרטיס, כדי להבדיל בין הילדים.</p>
<label for="kid-name">שם (לא חובה)</label>
<input id="kid-name" type="text" maxlength="14" autocomplete="off">
<label>גיל</label>
<div class="seg"><button type="button" data-age="3-4">3 עד 4</button><button type="button" data-age="5-6" class="on">5 עד 6</button></div>
<p class="muted">בגיל 3 עד 4 המשחקים קצרים יותר, והפריטים זזים לאט.</p>
<div class="row-actions"><button class="pill go" type="button" data-go>יוצאים לדרך</button><button class="pill" type="button" data-cancel>ביטול</button></div>
</div></div>`);
  root.append(wrap);
  let age = '5-6';
  wrap.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => {
    age = b.dataset.age;
    wrap.querySelectorAll('[data-age]').forEach((x) => x.classList.toggle('on', x === b));
  }));
  wrap.querySelector('[data-cancel]').addEventListener('click', () => wrap.remove());
  wrap.querySelector('[data-go]').addEventListener('click', () => {
    const name = wrap.querySelector('#kid-name').value.trim();
    const p = createProfile({ name, puppy: puppy.id, age });
    go('map', { profile: p.id, welcome: '1' });
  });
}
