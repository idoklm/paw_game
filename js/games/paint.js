// Paint: color a big letter with a finger. The letter fills with color when enough of it is painted.
// Coverage is counted on a grid of 8-pixel cells inside the letter shape, so it stays fast.

import { letterPhrase } from '../phrases.js';
import { h, shuffle } from '../ui.js';
import { idleTimer } from './kit.js';

const SIZE = 1040;   // canvas pixels (shown at 520 stage px, so it stays sharp when the stage is scaled up)
const CELL = 8;

export const goalsFor = (env) => (env.young ? 1 : 2);

export async function play(env) {
  // The text argument makes the browser load the Hebrew part of the font (not only the Latin part).
  await document.fonts.load('900 100px "Game Hebrew"', 'אבגדהוזחטיכלמנסעפצקרשתךםןףץ').catch(() => {});
  const letters = shuffle(env.st.letters).slice(0, goalsFor(env));
  for (const ch of letters) {
    env.ctx.check();
    await paintOne(env, ch);
  }
}

function glyphMask(ch) {
  const c = document.createElement('canvas');
  c.width = c.height = SIZE;
  const g = c.getContext('2d');
  // Scale the font so the letter fills about 78% of the panel in its larger direction.
  const family = '"Game Hebrew", "Noto Sans Hebrew", Arial, sans-serif';
  g.font = `900 ${SIZE}px ${family}`;
  const probe = g.measureText(ch);
  const pw = probe.actualBoundingBoxLeft + probe.actualBoundingBoxRight;
  const ph = probe.actualBoundingBoxAscent + probe.actualBoundingBoxDescent;
  const fontSize = Math.min(SIZE * 1.6, (SIZE * 0.78 * SIZE) / Math.max(pw, ph, 1));
  g.font = `900 ${fontSize}px ${family}`;
  g.textAlign = 'center';
  const m = g.measureText(ch);
  const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
  g.fillStyle = '#000';
  g.fillText(ch, SIZE / 2, SIZE / 2 + (asc - desc) / 2);
  return { canvas: c, draw: (ctx, style) => { ctx.font = g.font; ctx.textAlign = 'center'; ctx.fillStyle = style; ctx.fillText(ch, SIZE / 2, SIZE / 2 + (asc - desc) / 2); }, font: g.font, y: SIZE / 2 + (asc - desc) / 2 };
}

