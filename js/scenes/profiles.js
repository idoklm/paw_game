// "Who plays now?" One card per child. A green card adds a new child.

import { ICONS } from '../art/icons.js';
import { bg } from '../art/sprites.js';
import { say, sayAll } from '../audio.js';
import { h, onTap, esc, captainRadio, sceneBg, puppyFace } from '../ui.js';
import { profiles } from '../store.js';
import { parentButton } from './parent.js';

export async function show(root, params, ctx, go) {
  root.innerHTML = sceneBg(bg('bg-title'));
  const cards = h('<div class="cards"></div>');
  profiles().forEach((p, i) => {
    const c = h(`<div class="card enter" role="button">${puppyFace(p.puppy)}<div class="card-name">${esc(p.name || '')}</div></div>`);
    c.style.animationDelay = `${i * 0.08}s`;
    onTap(c, () => go('map', { profile: p.id }));
    cards.append(c);
  });
  const add = h(`<div class="card add enter" role="button" aria-label="ילד חדש">${ICONS.plus}</div>`);
  onTap(add, () => go('choose', {}));
  cards.append(add);
  root.append(cards);
  root.append(parentButton(go, { back: 'profiles' }));

  const radio = captainRadio(root);
  ctx.onLeave(() => radio.destroy());
  radio.show();
  if (params.first) await sayAll(['hello', 'who']);
  else await say('who');
}
