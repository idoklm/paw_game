// Parent area. Opens after a 3-second hold on the gear button and a math question.
// Shows each child's progress, the start station, voice settings, and backup.

import { ICONS } from '../art/scenes.js';
import { PUPPIES, puppySVG } from '../art/puppies.js';
import { LETTERS, STATIONS, LETTER } from '../curriculum.js';
import { say, voiceInfo, configureAudio } from '../audio.js';
import { setSfx } from '../sfx.js';
import { h, esc, onHold, iconButton } from '../ui.js';
import {
  profiles, getProfile, updateProfile, deleteProfile, resetProgress, settings, setSetting,
  letterStatus, exportData, importData, unlockedUpTo,
} from '../store.js';

// The gear button, for the corner of kid screens.
export function parentButton(go, back) {
  const b = iconButton(ICONS.gear, 'corner-bl small parent-btn');
  b.setAttribute('aria-label', 'אזור הורים: לחיצה ארוכה');
  onHold(b, 3000, () => gate(b.closest('.scene'), () => go('parent', back)));
  return b;
}

function gate(scene, onPass) {
  const a = 11 + Math.floor(Math.random() * 19), b = 11 + Math.floor(Math.random() * 19);
  const wrap = h(`<div class="sheet-wrap"><div class="sheet" style="width:560px">
<h2>אזור הורים</h2><p>כמה זה?</p><div class="gate-q">${a} + ${b}</div><div class="gate-a" data-a></div>
<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => `<button type="button" data-d="${d}">${d}</button>`).join('')}
<button type="button" data-x>✕</button><button type="button" data-d="0">0</button><button type="button" data-del>⌫</button></div></div></div>`);
  scene.append(wrap);
  const out = wrap.querySelector('[data-a]');
  let val = '';
  const update = () => {
    out.textContent = val;
    if (val.length >= String(a + b).length) {
      if (Number(val) === a + b) { wrap.remove(); onPass(); }
      else { val = ''; out.textContent = ''; wrap.querySelector('.sheet').classList.add('shake'); setTimeout(() => wrap.querySelector('.sheet')?.classList.remove('shake'), 500); }
    }
  };
  wrap.querySelectorAll('[data-d]').forEach((k) => k.addEventListener('click', () => { val += k.dataset.d; update(); }));
  wrap.querySelector('[data-del]').addEventListener('click', () => { val = val.slice(0, -1); update(); });
  wrap.querySelector('[data-x]').addEventListener('click', () => wrap.remove());
}

