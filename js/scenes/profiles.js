// "Who plays now?" One card per child. A green card adds a new child.

import { bayPanorama, ICONS } from '../art/scenes.js';
import { puppySVG } from '../art/puppies.js';
import { say, sayAll } from '../audio.js';
import { h, onTap, esc, captainRadio } from '../ui.js';
import { profiles } from '../store.js';
import { parentButton } from './parent.js';

export async function show(root, params, ctx, go) {
  root.innerHTML = bayPanorama();
  const cards = h('<div class="cards"></div>');
  for (const p of profiles()) {
    const c = h(`<div class="card" role="button">${puppySVG(p.puppy, { headOnly: true })}<div class="card-name">${esc(p.name || '')}</div></div>`);
    onTap(c, () => go('map', { profile: p.id }));
    cards.append(c);
  }
  const add = h(`<div class="card add" role="button" aria-label="ילד חדש">${ICONS.plus}</div>`);
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
