// Title: the bay, the lighthouse, the whole team, and one big play button.
// The first tap unlocks audio (browsers block sound before a tap) and asks for full screen.

import { bayPanorama, ICONS } from '../art/scenes.js';
import { PUPPIES, ROLES } from '../art/puppies.js';
import { puppySVG } from '../art/puppies.js';
import { captainSVG } from '../art/captain.js';
import { unlockAudio, voiceInfo } from '../audio.js';
import { unlockSfx, sfx } from '../sfx.js';
import { h, wait } from '../ui.js';
import { profiles } from '../store.js';

const TITLE = 'צֶוֶת הַמִּגְדַּלּוֹר';

function logo() {
  // Each word in its own team color, with a thick ink outline.
  const colors = [ROLES.fire.main, ROLES.builder.main];
  const words = TITLE.split(' ');
  const parts = words.map((w, i) => `<tspan fill="${colors[i]}">${w}</tspan>`).join(' ');
  return `<svg class="title-logo" viewBox="0 0 1000 230" aria-label="צוות המגדלור">
<text x="500" y="170" text-anchor="middle" font-size="128" stroke-width="24" fill="#fff" stroke="#fff">${TITLE}</text>
<text x="500" y="170" text-anchor="middle" font-size="128" stroke-width="13">${parts}</text></svg>`;
}

export async function show(root, params, ctx, go) {
  root.innerHTML = bayPanorama();
  root.append(h(logo()));
  const team = h('<div class="title-team"></div>');
  const xs = [345, 500, 655, 810, 965, 1120];
  PUPPIES.forEach((p, i) => {
    const el = h(puppySVG(p.id));
    el.style.left = `${xs[i] - 85}px`;
    el.style.bottom = `${i % 2 ? 0 : 18}px`;
    el.querySelector('.pup-head').style.animationDelay = `${-i * 1.3}s`;
    el.querySelector('.pup-tail').style.animationDelay = `${-i * 0.2}s`;
    team.append(el);
  });
  root.append(team);
  const cap = h(captainSVG({ className: 'is-wave' }));
  cap.classList.add('title-captain');
  root.append(cap);

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

  // A note for parents: without a Hebrew voice the game shows text instead of speech.
  await wait(2500);
  if (ctx.alive && !voiceInfo().hebrewVoice && !voiceInfo().recordedLines) {
    root.append(h('<div class="voice-note">לא נמצא קול עברי במכשיר. ההסבר נמצא במסך ההורים.</div>'));
  }
}
