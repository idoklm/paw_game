// The rescue team: six original puppies. Sitting pose, front view, viewBox 400 x 440.
// Animated parts have classes: pup-tail, pup-head, pup-eyes, pup-ear-l / pup-ear-r,
// mouth-open / mouth-closed, eye-open / eye-closed (see css/art.css).

import { INK, SW, uid, mirrorX, blob, shaded, shadedEllipse, starPath, svgWrap } from './common.js';

export const ROLES = {
  fire:      { main: '#E8453C', dark: '#B32F2B', accent: '#FFD23F' },
  police:    { main: '#2F5BD3', dark: '#1E3C98', accent: '#FFC83D' },
  pilot:     { main: '#8B5CF6', dark: '#6440C9', accent: '#FFD66B' },
  builder:   { main: '#FFC21A', dark: '#D99100', accent: '#FF7A1A' },
  lifeguard: { main: '#16B6C6', dark: '#0B8795', accent: '#FF6B5B' },
  vet:       { main: '#FF6FAE', dark: '#D9488A', accent: '#FFFFFF' },
};

export const PUPPIES = [
  { id: 'pilpel', name: 'פִּלְפֵּל', role: 'fire', breed: 'corgi',
    fur: '#F2913D', shade: '#D2702A', light: '#FFF4E6', earInner: '#FFB0A0',
    paw: '#FFF4E6', ears: 'pointy', tail: 'stub', blaze: true, iris: '#7A4B30' },
  { id: 'dubi', name: 'דּוּבִּי', role: 'police', breed: 'beagle',
    fur: '#D9975C', shade: '#B8773F', light: '#FFF6EA', earFur: '#8A5433', earShade: '#6E3F24',
    paw: '#FFF6EA', ears: 'floppy', tail: 'whip', blaze: true, iris: '#7A4B30' },
  { id: 'anani', name: 'עֲנָנִי', role: 'pilot', breed: 'samoyed',
    fur: '#FFFFFF', shade: '#DCE3F1', light: '#FFFFFF', earInner: '#FFC2CC',
    paw: '#FFFFFF', ears: 'small', tail: 'plume', fluffy: true, iris: '#6B4A3A' },
  { id: 'bloki', name: 'בְּלוֹקִי', role: 'builder', breed: 'collie',
    fur: '#46415A', shade: '#332F45', light: '#FFFFFF', earInner: '#8E7F95',
    paw: '#FFFFFF', ears: 'folded', tail: 'brush', blaze: true, wideBlaze: true, iris: '#A8733F', eyeRim: true },
  { id: 'gali', name: 'גַּלִּי', role: 'lifeguard', breed: 'schnauzer',
    fur: '#9CA5B8', shade: '#7B849A', light: '#F3F5FA', earFur: '#7B849A', earShade: '#646C80',
    paw: '#DDE2EC', ears: 'flap', tail: 'stubUp', beard: true, iris: '#6B4A3A' },
  { id: 'lulu', name: 'לוּלוּ', role: 'vet', breed: 'poodle',
    fur: '#F6BD86', shade: '#DE9E62', light: '#FFE3C2', earFur: '#F0B176',
    paw: '#F6BD86', ears: 'curly', tail: 'pompom', topknot: true, iris: '#6B4A3A' },
];

export const PUPPY = Object.fromEntries(PUPPIES.map((p) => [p.id, p]));

