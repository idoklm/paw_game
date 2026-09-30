// Narration: plays a recorded file when one exists, otherwise the device speech engine (Hebrew).
// say() returns a Promise that resolves true when the line ends, or false when stop() cancels it.

import { PHRASES } from './phrases.js';

const state = {
  files: {},          // phrase id -> url, from audio/manifest.json
  playback: {},       // phrase id -> speed factor (generated voices only)
  voice: null,        // SpeechSynthesisVoice for Hebrew, if the device has one
  voicesLoaded: false,
  rate: 1,
  subtitles: false,
  token: 0,           // stop() increments it; running sequences check it
  audio: null,        // current HTMLAudioElement
  endAudio: null,     // settles the promise of the current file
  utterance: null,    // current SpeechSynthesisUtterance
  cancelAt: -1e9,     // time of the last speechSynthesis.cancel()
  listeners: new Set(),
  subtitleEl: null,
};

export function onSpeech(fn) { state.listeners.add(fn); return () => state.listeners.delete(fn); }
function emit(ev, phrase) { for (const fn of state.listeners) fn(ev, phrase); }

export function configureAudio({ rate, subtitles } = {}) {
  if (rate) state.rate = rate;
  if (subtitles !== undefined) state.subtitles = subtitles;
}

function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const all = speechSynthesis.getVoices();
  if (!all.length) return;
  state.voicesLoaded = true;
  const he = all.filter((v) => /^(he|iw)([-_]|$)/i.test(v.lang));
  const score = (v) => (/natural|neural|online/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
  he.sort((a, b) => score(b) - score(a));
  state.voice = he[0] || null;
}

export async function initAudio(subtitleEl) {
  state.subtitleEl = subtitleEl;
  try {
    const res = await fetch('audio/manifest.json', { cache: 'no-cache' });
    if (res.ok) {
      const m = await res.json();
      state.files = m.files || {};
      state.playback = m.playback || {};
    }
  } catch { /* offline without cache: fall back to speech */ }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  }
}

export function voiceInfo() {
  return {
    hebrewVoice: state.voice ? `${state.voice.name} (${state.voice.lang})` : null,
    recordedLines: Object.keys(state.files).length,
    speechSupported: 'speechSynthesis' in window,
  };
}

// Must run inside a user gesture: Chrome blocks audio and speech before the first tap.
export function unlockAudio() {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
  const a = new Audio();
  a.play().catch(() => {});
}

function showSubtitle(text) {
  if (!state.subtitleEl) return;
  state.subtitleEl.textContent = text || '';
  state.subtitleEl.classList.toggle('show', Boolean(text) && (state.subtitles || !state.voice));
}

// factor > 1 plays faster with the pitch not preserved: the voice files are made slow and low,
// and this turns them into child voices at a normal speed.
function playFile(url, token, factor = 1) {
  return new Promise((resolve) => {
    const a = new Audio(url);
    if (factor !== 1) {
      a.preservesPitch = false;
      a.mozPreservesPitch = false;
      a.webkitPreservesPitch = false;
      a.defaultPlaybackRate = factor;
      a.playbackRate = factor;
    }
    state.audio = a;
    let settled = false;
    const end = (ok) => {
      if (settled) return;
      settled = true;
      if (state.audio === a) { state.audio = null; state.endAudio = null; }
      resolve(ok === null ? null : ok && token === state.token);
    };
    state.endAudio = () => end(false); // pause() fires no event, so the stop code calls this
    a.onended = () => end(true);
    a.onerror = () => end(null); // null: file failed, caller falls back to speech
    a.play().catch(() => end(null));
  });
}

// Reading time for a line when no voice plays it (subtitles only). ?fast shortens it for tests.
const FAST = new URLSearchParams(location.search).has('fast');
const readTime = (text) => (FAST ? 120 : 900 + text.length * 75 / state.rate);

async function speak(text, voice, token) {
  if (!('speechSynthesis' in window)) {
    await new Promise((r) => setTimeout(r, readTime(text)));
    return token === state.token;
  }
  // Chrome on Android can drop a line that starts right after cancel(). A short pause avoids that.
  if (speechSynthesis.speaking || speechSynthesis.pending) cancelSpeech();
  const since = performance.now() - state.cancelAt;
  if (since < 90) {
    await new Promise((r) => setTimeout(r, 90 - since));
    if (token !== state.token) return false;
  }
  return new Promise((resolve) => {
    const started = performance.now();
    const u = new SpeechSynthesisUtterance(text);
    state.utterance = u; // keep a reference: Chrome can lose onend when the utterance is garbage-collected
    u.lang = 'he-IL';
    if (state.voice) u.voice = state.voice;
    u.rate = (voice === 'puppy' ? 1.02 : 0.9) * state.rate;
    u.pitch = voice === 'puppy' ? 1.65 : 1.2;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearInterval(keepAlive);
      if (state.utterance === u) state.utterance = null;
      resolve(token === state.token);
    };
    // Some engines never fire onend. The timer keeps the game moving.
    const timer = setTimeout(finish, FAST ? 400 : 2500 + text.length * 140 / state.rate);
    // Chrome desktop pauses long utterances after about 15 seconds without this.
    const keepAlive = setInterval(() => { if (speechSynthesis.speaking) speechSynthesis.resume(); }, 5000);
    u.onend = finish;
    u.onerror = (e) => {
      // No usable voice: keep the subtitle up long enough to read, then continue.
      if (e.error === 'interrupted' || e.error === 'canceled') { finish(); return; }
      const left = readTime(text) - (performance.now() - started);
      if (left > 0) setTimeout(finish, left); else finish();
    };
    speechSynthesis.speak(u);
  });
}

function cancelSpeech() {
  speechSynthesis.cancel();
  state.cancelAt = performance.now();
}

function stopAudio() {
  if (!state.audio) return;
  state.audio.pause();
  const end = state.endAudio;
  state.audio = null;
  state.endAudio = null;
  if (end) end();
}

function interrupt() {
  stopAudio();
  if ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) cancelSpeech();
}

// id: a phrase id from phrases.js. Also accepts { text, voice } for ad-hoc lines.
export async function say(id, { token } = {}) {
  if (token === undefined) interrupt();
  const t = token ?? ++state.token;
  const phrase = typeof id === 'string' ? PHRASES[id] : id;
  if (!phrase) { console.warn('missing phrase', id); return true; }
  emit('start', phrase);
  showSubtitle(phrase.text);
  let ok = null;
  const url = phrase.id && state.files[phrase.id];
  if (url) ok = await playFile(url, t, state.playback[phrase.id] || 1);
  if (ok === null && t === state.token) ok = await speak(phrase.say || phrase.text, phrase.voice, t);
  if (t === state.token) showSubtitle('');
  emit('end', phrase);
  return Boolean(ok) && t === state.token;
}

// Plays lines one after the other. Stops early (returns false) if stop() is called.
export async function sayAll(ids) {
  interrupt();
  const t = ++state.token;
  for (const id of ids) {
    if (!id) continue;
    const ok = await say(id, { token: t });
    if (!ok) return false;
  }
  return true;
}

export function stopSpeech() {
  state.token++;
  stopAudio();
  if ('speechSynthesis' in window) cancelSpeech();
  showSubtitle('');
  emit('end', null);
}