export async function show(root, params, ctx, go) {
  let sel = getProfile(params.profile)?.id || profiles()[0]?.id || null;
  const panel = h('<div class="parent-panel"></div>');
  root.style.background = '#CFEFF7';
  root.append(panel);
  const close = () => {
    const back = params.back || 'profiles';
    if (back === 'map' && getProfile(params.profile)) go('map', { profile: params.profile });
    else go('profiles', {});
  };

  const render = () => {
    const s = settings();
    const v = voiceInfo();
    const list = profiles();
    const p = sel && getProfile(sel);
    panel.innerHTML = `
<button class="pill close-x" type="button" data-close>סגירה</button>
<h1>אזור הורים</h1>
<p class="muted">ההתקדמות נשמרת רק בטאבלט הזה. אפשר לשמור גיבוי בתחתית המסך.</p>
<h2>ילדים</h2>
${list.length ? `<div class="tabs">${list.map((x) => `<button type="button" data-tab="${esc(x.id)}" class="${x.id === sel ? 'on' : ''}">${esc(x.name || 'ללא שם')}</button>`).join('')}</div>` : '<p>עוד אין ילדים. מוסיפים ילד במסך "מי משחק" בכפתור הירוק.</p>'}
${p ? childSection(p) : ''}
<h2>קול וצלילים</h2>
<p>קול עברי במכשיר: <b>${v.hebrewVoice ? esc(v.hebrewVoice) : 'לא נמצא'}</b>. קבצי קול מוקלטים: <b>${v.recordedLines}</b>.</p>
${v.hebrewVoice ? '' : '<p class="muted">בלי קול עברי, המשחק מציג את הטקסט בתחתית המסך. באנדרואיד: הגדרות, ניהול כללי, שפה, המרת טקסט לדיבור. בוחרים במנוע של Google ומורידים את השפה עברית.</p>'}
<div class="row-actions">
<button class="pill" type="button" data-test>בדיקת קול</button>
<label style="margin:0">מהירות דיבור <select data-rate style="width:auto;font-size:22px;padding:6px 10px">
${[0.8, 0.9, 1, 1.1, 1.2].map((r) => `<option value="${r}" ${Number(s.rate) === r ? 'selected' : ''}>${r === 1 ? 'רגילה' : r}</option>`).join('')}</select></label>
<label style="margin:0"><input type="checkbox" data-subs ${s.subtitles ? 'checked' : ''}> להציג את הטקסט של הקריינות</label>
<label style="margin:0"><input type="checkbox" data-sfx ${s.sfx ? 'checked' : ''}> צלילים</label>
</div>
<h2>הקלטות שלכם</h2>
<p class="muted">אפשר להחליף כל משפט בהקלטה שלכם. שמים קובץ mp3 בתיקייה audio/custom, עם השם של המשפט (לדוגמה find.mem.mp3). אחר כך מריצים במחשב את הפקודה node tools/build.mjs ומעלים את הקבצים מחדש. הרשימה המלאה של המשפטים נמצאת בקובץ audio/lines.txt.</p>
<h2>גיבוי</h2>
<div class="row-actions"><button class="pill" type="button" data-export>שמירת גיבוי לקובץ</button>
<label class="pill" style="margin:0">טעינת גיבוי מקובץ<input type="file" accept="application/json,.json" data-import hidden></label></div>
<p class="muted">גרסה 1.0</p>`;
    wire(p);
  };

  const childSection = (p) => {
    const done = STATIONS.filter((st) => p.done[st.n]).length;
    const conf = [];
    for (const [target, st] of Object.entries(p.stats)) {
      for (const [chosen, count] of Object.entries(st.conf || {})) conf.push({ target, chosen, count });
    }
    conf.sort((a, b) => b.count - a.count);
    const cells = LETTERS.map((l) => {
      const s = p.stats[l.ch];
      const status = letterStatus(p, l.ch);
      const pct = s && s.tries ? Math.round((s.firstOk / s.tries) * 100) : null;
      const label = status === 'known' ? 'יודע/ת' : status === 'learning' ? 'לומד/ת' : 'חדש';
      return `<div class="lg ${status}" title="${l.name}"><b>${l.ch}</b><span>${label}${pct !== null ? ` · ${pct}%` : ''}</span></div>`;
    }).join('');
    return `
<div style="display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap">
<div style="flex:1;min-width:380px">
<label for="pname">שם</label><input id="pname" type="text" maxlength="14" value="${esc(p.name || '')}" data-name style="font-size:24px">
<label>גיל</label><div class="seg">${['3-4', '5-6'].map((a) => `<button type="button" data-age="${a}" class="${p.age === a ? 'on' : ''}">${a === '3-4' ? '3 עד 4' : '5 עד 6'}</button>`).join('')}</div>
<label for="pstart">תחנת פתיחה (תחנות קודמות נפתחות, בלי תגים)</label>
<select id="pstart" data-start>${STATIONS.map((st) => `<option value="${st.n}" ${Number(p.startStation) === st.n ? 'selected' : ''}>תחנה ${st.n}: ${st.letters.join(' ')}</option>`).join('')}</select>
</div>
<div><label>כלבלב</label><div style="display:flex;gap:8px;flex-wrap:wrap;max-width:420px">${PUPPIES.map((x) => `<button type="button" data-pup="${x.id}" style="width:120px;height:120px;border-radius:24px;border:4px solid ${x.id === p.puppy ? '#2B2340' : '#DDE2EC'};background:${x.id === p.puppy ? '#FFF3B8' : '#fff'};padding:4px;cursor:pointer">${puppySVG(x.id, { headOnly: true })}</button>`).join('')}</div></div>
</div>
<p>תחנות שהושלמו: <b>${done} מתוך ${STATIONS.length}</b>. תחנה פתוחה אחרונה: <b>${unlockedUpTo(p)}</b>. תגים: <b>${p.badges.length}</b>.</p>
<div class="legend"><span><i style="background:#D9F5CF"></i>יודע/ת: 4 מתוך 5 הניסיונות האחרונים נכונים בפעם הראשונה</span><span><i style="background:#FFF1C2"></i>לומד/ת</span><span><i style="background:#F1F3F7"></i>עוד לא תרגל/ה</span></div>
<div class="letter-grid">${cells}</div>
<h2 style="font-size:22px">איפה יש טעויות</h2>
${conf.length ? `<ul>${conf.slice(0, 6).map((c) => `<li>ביקשנו <b>${esc(c.target)}</b> (${LETTER[c.target]?.name || ''}), ונגעו ב-<b>${esc(c.chosen)}</b>: ${Number(c.count) || 0} פעמים</li>`).join('')}</ul>` : '<p class="muted">עוד אין טעויות לתצוגה.</p>'}
<div class="row-actions"><button class="pill warn" type="button" data-reset>איפוס ההתקדמות</button><button class="pill warn" type="button" data-delete>מחיקת הילד</button></div>`;
  };

  const wire = (p) => {
    panel.querySelector('[data-close]').addEventListener('click', close);
    panel.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { sel = b.dataset.tab; render(); }));
    if (p) {
      panel.querySelector('[data-name]').addEventListener('change', (e) => updateProfile(p.id, { name: e.target.value.trim() }));
      panel.querySelectorAll('[data-age]').forEach((b) => b.addEventListener('click', () => { updateProfile(p.id, { age: b.dataset.age }); render(); }));
      panel.querySelector('[data-start]').addEventListener('change', (e) => updateProfile(p.id, { startStation: Number(e.target.value) }));
      panel.querySelectorAll('[data-pup]').forEach((b) => b.addEventListener('click', () => { updateProfile(p.id, { puppy: b.dataset.pup }); render(); }));
      panel.querySelector('[data-reset]').addEventListener('click', () => {
        if (confirm('לאפס את כל ההתקדמות של הילד הזה? התגים יימחקו.')) { resetProgress(p.id); render(); }
      });
      panel.querySelector('[data-delete]').addEventListener('click', () => {
        if (confirm('למחוק את הילד הזה ואת כל ההתקדמות שלו?')) { deleteProfile(p.id); sel = profiles()[0]?.id || null; render(); }
      });
    }
    panel.querySelector('[data-test]').addEventListener('click', () => say('voiceTest'));
    panel.querySelector('[data-rate]').addEventListener('change', (e) => { setSetting('rate', Number(e.target.value)); configureAudio({ rate: Number(e.target.value) }); });
    panel.querySelector('[data-subs]').addEventListener('change', (e) => { setSetting('subtitles', e.target.checked); configureAudio({ subtitles: e.target.checked }); });
    panel.querySelector('[data-sfx]').addEventListener('change', (e) => { setSetting('sfx', e.target.checked); setSfx(e.target.checked); });
    panel.querySelector('[data-export]').addEventListener('click', () => {
      const blob = new Blob([exportData()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `lighthouse-team-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
    panel.querySelector('[data-import]').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        importData(await f.text());
        const s2 = settings();
        configureAudio({ rate: s2.rate, subtitles: s2.subtitles });
        setSfx(s2.sfx);
        sel = profiles()[0]?.id || null;
        render();
        alert('הגיבוי נטען.');
      } catch {
        alert('הקובץ הזה אינו קובץ גיבוי של המשחק.');
      }
    });
  };

  render();
}