const HEAD = 'M200 58C272 58 318 102 318 160C318 214 270 246 200 246C130 246 82 214 82 160C82 102 128 58 200 58Z';
const BODY = 'M140 236C120 290 100 350 106 398C110 424 136 432 166 432L234 432C264 432 290 424 294 398C300 350 280 290 260 236Z';
const VEST = 'M60 230L340 230L340 316C300 338 250 348 200 348C150 348 100 338 60 316Z';
const VEST_BAND = 'M60 302C100 324 150 334 200 334C250 334 300 324 340 302L340 316C300 338 250 348 200 348C150 348 100 338 60 316Z';
const VEST_EDGE = 'M60 316C100 338 150 348 200 348C250 348 300 338 340 316';
const rrect = (x, y, w, h, r) => `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

// ---------- emblems (drawn around 0,0, about 36 units wide) ----------
export function emblem(role, r = ROLES[role]) {
  switch (role) {
    case 'fire':
      return `<path d="M0 -17C9 -6 15 1 13 8C11 15 5 18 0 18C-5 18 -11 15 -13 8C-15 0 -7 -4 -5 -12C-2 -6 2 -7 0 -17Z" fill="${r.main}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M0 2C5 6 7 10 5 13C3 16 -3 16 -5 13C-7 10 -4 6 0 2Z" fill="${r.accent}"/>`;
    case 'police':
      return `<path d="${starPath(0, 1, 17, 8)}" fill="${r.accent}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="0" cy="1" r="4" fill="${r.main}"/>`;
    case 'pilot': {
      const wing = 'M-4 -3C-10 -9 -21 -9 -26 -5C-22 -3 -20 -1 -22 2C-18 3 -16 5 -18 8C-11 9 -6 6 -4 2Z';
      return `<path d="${wing}" fill="${r.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="${wing}" transform="scale(-1 1)" fill="${r.main}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
<circle cx="0" cy="0" r="6" fill="${r.accent}" stroke="${INK}" stroke-width="2.2"/>`;
    }
    case 'builder':
      return `<g transform="rotate(-35)"><rect x="-3.5" y="-6" width="7" height="25" rx="3.5" fill="#B0703E" stroke="${INK}" stroke-width="2.2"/>
<rect x="-13" y="-15" width="26" height="11" rx="3.5" fill="#7D8BA3" stroke="${INK}" stroke-width="2.2"/></g>`;
    case 'lifeguard':
      return `<circle r="14" fill="none" stroke="${r.accent}" stroke-width="9"/>
<circle r="14" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="7.3 14.7" transform="rotate(20)"/>
<circle r="18.5" fill="none" stroke="${INK}" stroke-width="2.4"/><circle r="9.5" fill="none" stroke="${INK}" stroke-width="2.4"/>`;
    case 'vet':
      return `<path d="M0 15C-17 4 -19 -8 -11 -13C-5 -16 -1 -12 0 -9C1 -12 5 -16 11 -13C19 -8 17 4 0 15Z" fill="${r.main}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="0" cy="3" rx="5" ry="4" fill="#fff"/><circle cx="-5.5" cy="-3.5" r="2.3" fill="#fff"/><circle cx="0" cy="-6" r="2.3" fill="#fff"/><circle cx="5.5" cy="-3.5" r="2.3" fill="#fff"/>`;
  }
  return '';
}

// ---------- parts ----------
function tail(p) {
  const f = p.fur, s = p.shade;
  switch (p.tail) {
    case 'stub':
      return blob([[292, 404, 21], [310, 392, 17]], f);
    case 'whip':
      return `<path d="M262 402C300 398 320 362 318 316" fill="none" stroke="${INK}" stroke-width="28" stroke-linecap="round"/>
<path d="M262 402C300 398 320 362 318 316" fill="none" stroke="${f}" stroke-width="18" stroke-linecap="round"/>
<path d="M319 336C319 328 318 322 318 316" fill="none" stroke="${p.light}" stroke-width="18" stroke-linecap="round"/>`;
    case 'plume':
      return blob([[282, 396, 22], [304, 378, 25], [318, 350, 25], [316, 320, 23], [302, 298, 19], [284, 290, 14]], f);
    case 'brush':
      return blob([[284, 412, 19], [308, 410, 19], [330, 402, 18], [346, 388, 16]], f) +
        `<circle cx="352" cy="378" r="13" fill="${p.light}"/>`;
    case 'stubUp':
      return `<path d="M262 398C284 392 292 374 292 356" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
<path d="M262 398C284 392 292 374 292 356" fill="none" stroke="${f}" stroke-width="16" stroke-linecap="round"/>`;
    case 'pompom':
      return `<path d="M262 400C290 398 304 380 306 360" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
<path d="M262 400C290 398 304 380 306 360" fill="none" stroke="${s}" stroke-width="11" stroke-linecap="round"/>` +
        blob([[306, 344, 16], [292, 336, 13], [320, 336, 13], [306, 326, 13]], f);
  }
  return '';
}

