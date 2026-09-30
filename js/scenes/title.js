// Title: the bay, the lighthouse, the whole team, and one big play button.
// The first tap unlocks audio (browsers block sound before a tap) and asks for full screen.

import { ICONS } from '../art/icons.js';
import { bg, sprite } from '../art/sprites.js';
import { PUPPIES } from '../team.js';
import { unlockAudio, voiceInfo } from '../audio.js';
import { unlockSfx, sfx } from '../sfx.js';
import { h, wait, sceneBg, puppyActor } from '../ui.js';
import { profiles } from '../store.js';

const TITLE = 'צֶוֶת הַמִּגְדַּלּוֹר';

function logo() {
  // Each word in its own team color, with a thick ink outline.
  const colors = ['#E8453C', '#FFC21A'];
  const parts = TITLE.split(' ').map((w, i) => `<tspan fill="${colors[i]}">${w}</tspan>`).join(' ');
  return `<svg class="title-logo" viewBox="0 0 1000 230" aria-label="צוות המגדלור">
<text x="500" y="165" text-anchor="middle" font-size="128" stroke-width="26" fill="#fff" stroke="#fff">${TITLE}</text>
<text x="500" y="165" text-anchor="middle" font-size="128" stroke-width="12">${parts}</text></svg>`;
}

export async function show(root, params, ctx, go) {
  root.innerHTML = sceneBg(bg('bg-title'));
  root.append(h(logo()));
  const team = h('<div class="title-team"></div>');
  PUPPIES.forEach((p, i) => {
    const a = puppyActor(p.id, 'enter');
    a.el.style.left = `${1110 - i * 150}px`;
    a.el.style.animationDelay = `${0.15 + i * 0.09}s`;
    team.append(a.el);
    // every few seconds one puppy jumps with joy
    const t = setInterval(() => { if (Math.random() < 0.25) a.cheer(900); }, 2200 + i * 170);
    ctx.onLeave(() => clearInterval(t));
  });
  root.append(team);
  root.append(h(`<img class="title-captain" src="${sprite('captain')}" alt="" draggable="false">`));

  const play = h(`<button class="big-btn title-play pulse" type="button" aria-label="התחלה">${ICONS.play}</button>`);
  root.append(play);
  // Chrome counts a touch as a user activation only on pointerup or click, not on pointerdown.
  // The audio unlock and full screen need that activation, so this button uses click.
  play.addEventListener('click', () => {
    unlockSfx();
    unlockAudio();
    sfx('fanfare');
    const el = document.documentElement;
    if (el.requestFullscreen && !document.fullscreenElement) {
      el.requestFullscreen({ navigationUI: 'hide' }).then(() => screen.orientation?.lock?.('landscape')).catch(() => {});
    }
    go(profiles().length ? 'profiles' : 'choose', { first: '1' });
  });

  // A note for parents: without a Hebrew voice and without voice files, the game shows text instead of speech.
  await wait(2500);
  if (ctx.alive && !voiceInfo().hebrewVoice && !voiceInfo().recordedLines) {
    root.append(h('<div class="voice-note">לא נמצא קול עברי במכשיר. ההסבר נמצא במסך ההורים.</div>'));
  }
}
