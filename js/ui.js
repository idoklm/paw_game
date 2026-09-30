// Shared UI helpers: elements, touch buttons, hold buttons, the captain radio, effects.

import { captainSVG } from './art/captain.js';
import { onSpeech } from './audio.js';
import { sfx } from './sfx.js';

export const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

// Escapes text typed by a person (a child name) before it goes into an HTML string.
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

// A scene flow stops when the scene is left. check() throws Abort; the scene catches it.
export class Abort extends Error {}

// Touch handler that reacts on finger down (fast for small children) with a press effect.
export function onTap(el, fn, { sound = 'tap' } = {}) {
  el.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    el.classList.remove('pressed');
    void el.offsetWidth;
    el.classList.add('pressed');
    if (sound) sfx(sound);
    fn(e);
  });
  el.addEventListener('animationend', (e) => { if (e.animationName === 'press') el.classList.remove('pressed'); });
}

// Hold-to-activate: a ring fills while the finger stays down. Used for exits and the parent area.
export function onHold(el, ms, fn) {
  let timer = null;
  const ring = h(`<svg class="hold-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" pathLength="100"/></svg>`);
  el.append(ring);
  const cancel = () => { clearTimeout(timer); timer = null; el.classList.remove('holding'); };
  el.style.setProperty('--hold', `${ms}ms`);
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.classList.add('holding');
    timer = setTimeout(() => { cancel(); sfx('tap'); fn(); }, ms);
  });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, cancel);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function iconButton(icon, cls = '') {
  return h(`<button class="icon-btn ${cls}" type="button">${icon}</button>`);
}

// The captain inside a round radio frame. It talks when a captain line plays.
export function captainRadio(parent, cls = '') {
  const el = h(`<div class="radio ${cls}"><div class="radio-inner">${captainSVG({ noArm: true })}</div><div class="radio-antenna"></div></div>`);
  parent.append(el);
  const svg = el.querySelector('.cap');
  const off = onSpeech((ev, phrase) => {
    const talking = ev === 'start' && phrase && phrase.voice !== 'puppy';
    svg.classList.toggle('is-talk', talking);
  });
  return {
    el,
    show() { el.classList.add('show'); },
    hide() { el.classList.remove('show'); },
    cheer(on) { svg.classList.toggle('is-cheer', on); },
    destroy() { off(); el.remove(); },
  };
}

// Makes a puppy svg talk while puppy lines play.
export function bindPuppyTalk(svg) {
  return onSpeech((ev, phrase) => {
    svg.classList.toggle('is-talk', ev === 'start' && phrase && phrase.voice === 'puppy');
  });
}

export function confetti(parent, { x = 640, y = 300, count = 60 } = {}) {
  const colors = ['#E8453C', '#2F5BD3', '#8B5CF6', '#FFC21A', '#16B6C6', '#FF6FAE', '#5DB85A'];
  for (let i = 0; i < count; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.background = colors[i % colors.length];
    c.style.left = `${x}px`;
    c.style.top = `${y}px`;
    parent.append(c);
    const a = Math.random() * Math.PI * 2;
    const v = 200 + Math.random() * 420;
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v - 260;
    c.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy + 520}px) rotate(${Math.random() * 900}deg)`, opacity: 0 },
    ], { duration: 1500 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' }).onfinish = () => c.remove();
  }
}

export function sparkle(parent, x, y) {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement('i');
    s.className = 'spark';
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    parent.append(s);
    const a = (i / 10) * Math.PI * 2;
    s.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * 110}px), calc(-50% + ${Math.sin(a) * 110}px)) scale(.2)`, opacity: 0 },
    ], { duration: 650, easing: 'ease-out', fill: 'forwards' }).onfinish = () => s.remove();
  }
}

// Stage position of an element's center (stage units, not screen pixels).
export function centerOf(el, stage) {
  const r = el.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const scale = sr.width / 1280;
  return { x: (r.left + r.width / 2 - sr.left) / scale, y: (r.top + r.height / 2 - sr.top) / scale };
}