function earsBack(p) {
  // Ears that sit behind the head outline.
  let left = '';
  if (p.ears === 'pointy') {
    left = `<g class="pup-ear-l"><path d="M104 126C88 82 80 42 92 14C114 22 152 48 164 78Z" fill="${p.fur}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M112 110C102 80 97 54 103 34C120 44 138 60 148 80Z" fill="${p.earInner}"/></g>`;
  } else if (p.ears === 'small') {
    left = `<g class="pup-ear-l"><path d="M98 122C86 94 88 66 98 46C118 52 136 66 146 86Z" fill="${p.fur}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M106 110C98 90 99 72 104 60C116 66 126 76 132 88Z" fill="${p.earInner}"/></g>`;
  } else if (p.ears === 'folded') {
    left = `<g class="pup-ear-l"><path d="M102 126C90 100 90 70 100 48C124 54 150 68 162 84Z" fill="${p.fur}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M110 112C102 94 102 76 106 64C122 70 138 80 146 90Z" fill="${p.earInner}"/>
<path d="M100 48C114 46 130 54 140 64C128 78 116 86 104 90C98 76 96 60 100 48Z" fill="${p.shade}" stroke="${INK}" stroke-width="${SW - 1}" stroke-linejoin="round"/></g>`;
  }
  if (!left) return '';
  const right = left.replace('pup-ear-l', 'pup-ear-r');
  return left + `<g transform="${mirrorX(200)}">${right}</g>`;
}

function earsFront(p) {
  let left = '';
  if (p.ears === 'floppy') {
    left = `<g class="pup-ear-l">${shaded('M122 84C86 80 60 118 58 172C56 222 72 262 98 262C120 262 130 236 130 196C130 150 134 104 122 84Z', p.earFur, p.earShade, { dx: 8, dy: -10 })}</g>`;
  } else if (p.ears === 'flap') {
    left = `<g class="pup-ear-l">${shaded('M100 104C94 80 106 62 128 58C146 58 158 70 158 84C148 104 128 118 112 124C104 118 100 112 100 104Z', p.earFur, p.earShade, { dx: 6, dy: -8 })}</g>`;
  } else if (p.ears === 'curly') {
    left = `<g class="pup-ear-l">${blob([[88, 134, 26], [80, 172, 27], [84, 208, 25], [98, 238, 21], [110, 118, 18]], p.earFur)}
<circle cx="76" cy="168" r="8" fill="${p.shade}" opacity=".45"/><circle cx="90" cy="214" r="7" fill="${p.shade}" opacity=".45"/></g>`;
  }
  if (!left) return '';
  const right = left.replace('pup-ear-l', 'pup-ear-r');
  return left + `<g transform="${mirrorX(200)}">${right}</g>`;
}

function eye(cx, cy, p, k) {
  const clip = `${k}e${cx}`;
  const rim = p.eyeRim ? `<ellipse cx="${cx}" cy="${cy}" rx="24" ry="28" fill="#FFFFFF" opacity=".9"/>` : '';
  return `${rim}<clipPath id="${clip}"><ellipse cx="${cx}" cy="${cy}" rx="21" ry="25"/></clipPath>
<ellipse cx="${cx}" cy="${cy}" rx="21" ry="25" fill="#35251F"/>
<g clip-path="url(#${clip})"><ellipse cx="${cx}" cy="${cy + 16}" rx="18" ry="12" fill="${p.iris}"/></g>
<ellipse cx="${cx}" cy="${cy + 2}" rx="12" ry="15" fill="#140E1A"/>
<ellipse cx="${cx}" cy="${cy}" rx="21" ry="25" fill="none" stroke="${INK}" stroke-width="3"/>
<circle cx="${cx + 7}" cy="${cy - 9}" r="7.5" fill="#fff"/><circle cx="${cx - 8}" cy="${cy + 9}" r="3.6" fill="#fff"/>`;
}

