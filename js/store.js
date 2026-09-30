// Profiles, progress, and settings. Saved in localStorage on this device only.

import { STATIONS, LETTER } from './curriculum.js';
import { PUPPY } from './team.js';

const KEY = 'lighthouse-team.v1';

const DEFAULT = () => ({
  version: 1,
  profiles: [],
  settings: { rate: 1, subtitles: false, sfx: true },
});

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT(), ...JSON.parse(raw) };
  } catch { /* storage blocked or broken JSON: start fresh */ }
  return DEFAULT();
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage full or blocked */ }
}

export const settings = () => data.settings;
export function setSetting(k, v) { data.settings[k] = v; save(); }

export const profiles = () => data.profiles;
export const getProfile = (id) => data.profiles.find((p) => p.id === id) || null;

export function createProfile({ name = '', puppy, age = '5-6' }) {
  const p = {
    id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, puppy, age,
    created: Date.now(),
    startStation: 1,   // parent can open later stations from the parent screen
    done: {},          // station number -> number of completions
    badges: [],        // letters
    stats: {},         // letter -> { tries, firstOk, hist: [1|0 ...last 10], conf: { letter: count } }
    at: 0,             // map position: 0 = lighthouse, n = station n
  };
  data.profiles.push(p);
  save();
  return p;
}

export function updateProfile(id, patch) {
  const p = getProfile(id);
  if (!p) return;
  Object.assign(p, patch);
  save();
}

export function deleteProfile(id) {
  data.profiles = data.profiles.filter((p) => p.id !== id);
  save();
}

export function resetProgress(id) {
  updateProfile(id, { done: {}, badges: [], stats: {}, at: 0 });
}

// Highest station the child may enter: the first not-done station, or the parent start level.
export function unlockedUpTo(p) {
  let n = Math.max(1, p.startStation || 1);
  for (const s of STATIONS) {
    if (p.done[s.n] && s.n + 1 > n) n = s.n + 1;
  }
  return Math.min(n, STATIONS.length);
}

export function isOpen(p, n) { return n <= unlockedUpTo(p); }

export function completeStation(p, n, letters) {
  p.done[n] = (p.done[n] || 0) + 1;
  const fresh = letters.filter((l) => !p.badges.includes(l));
  p.badges.push(...fresh);
  p.at = n;
  save();
  return fresh;
}

// One answer in a "find the letter" round. firstTry: the first touch in this round.
export function recordAnswer(p, target, chosen, firstTry) {
  const s = (p.stats[target] ||= { tries: 0, firstOk: 0, hist: [], conf: {} });
  if (firstTry) {
    s.tries++;
    const ok = chosen === target ? 1 : 0;
    s.firstOk += ok;
    s.hist.push(ok);
    if (s.hist.length > 10) s.hist.shift();
  }
  if (chosen !== target) s.conf[chosen] = (s.conf[chosen] || 0) + 1;
  save();
}

// 'new' | 'learning' | 'known'. Known: at least 4 of the last 5 first tries correct.
export function letterStatus(p, ch) {
  const s = p.stats[ch];
  if (!s || s.tries === 0) return 'new';
  const last = s.hist.slice(-5);
  const ok = last.reduce((a, b) => a + b, 0);
  return last.length >= 4 && ok >= Math.min(4, last.length) ? 'known' : 'learning';
}

export function exportData() { return JSON.stringify(data, null, 2); }

// A backup file comes from outside the game, so keep only fields with the expected shape.
const isLetter = (c) => Object.hasOwn(LETTER, c);

function cleanProfile(x) {
  if (!x || typeof x.id !== 'string' || !/^[\w-]{1,40}$/.test(x.id) || !Object.hasOwn(PUPPY, x.puppy)) return null;
  const stats = {};
  for (const [ch, s] of Object.entries(x.stats || {})) {
    if (!isLetter(ch) || !s) continue;
    const conf = {};
    for (const [c, n] of Object.entries(s.conf || {})) if (isLetter(c)) conf[c] = Number(n) || 0;
    stats[ch] = { tries: Number(s.tries) || 0, firstOk: Number(s.firstOk) || 0, hist: (s.hist || []).map((v) => (v ? 1 : 0)).slice(-10), conf };
  }
  const done = {};
  for (const [n, c] of Object.entries(x.done || {})) if (STATIONS.some((st) => String(st.n) === n)) done[n] = Number(c) || 1;
  return {
    id: x.id, name: String(x.name || '').slice(0, 14), puppy: x.puppy,
    age: x.age === '3-4' ? '3-4' : '5-6', created: Number(x.created) || Date.now(),
    startStation: Math.min(STATIONS.length, Math.max(1, Number(x.startStation) || 1)),
    done, badges: (Array.isArray(x.badges) ? x.badges : []).filter(isLetter), stats, at: Math.max(0, Math.min(STATIONS.length, Number(x.at) || 0)),
  };
}

export function importData(json) {
  const parsed = JSON.parse(json);
  if (!parsed || !Array.isArray(parsed.profiles)) throw new Error('bad backup file');
  const s = parsed.settings || {};
  data = {
    ...DEFAULT(),
    profiles: parsed.profiles.map(cleanProfile).filter(Boolean),
    settings: { rate: Number(s.rate) || 1, subtitles: Boolean(s.subtitles), sfx: s.sfx !== false },
  };
  save();
}
