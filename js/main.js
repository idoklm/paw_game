// Boot, stage scaling, and the scene router.

import { initAudio, configureAudio, stopSpeech } from './audio.js';
import { setSfx } from './sfx.js';
import { settings } from './store.js';
import { Abort } from './ui.js';
import * as title from './scenes/title.js';
import * as profiles from './scenes/profiles.js';
import * as choose from './scenes/choose.js';
import * as map from './scenes/map.js';
import * as mission from './scenes/mission.js';
import * as badges from './scenes/badges.js';
import * as parent from './scenes/parent.js';

const SCENES = { title, profiles, choose, map, mission, badges, parent };
export const W = 1280, H = 800;

const stage = document.getElementById('stage');
let current = null;

function fit() {
  const s = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `translate(${(innerWidth - W * s) / 2}px, ${(innerHeight - H * s) / 2}px) scale(${s})`;
}

export function getStage() { return stage; }

// ctx.alive turns false when the scene is left. ctx.check() throws Abort in that case.
export async function go(name, params = {}) {
  stopSpeech();
  if (current) current.leave();
  const root = document.createElement('div');
  root.className = `scene scene-${name}`;
  stage.replaceChildren(root);
  const ctx = {
    alive: true,
    cleanups: [],
    check() { if (!this.alive) throw new Abort(); },
    onLeave(fn) { this.cleanups.push(fn); },
  };
  const entry = {
    name,
    leave() {
      ctx.alive = false;
      for (const fn of ctx.cleanups) { try { fn(); } catch (e) { console.error(e); } }
    },
  };
  current = entry;
  try {
    await SCENES[name].show(root, params, ctx, go);
  } catch (e) {
    if (!(e instanceof Abort)) console.error(e);
  }
}

async function boot() {
  fit();
  addEventListener('resize', fit);
  addEventListener('orientationchange', () => setTimeout(fit, 200));
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  const s = settings();
  configureAudio({ rate: s.rate, subtitles: s.subtitles });
  setSfx(s.sfx);
  await initAudio(document.getElementById('subtitle'));
  const params = new URLSearchParams(location.search);
  // Dev shortcut: ?scene=map&profile=<id> opens a scene directly.
  const start = params.get('scene');
  if (start && SCENES[start]) go(start, Object.fromEntries(params));
  else go('title');
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

boot();