function face(p, k) {
  const L = 157, R = 243, Y = 146;
  const eyesOpen = `<g class="eye-open">${eye(L, Y, p, k)}${eye(R, Y, p, k)}</g>`;
  const eyesClosed = `<g class="eye-closed"><path d="M${L - 18} ${Y + 4}Q${L} ${Y - 18} ${L + 18} ${Y + 4}M${R - 18} ${Y + 4}Q${R} ${Y - 18} ${R + 18} ${Y + 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>`;
  const browColor = p.fur === '#46415A' ? '#8E869F' : INK;
  const brows = p.beard
    ? `<path d="M130 118C140 98 168 94 184 108C170 112 150 116 130 118Z M270 118C260 98 232 94 216 108C230 112 250 116 270 118Z" fill="${p.light}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`
    : `<path class="pup-brows" d="M144 109Q157 101 170 108M230 108Q243 101 256 109" fill="none" stroke="${browColor}" stroke-width="4.5" stroke-linecap="round"/>`;
  const nose = `<path d="M181 172C181 163 219 163 219 172C219 182 208 191 200 191C192 191 181 182 181 172Z" fill="${INK}"/>
<ellipse cx="193" cy="171" rx="7" ry="3.8" fill="#fff" opacity=".75"/>`;
  const mouthClip = `${k}m`;
  const mouthD = 'M175 199Q188 210 200 200Q212 210 225 199C225 226 213 238 200 238C187 238 175 226 175 199Z';
  const mouthOpen = `<g class="mouth-open"><clipPath id="${mouthClip}"><path d="${mouthD}"/></clipPath>
<path d="${mouthD}" fill="#6B1E3A"/><g clip-path="url(#${mouthClip})"><ellipse cx="200" cy="232" rx="16" ry="13" fill="#FF7C93"/></g>
<path d="${mouthD}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>`;
  const mouthClosed = `<g class="mouth-closed"><path d="M176 199Q188 212 200 201Q212 212 224 199" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  const noseLine = `<path d="M200 190L200 201" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="124" cy="190" rx="17" ry="10" fill="#FF8FA8" opacity=".5"/><ellipse cx="276" cy="190" rx="17" ry="10" fill="#FF8FA8" opacity=".5"/>`;
  let beard = '', mustache = '';
  if (p.beard) {
    beard = `<path d="M136 176C132 214 150 256 200 262C250 256 268 214 264 176C246 168 226 176 200 176C174 176 154 168 136 176Z" fill="${p.light}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M170 250L176 258M200 256L200 264M230 250L224 258" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    mustache = `<path d="M200 192C188 206 168 210 156 200C166 196 180 190 200 192ZM200 192C212 206 232 210 244 200C234 196 220 190 200 192Z" fill="${p.light}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  }
  return `${blush}<g class="pup-eyes">${eyesOpen}${eyesClosed}</g>${brows}${beard}${noseLine}${mouthOpen}${mouthClosed}${mustache}${nose}`;
}

function headShape(p, k) {
  let inner = '';
  if (p.blaze) {
    inner += p.wideBlaze
      ? `<path d="M182 170C182 124 188 92 200 66C212 92 218 124 218 170Z" fill="${p.light}"/>`
      : `<path d="M188 168C188 124 192 92 200 70C208 92 212 124 212 168Z" fill="${p.light}"/>`;
  }
  if (!p.beard) inner += `<ellipse cx="200" cy="198" rx="58" ry="41" fill="${p.light}"/>`;
  if (p.wideBlaze) inner += `<ellipse cx="200" cy="252" rx="80" ry="30" fill="${p.light}"/>`;
  inner += `<ellipse cx="146" cy="92" rx="30" ry="13" fill="#fff" opacity=".28" transform="rotate(-22 146 92)"/>`;
  let fluff = '';
  if (p.fluffy) {
    fluff = blob([[94, 176, 22], [100, 206, 24], [120, 232, 22], [148, 246, 18], [306, 176, 22], [300, 206, 24], [280, 232, 22], [252, 246, 18]], p.fur);
  }
  return fluff + shaded(HEAD, p.fur, p.shade, { dx: -14, dy: -12, inner, id: `${k}hd` });
}

// ---------- hats ----------
function hat(p) {
  const r = ROLES[p.role];
  switch (p.role) {
    case 'fire':
      return `<ellipse cx="200" cy="96" rx="108" ry="20" fill="${r.dark}" stroke="${INK}" stroke-width="${SW}"/>
${shaded('M130 98C128 50 160 22 200 22C240 22 272 50 270 98Q200 110 130 98Z', r.main, r.dark, { dx: -10, dy: -8 })}
<path d="M192 26Q200 18 208 26L208 100L192 100Z" fill="${r.dark}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M174 48L226 48L230 68Q200 98 170 68Z" fill="${r.accent}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<g transform="translate(200 64) scale(.62)">${emblem('fire', r)}</g>
<path d="M126 98Q200 114 274 98Q280 106 270 111Q200 126 130 111Q120 106 126 98Z" fill="${r.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="160" cy="46" rx="14" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 160 46)"/>`;
    case 'police':
      return `${shaded('M110 76C108 44 150 24 200 24C250 24 292 44 290 76Q200 94 110 76Z', r.main, r.dark, { dx: -10, dy: -8 })}
<path d="M126 78Q200 94 274 78L272 100Q200 116 128 100Z" fill="${r.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M130 100Q200 118 270 100Q264 122 200 128Q136 122 130 100Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<path d="M150 110Q200 122 250 110" fill="none" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>
<path d="${starPath(200, 62, 16, 7.5)}" fill="${r.accent}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<ellipse cx="150" cy="46" rx="16" ry="7" fill="#fff" opacity=".3" transform="rotate(-20 150 46)"/>`;
    case 'pilot':
      return `${shaded('M126 102C122 52 158 26 200 26C242 26 278 52 274 102Q200 88 126 102Z', r.main, r.dark, { dx: -10, dy: -8 })}
<path d="M200 28L200 88" stroke="${r.dark}" stroke-width="4" stroke-linecap="round"/>
<path d="M122 72Q200 62 278 72L278 88Q200 78 122 88Z" fill="#5B4636" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<circle cx="170" cy="80" r="22" fill="${r.accent}" stroke="${INK}" stroke-width="4"/><circle cx="230" cy="80" r="22" fill="${r.accent}" stroke="${INK}" stroke-width="4"/>
<circle cx="170" cy="80" r="14.5" fill="#9EE7FF" stroke="${INK}" stroke-width="3"/><circle cx="230" cy="80" r="14.5" fill="#9EE7FF" stroke="${INK}" stroke-width="3"/>
<path d="M162 76Q166 70 173 70M222 76Q226 70 233 70" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<rect x="190" y="76" width="20" height="8" rx="3" fill="${r.accent}" stroke="${INK}" stroke-width="3"/>`;
    case 'builder':
      return `${shaded('M128 98C126 48 160 24 200 24C240 24 274 48 272 98Z', r.main, r.dark, { dx: -10, dy: -8 })}
<rect x="188" y="21" width="24" height="78" rx="11" fill="${r.main}" stroke="${INK}" stroke-width="4"/>
<path d="M194 30L194 90" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/>
<path d="M108 98Q200 86 292 98Q300 110 284 112Q200 102 116 112Q100 110 108 98Z" fill="${r.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<circle cx="236" cy="64" r="11" fill="${r.accent}" stroke="${INK}" stroke-width="3"/>
<ellipse cx="156" cy="50" rx="13" ry="7" fill="#fff" opacity=".4" transform="rotate(-35 156 50)"/>`;
    case 'lifeguard':
      return `${shaded('M128 98C126 50 160 26 200 26C240 26 274 50 272 98Z', r.main, r.dark, { dx: -10, dy: -8 })}
<path d="M164 34Q156 64 158 96M236 34Q244 64 242 96" fill="none" stroke="${r.dark}" stroke-width="3" stroke-linecap="round"/>
<circle cx="200" cy="27" r="7" fill="${r.dark}" stroke="${INK}" stroke-width="3"/>
<path d="M134 94Q200 106 266 94C270 110 246 122 200 124C154 122 130 110 134 94Z" fill="${r.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<g transform="translate(200 64) scale(.72)">${emblem('lifeguard', r)}</g>`;
    case 'vet':
      return `${p.topknot ? blob([[180, 50, 19], [200, 38, 21], [220, 50, 19], [200, 62, 18]], p.fur) : ''}
<path d="M100 102Q200 56 300 102L298 118Q200 74 102 118Z" fill="${r.main}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<circle cx="200" cy="80" r="25" fill="#E3E9F3" stroke="${INK}" stroke-width="4"/>
<circle cx="200" cy="80" r="17" fill="#C7D1E0" stroke="${INK}" stroke-width="2.5"/>
<path d="M188 72Q192 66 199 65" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<circle cx="200" cy="80" r="4" fill="${INK}"/>`;
  }
  return '';
}

