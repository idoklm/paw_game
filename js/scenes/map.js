// The bay map. The puppy's vehicle drives along the coast road from station to station.

import { ICONS } from '../art/icons.js';
import { bg, vehImg, MAP_STOPS, MAP_TOP, roadPath } from '../art/sprites.js';
import { STATIONS } from '../curriculum.js';
import { say, sayAll, stopSpeech } from '../audio.js';
import { sfx } from '../sfx.js';
import { h, onTap, iconButton, captainRadio, wait, sceneBg, puppyFace } from '../ui.js';
import { getProfile, isOpen, unlockedUpTo } from '../store.js';
import { parentButton } from './parent.js';

const stop = (n) => ({ x: MAP_STOPS[n].x, y: MAP_STOPS[n].y + MAP_TOP });

// Distance along the road for each stop, found by sampling the path.
function roadStops(path) {
  const len = path.getTotalLength();
  const samples = [];
  for (let d = 0; d <= len; d += 3) samples.push([d, path.getPointAtLength(d)]);
  return MAP_STOPS.map((_, n) => {
    const pt = stop(n);
    let best = 0, bestD = Infinity;
    for (const [d, q] of samples) {
      const dd = (q.x - pt.x) ** 2 + (q.y - pt.y) ** 2;
      if (dd < bestD) { bestD = dd; best = d; }
    }
    return best;
  });
}

export async function show(root, params, ctx, go) {
  const p = getProfile(params.profile);
  if (!p) { go('profiles', {}); return; }
  root.innerHTML = sceneBg(bg('bg-map'), MAP_TOP);
  const ns = 'http://www.w3.org/2000/svg';
  const road = document.createElementNS(ns, 'path');
  road.setAttribute('d', roadPath());
  const hidden = document.createElementNS(ns, 'svg');
  hidden.setAttribute('style', 'position:absolute;width:0;height:0');
  hidden.append(road);
  root.append(hidden);
  const stops = roadStops(road);

  const upTo = unlockedUpTo(p);
  // The next station: the first one not done, from the parent's start station on.
  const next = STATIONS.find((s) => !p.done[s.n] && isOpen(p, s.n) && s.n >= (p.startStation || 1));
  const buttons = {};
  for (const s of STATIONS) {
    const pt = stop(s.n);
    const open = isOpen(p, s.n);
    const done = Boolean(p.done[s.n]);
    const cls = ['station', open ? '' : 'locked', done ? 'done' : '', next === s ? 'next' : ''].join(' ');
    const b = h(`<div class="${cls}" role="button" aria-label="תחנה ${s.n}"><span class="st-letters">${s.letters.join('')}</span>
${open ? '' : `<span class="st-lock">${ICONS.lock}</span>`}${done ? `<span class="st-star">${ICONS.star}</span>` : ''}</div>`);
    b.style.left = `${pt.x}px`;
    b.style.top = `${pt.y}px`;
    root.append(b);
    buttons[s.n] = b;
  }

  // vehicle
  const veh = h(`<div class="map-veh"><img class="veh-img" src="${vehImg(p.puppy)}" alt="" draggable="false"></div>`);
  root.append(veh);
  let at = Math.min(p.at || 0, upTo);
  // At rest the vehicle waits halfway to the next station, so it does not cover a station button.
  const last = STATIONS.length;
  const restD = (n) => (n < last ? (stops[n] + stops[n + 1]) / 2 : stops[last] - 110);
  let pos = restD(at);
  const place = (d) => {
    const q = road.getPointAtLength(d);
    veh.style.left = `${q.x}px`;
    veh.style.top = `${q.y}px`;
  };
  place(pos);

  const who = h(`<button class="who-btn" type="button" aria-label="מי משחק">${puppyFace(p.puppy)}</button>`);
  onTap(who, () => go('profiles', {}));
  root.append(who);
  const book = iconButton(ICONS.badges, 'corner-br');
  onTap(book, () => go('badges', { profile: p.id }));
  root.append(book);
  root.append(parentButton(go, { back: 'map', profile: p.id }));

  const radio = captainRadio(root, 'top-center');
  ctx.onLeave(() => radio.destroy());

  let driving = false;
  const drive = async (target) => {
    driving = true;
    const from = pos, to = stops[target];
    const dur = Math.min(2800, 700 + Math.abs(to - from) * 1.9);
    veh.classList.add('is-driving');
    sfx('horn');
    const t0 = performance.now();
    await new Promise((resolve) => {
      const step = (now) => {
        if (!ctx.alive) return resolve();
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const d = from + (to - from) * e;
        const a = road.getPointAtLength(Math.max(0, d - 2)), b2 = road.getPointAtLength(d + 2);
        // The vehicle art faces left; flip it when it drives to the right.
        const dx = to > from ? b2.x - a.x : a.x - b2.x;
        if (Math.abs(dx) > 0.5) veh.classList.toggle('flip', dx > 0);
        place(d);
        if (t < 1) requestAnimationFrame(step); else resolve();
      };
      requestAnimationFrame(step);
    });
    veh.classList.remove('is-driving');
    at = target;
    pos = to;
  };

  for (const s of STATIONS) {
    onTap(buttons[s.n], async () => {
      if (driving) return;
      if (!isOpen(p, s.n)) {
        buttons[s.n].classList.remove('shake');
        void buttons[s.n].offsetWidth;
        buttons[s.n].classList.add('shake');
        sfx('wrong');
        say('locked');
        return;
      }
      stopSpeech();
      await drive(s.n);
      driving = true; // stay locked until the mission opens
      await wait(250);
      if (ctx.alive) go('mission', { profile: p.id, n: String(s.n) });
    });
  }

  if (next) {
    const arrow = h(`<div class="map-arrow">${ICONS.down}</div>`);
    const pt = stop(next.n);
    arrow.style.left = `${pt.x}px`;
    arrow.style.top = `${pt.y + 40}px`;
    root.append(arrow);
  }

  radio.show();
  const lines = [];
  if (params.welcome) lines.push('welcomeTeam');
  if (!next && STATIONS.every((s) => p.done[s.n])) lines.push('allDone');
  else lines.push('map');
  await sayAll(lines);
  if (ctx.alive) radio.hide();
}
