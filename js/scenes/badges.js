// The badge book: one badge per letter. A touch on a badge says the letter name.

import { ICONS } from '../art/icons.js';
import { bg, sprite } from '../art/sprites.js';
import { LETTERS } from '../curriculum.js';
import { say } from '../audio.js';
import { sfx } from '../sfx.js';
import { h, onTap, iconButton, captainRadio, sceneBg } from '../ui.js';
import { getProfile } from '../store.js';
import { letterPhrase } from '../phrases.js';

export async function show(root, params, ctx, go) {
  const p = getProfile(params.profile);
  if (!p) { go('profiles', {}); return; }
  root.innerHTML = sceneBg(bg('bg-title'));
  const book = h('<div class="book"></div>');
  LETTERS.forEach((l, i) => {
    const has = p.badges.includes(l.ch);
    const slot = h(`<div class="slot ${has ? 'has' : 'empty'}" role="button" aria-label="${l.name}">
${has ? `<img src="${sprite('item-badge')}" alt="" draggable="false">` : ''}<span class="glyph">${l.ch}</span></div>`);
    slot.style.animationDelay = `${i * 0.02}s`;
    if (has) {
      onTap(slot, () => {
        sfx('sparkle');
        slot.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25) rotate(-6deg)' }, { transform: 'scale(1)' }], { duration: 450 });
        say(letterPhrase('name', l.ch));
      }, { sound: null });
    }
    book.append(slot);
  });
  root.append(book);
  const back = iconButton(ICONS.back, 'btn-sea corner-tr small');
  onTap(back, () => go('map', { profile: p.id }));
  root.append(back);
  const radio = captainRadio(root, 'left mini');
  ctx.onLeave(() => radio.destroy());
  radio.show();
  await say(p.badges.length ? 'badges' : 'badgesEmpty');
}