// ---------- body ----------
function body(p, k) {
  const r = ROLES[p.role];
  let stripes = '';
  if (p.role === 'fire') stripes = `<path d="M60 286C100 308 150 318 200 318C250 318 300 308 340 286L340 296C300 318 250 328 200 328C150 328 100 318 60 296Z" fill="${r.accent}"/>`;
  if (p.role === 'builder') stripes = `<path d="M60 286C100 308 150 318 200 318C250 318 300 308 340 286L340 296C300 318 250 328 200 328C150 328 100 318 60 296Z" fill="#E6ECF4"/>`;
  const inner = `<path d="${VEST}" fill="${r.main}"/>${stripes}
<path d="M246 230Q292 256 330 300L330 330Q280 344 246 346Z" fill="${r.dark}" opacity=".35"/>`;
  return shaded(BODY, p.fur, p.shade, { dx: -12, dy: -6, inner, id: `${k}bd` });
}

function vestTrim(p, k) {
  const r = ROLES[p.role];
  return `<clipPath id="${k}vt"><path d="${BODY}"/></clipPath>
<g clip-path="url(#${k}vt)"><path d="${VEST_BAND}" fill="${r.dark}"/><path d="${VEST_EDGE}" fill="none" stroke="${INK}" stroke-width="4"/></g>`;
}