function paintOne(env, ch) {
  const { play: layer, ctx } = env;
  const panel = h(`<div class="paint-panel enter show-finger"><canvas width="${SIZE}" height="${SIZE}"></canvas><div class="paint-finger"></div></div>`);
  layer.append(panel);
  const demo = setTimeout(() => panel.classList.remove('show-finger'), 3300);
  const view = panel.querySelector('canvas');
  const vg = view.getContext('2d');
  const mask = glyphMask(ch);

  // letter cells
  const n = SIZE / CELL;
  const md = mask.canvas.getContext('2d').getImageData(0, 0, SIZE, SIZE).data;
  const inLetter = new Uint8Array(n * n);
  let total = 0;
  for (let cy = 0; cy < n; cy++) for (let cx = 0; cx < n; cx++) {
    const px = cx * CELL + CELL / 2, py = cy * CELL + CELL / 2;
    if (md[(py * SIZE + px) * 4 + 3] > 128) { inLetter[cy * n + cx] = 1; total++; }
  }
  const covered = new Uint8Array(n * n);
  let count = 0;

  const paint = document.createElement('canvas');
  paint.width = paint.height = SIZE;
  const pg = paint.getContext('2d');
  const masked = document.createElement('canvas');
  masked.width = masked.height = SIZE;
  const mg = masked.getContext('2d');
  let hue = Math.random() * 360;
  const brush = env.pace.brush * 2; // canvas pixels

  const render = (finished = false) => {
    vg.clearRect(0, 0, SIZE, SIZE);
    // guide: a pale letter with a dashed outline
    mask.draw(vg, '#F6DDB0');
    vg.save();
    vg.font = mask.font; vg.textAlign = 'center';
    vg.setLineDash([30, 20]); vg.lineWidth = 16; vg.lineCap = 'round'; vg.strokeStyle = '#8A6238';
    vg.strokeText(ch, SIZE / 2, mask.y);
    vg.restore();
    if (finished) {
      const grad = vg.createLinearGradient(0, 0, SIZE, SIZE);
      grad.addColorStop(0, '#FF6B8A'); grad.addColorStop(0.5, '#FFC21A'); grad.addColorStop(1, '#16B6C6');
      mask.draw(vg, grad);
      vg.save(); vg.font = mask.font; vg.textAlign = 'center'; vg.lineWidth = 14; vg.strokeStyle = '#2B2340'; vg.strokeText(ch, SIZE / 2, mask.y); vg.restore();
      return;
    }
    vg.globalAlpha = 0.22;
    vg.drawImage(paint, 0, 0);
    vg.globalAlpha = 1;
    mg.clearRect(0, 0, SIZE, SIZE);
    mg.globalCompositeOperation = 'source-over';
    mg.drawImage(paint, 0, 0);
    mg.globalCompositeOperation = 'destination-in';
    mg.drawImage(mask.canvas, 0, 0);
    mg.globalCompositeOperation = 'source-over';
    vg.drawImage(masked, 0, 0);
  };
  render();
  env.say(letterPhrase('paint', ch));

  return new Promise((resolve, reject) => {
    let last = null, done = false, raf = 0, dirty = false, finger = null; // finger: the one pointer that paints
    const idle = idleTimer(ctx, 10000, () => {
      panel.classList.remove('show-finger');
      void panel.offsetWidth; // restart the finger animation
      panel.classList.add('show-finger');
      setTimeout(() => panel.classList.remove('show-finger'), 3300);
      env.say(letterPhrase('paint', ch));
    });
    ctx.onLeave(() => clearTimeout(demo));
    ctx.onLeave(() => { cancelAnimationFrame(raf); reject(env.abort()); });
    const toCanvas = (e) => {
      const r = view.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE };
    };
    const stamp = (x, y) => {
      hue = (hue + 2.5) % 360;
      pg.fillStyle = `hsl(${hue} 90% 58%)`;
      pg.beginPath(); pg.arc(x, y, brush, 0, Math.PI * 2); pg.fill();
      const r2 = brush * brush;
      for (let cy = Math.max(0, Math.floor((y - brush) / CELL)); cy <= Math.min(n - 1, Math.floor((y + brush) / CELL)); cy++) {
        for (let cx = Math.max(0, Math.floor((x - brush) / CELL)); cx <= Math.min(n - 1, Math.floor((x + brush) / CELL)); cx++) {
          const i = cy * n + cx;
          if (!inLetter[i] || covered[i]) continue;
          const dx = cx * CELL + CELL / 2 - x, dy = cy * CELL + CELL / 2 - y;
          if (dx * dx + dy * dy <= r2) { covered[i] = 1; count++; }
        }
      }
      dirty = true;
    };
    const frame = () => {
      if (dirty && !done) { dirty = false; render(); }
      if (!done) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const finish = async () => {
      done = true;
      idle.stop();
      render(true);
      env.stopSpeech();
      env.sfx('fanfare');
      env.sparkleEl(panel);
      env.actor.cheer(1500);
      panel.classList.add('finished');
      await env.sayAll([letterPhrase('name', ch), env.praiseId()]);
      await env.goal(panel);
      panel.remove();
      resolve();
    };
    view.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (done || (finger !== null && finger !== e.pointerId)) return;
      finger = e.pointerId;
      view.setPointerCapture(e.pointerId);
      panel.classList.remove('show-finger');
      idle.poke();
      last = toCanvas(e);
      stamp(last.x, last.y);
    });
    view.addEventListener('pointermove', (e) => {
      if (!last || done || e.pointerId !== finger) return;
      const p = toCanvas(e);
      const dist = Math.hypot(p.x - last.x, p.y - last.y);
      const steps = Math.max(1, Math.ceil(dist / (brush / 3)));
      for (let s = 1; s <= steps; s++) stamp(last.x + ((p.x - last.x) * s) / steps, last.y + ((p.y - last.y) * s) / steps);
      last = p;
      idle.poke();
      if (count / total >= env.pace.paintCover) finish();
    });
    const up = (e) => {
      if (e.pointerId !== finger) return;
      finger = null;
      last = null;
      if (!done && count / total >= env.pace.paintCover) finish();
    };
    view.addEventListener('pointerup', up);
    view.addEventListener('pointercancel', up);
  });
}