function collar(p) {
  const r = ROLES[p.role];
  return `<path d="M128 244Q200 280 272 244L270 262Q200 298 130 262Z" fill="${r.dark}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
}

function patch(p) {
  const r = ROLES[p.role];
  return `<rect x="175" y="272" width="50" height="48" rx="13" fill="#fff" stroke="${INK}" stroke-width="4"/>
<rect x="180.5" y="277.5" width="39" height="37" rx="9" fill="none" stroke="${r.dark}" stroke-width="2" stroke-dasharray="4 3"/>
<g transform="translate(200 296) scale(.78)">${emblem(p.role, r)}</g>`;
}

function accessory(p) {
  const r = ROLES[p.role];
  if (p.role === 'vet') {
    return `<path d="M144 254C130 300 160 338 200 342C240 338 270 300 256 254" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
<path d="M144 254C130 300 160 338 200 342C240 338 270 300 256 254" fill="none" stroke="#5B6A8A" stroke-width="5" stroke-linecap="round"/>
<path d="M238 334L246 356" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M238 334L246 356" stroke="#5B6A8A" stroke-width="4" stroke-linecap="round"/>
<circle cx="248" cy="364" r="12" fill="#D5DDEA" stroke="${INK}" stroke-width="4"/><circle cx="248" cy="364" r="5" fill="#fff"/>`;
  }
  if (p.role === 'lifeguard') {
    return `<path d="M156 258C146 292 146 322 154 344" fill="none" stroke="${r.accent}" stroke-width="4" stroke-linecap="round"/>
<rect x="138" y="342" width="34" height="18" rx="8" fill="${r.accent}" stroke="${INK}" stroke-width="3.5"/><circle cx="146" cy="351" r="3.5" fill="${INK}"/>`;
  }
  if (p.role === 'pilot') {
    return `<path d="M252 252C278 250 300 262 320 254C312 272 292 280 270 276C288 290 280 300 262 296C250 290 244 272 252 252Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  }
  return '';
}

function legs(p, k) {
  const leg = (x) => shaded(rrect(x, 336, 46, 92, 23), p.fur, p.shade, { dx: -9, dy: 0, id: `${k}lg${x}` });
  const paw = (cx) => `${shadedEllipse(cx, 424, 30, 16, p.paw, p.fur === p.paw ? p.shade : '#E6DED6', { id: `${k}pw${cx}` })}
<path d="M${cx - 9} 420L${cx - 9} 429M${cx + 9} 420L${cx + 9} 429" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  return leg(151) + leg(203) + paw(174) + paw(226);
}

function haunches(p, k) {
  const h = (cx) => shadedEllipse(cx, 398, 46, 36, p.fur, p.shade, { id: `${k}hn${cx}` });
  const hp = (cx) => shadedEllipse(cx, 426, 26, 13, p.paw, p.fur === p.paw ? p.shade : '#E6DED6', { id: `${k}hp${cx}` });
  return h(122) + h(278) + hp(98) + hp(302);
}

// ---------- public ----------
// opts.headOnly: crop to the head (for vehicles and profile cards).
export function puppySVG(id, opts = {}) {
  const p = PUPPY[id];
  const k = uid('p');
  const head = `<g class="pup-head">${earsBack(p)}${headShape(p, k)}${face(p, k)}${earsFront(p)}${hat(p)}</g>`;
  if (opts.headOnly) {
    return svgWrap('40 -6 320 300', head, `pup pup-${id} ${opts.className || ''}`, 'aria-hidden="true"');
  }
  const inner = `<ellipse cx="200" cy="432" rx="150" ry="12" fill="${INK}" opacity=".14"/>
<g class="pup-tail">${tail(p)}</g>
${body(p, k)}${haunches(p, k)}${legs(p, k)}${vestTrim(p, k)}${collar(p)}${patch(p)}${accessory(p)}${head}`;
  return svgWrap('0 0 400 440', `<g class="pup-root">${inner}</g>`, `pup pup-${id} ${opts.className || ''}`, 'aria-hidden="true"');
}
