// Backgrounds, the bay map, mission items, and small icons.
// Stage coordinates: 1280 x 800. Backgrounds extend past the stage edges to fill any screen shape.

import { INK, uid, blob, shaded, starPath } from './common.js';

const SKY_TOP = '#8FD6F2', SKY_LOW = '#D9F3FB';
const SEA = '#2FA9C8', SEA_DEEP = '#1C8FB3', SEA_LIGHT = '#6FD0E3';
const SAND = '#F6DDA4', SAND_SHADE = '#E9C782';
const GRASS = '#8CCB5E', GRASS_DARK = '#6BB04A', HILL = '#A7D96E';

const EXT = 'x="-800" y="-600" width="2880" height="2000"'; // big rect that covers any aspect ratio

function defs(k) {
  return `<defs>
<linearGradient id="${k}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset="1" stop-color="${SKY_LOW}"/></linearGradient>
<linearGradient id="${k}sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SEA_LIGHT}"/><stop offset="1" stop-color="${SEA_DEEP}"/></linearGradient>
</defs>`;
}

export function cloud(x, y, s = 1, cls = 'cloud') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}">${blob([[0, 0, 34], [40, -16, 42], [84, -4, 36], [116, 10, 26], [-30, 12, 24], [50, 18, 30]], '#FFFFFF', 0, '#FFFFFF')}
<path d="M-50 30L140 30" stroke="#E4F4FA" stroke-width="10" stroke-linecap="round"/></g></g>`;
}

function sun(x, y) {
  return `<g class="sun"><circle cx="${x}" cy="${y}" r="70" fill="#FFF2B3" opacity=".6"/><circle cx="${x}" cy="${y}" r="48" fill="#FFD84A"/></g>`;
}

function waves(y, color = '#FFFFFF', op = 0.6, cls = 'wave') {
  let d = `M-400 ${y}`;
  for (let x = -400; x < 1700; x += 60) d += `q15 -10 30 0t30 0`;
  return `<path class="${cls}" d="${d}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity="${op}"/>`;
}

export function lighthouse(x, y, s = 1) {
  // base center at (x, y)
  return `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M-46 0L-30 -250L30 -250L46 0Z" fill="#FFF8EE" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<clipPath id="lhc${x}"><path d="M-46 0L-30 -250L30 -250L46 0Z"/></clipPath>
<g clip-path="url(#lhc${x})" fill="#E5484D"><rect x="-60" y="-70" width="120" height="44"/><rect x="-60" y="-160" width="120" height="44"/><rect x="-60" y="-250" width="120" height="30"/>
<rect x="10" y="-260" width="50" height="270" fill="#000" opacity=".08"/></g>
<rect x="-12" y="-44" width="24" height="44" rx="12" fill="#6B4A3A" stroke="${INK}" stroke-width="4"/>
<rect x="-10" y="-205" width="20" height="26" rx="8" fill="#BDEBFF" stroke="${INK}" stroke-width="3.5"/>
<rect x="-44" y="-262" width="88" height="16" rx="6" fill="#3A3450" stroke="${INK}" stroke-width="4"/>
<rect x="-26" y="-310" width="52" height="48" rx="8" fill="#FFE27A" stroke="${INK}" stroke-width="4"/>
<path class="lh-beam" d="M0 -290L-330 -350L-330 -230Z" fill="#FFF3B0" opacity=".45"/>
<circle cx="0" cy="-286" r="14" fill="#FFF8D6"/>
<path d="M-34 -310Q0 -350 34 -310Z" fill="#E5484D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<circle cx="0" cy="-336" r="6" fill="${INK}"/></g>`;
}

export function palm(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
<path d="M0 0C4 -40 2 -80 14 -120" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
<path d="M0 0C4 -40 2 -80 14 -120" fill="none" stroke="#B9814F" stroke-width="12" stroke-linecap="round"/>
<g fill="#4FAF4A" stroke="${INK}" stroke-width="4" stroke-linejoin="round">
<path d="M14 -120C-20 -140 -56 -130 -70 -106C-40 -118 -14 -116 14 -120Z"/><path d="M14 -120C44 -146 84 -138 96 -112C66 -122 40 -120 14 -120Z"/>
<path d="M14 -120C0 -160 20 -186 44 -190C30 -166 24 -144 14 -120Z"/><path d="M14 -120C-24 -110 -40 -80 -34 -60C-18 -86 -4 -104 14 -120Z"/>
<path d="M14 -120C50 -112 70 -86 66 -64C50 -88 34 -104 14 -120Z"/></g>
<circle cx="8" cy="-116" r="8" fill="#8A5A34" stroke="${INK}" stroke-width="3"/><circle cx="22" cy="-112" r="8" fill="#8A5A34" stroke="${INK}" stroke-width="3"/></g>`;
}

export function tree(x, y, s = 1, color = '#5DB85A') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-40" width="20" height="44" rx="6" fill="#9A6A42" stroke="${INK}" stroke-width="4"/>
${blob([[0, -80, 42], [-34, -56, 30], [34, -56, 30], [0, -120, 30]], color, 4)}
<circle cx="-14" cy="-98" r="10" fill="#fff" opacity=".2"/></g>`;
}

function boat(x, y, color = '#E5484D', s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="bob"><path d="M-50 0L50 0L38 22L-38 22Z" fill="${color}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M0 0L0 -64" stroke="${INK}" stroke-width="4"/><path d="M4 -60L40 -8L4 -8Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g></g>`;
}

// ---------- title / bay panorama ----------
export function bayPanorama() {
  const k = uid('bay');
  return `<svg class="scene-bg" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs(k)}
<rect ${EXT} fill="url(#${k}sky)"/>${sun(90, 80)}
${cloud(140, 120, 1.1)}${cloud(620, 80, .8)}${cloud(900, 200, .7)}
<rect x="-800" y="430" width="2880" height="1400" fill="url(#${k}sea)"/>
<path d="M-800 438L2080 438" stroke="#fff" stroke-width="4" opacity=".6"/>
${waves(480)}${waves(540, '#fff', .45)}${waves(610, '#fff', .35)}
${boat(420, 500, '#FFC21A', .8)}${boat(640, 470, '#8B5CF6', .55)}
<path d="M900 440C960 360 1060 330 1180 340C1260 346 1320 380 1400 400L1400 900L860 900Z" fill="#8E97AE" stroke="${INK}" stroke-width="5"/>
<path d="M950 440C1010 390 1090 370 1180 376C1260 382 1320 410 1400 430L1400 900L920 900Z" fill="#A6AEC3"/>
${lighthouse(1120, 360, 1)}
<path d="M-800 700C-200 640 200 640 600 680C900 710 1100 690 1400 660L2080 640L2080 1400L-800 1400Z" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
<path d="M-800 740C-200 690 200 690 600 726C900 752 1100 734 1400 706L2080 690L2080 1400L-800 1400Z" fill="${SAND_SHADE}" opacity=".5"/>
${palm(120, 700, 1.2)}${palm(1250, 680, .9)}
</svg>`;
}

// ---------- map ----------
// Station positions along the coast road, lighthouse home first.
export const MAP_POINTS = [
  { x: 1100, y: 300 },  // 0: lighthouse
  { x: 1060, y: 470 },  // 1: bridge
  { x: 880, y: 620 },   // 2: harbor
  { x: 660, y: 690 },   // 3: beach
  { x: 440, y: 680 },   // 4: forest
  { x: 240, y: 600 },   // 5: farm
  { x: 130, y: 420 },   // 6: hill
  { x: 230, y: 230 },   // 7: reef
  { x: 560, y: 290 },   // 8: island
];

export const ROAD = 'M1100 300C1120 360 1100 420 1060 470C1010 520 950 590 880 620C810 650 740 690 660 690C580 690 520 680 440 680C360 680 290 650 240 600C190 550 110 490 130 420C150 350 170 280 230 230C300 180 380 250 450 270C500 284 530 290 560 290';

export function mapArt() {
  const k = uid('map');
  return `<svg class="map-art" viewBox="0 0 1280 800" aria-hidden="true">${defs(k)}
<rect ${EXT} fill="url(#${k}sea)"/>
${waves(120, '#fff', .35)}${waves(380, '#fff', .3)}${waves(520, '#fff', .25)}
<path d="M1400 -200L1400 1000L-200 1000L-200 -200L40 -200C60 120 20 300 60 420C90 520 200 640 330 700C460 760 740 760 900 700C1020 650 1120 560 1180 420C1220 320 1180 200 1240 -200Z" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
<path d="M1400 -200L1400 1000L-200 1000L-200 -200L0 -200C20 120 -20 300 20 430C60 540 190 670 330 734C470 796 760 796 910 736C1040 682 1150 588 1214 430C1256 330 1216 200 1280 -200Z" fill="${GRASS}"/>
<path d="M1400 -200L1400 1000L-200 1000L-200 -200L-40 -200C-20 120 -60 310 -20 440C30 570 180 710 330 772C480 830 770 830 924 770C1060 716 1180 610 1250 440C1296 330 1256 200 1320 -200Z" fill="${GRASS_DARK}" opacity=".35"/>
<ellipse cx="560" cy="300" rx="120" ry="62" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
<ellipse cx="560" cy="290" rx="92" ry="42" fill="${GRASS}"/>
${palm(610, 290, .55)}${palm(506, 300, .45)}
<path d="M300 236C380 250 450 272 500 286" fill="none" stroke="#9A6A42" stroke-width="26" stroke-linecap="round"/>
<path d="M300 236C380 250 450 272 500 286" fill="none" stroke="#C99A62" stroke-width="16" stroke-linecap="round" stroke-dasharray="6 10"/>
<path d="${ROAD}" fill="none" stroke="${INK}" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
<path d="${ROAD}" fill="none" stroke="#F3E3BF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${ROAD}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="14 16" stroke-linecap="round" opacity=".9"/>
${landmarks()}
${lighthouse(1150, 236, .5)}
${cloud(700, 70, .55)}${cloud(330, 110, .45)}${cloud(980, 150, .4)}
</svg>`;
}

function landmarks() {
  // bridge (1), harbor boats (2), umbrella (3), trees (4), barn (5), windmill hill (6), reef rocks (7)
  return `
<g transform="translate(1000 420)"><path d="M-30 30Q30 -20 90 30" fill="none" stroke="#B97A45" stroke-width="12"/><path d="M-30 30Q30 -20 90 30" fill="none" stroke="${INK}" stroke-width="3" opacity=".5"/>
<path d="M-20 28L-20 50M30 8L30 50M80 28L80 50" stroke="#8A5A34" stroke-width="7"/></g>
${boat(960, 700, '#E5484D', .6)}${boat(1010, 740, '#16B6C6', .5)}
<g transform="translate(760 740)"><path d="M0 0L0 -60" stroke="${INK}" stroke-width="4"/><path d="M-44 -54Q0 -96 44 -54Z" fill="#FF6FAE" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M-15 -60Q0 -92 15 -60" fill="#fff"/></g>
${tree(380, 760, .6)}${tree(500, 770, .5, '#4FA84E')}${tree(330, 730, .45, '#6CC266')}
<g transform="translate(150 700)"><path d="M-40 0L-40 -46L0 -74L40 -46L40 0Z" fill="#E5484D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<rect x="-14" y="-30" width="28" height="30" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M-14 -30L14 0M14 -30L-14 0" stroke="${INK}" stroke-width="2.5"/></g>
<g transform="translate(60 370)"><ellipse cx="0" cy="10" rx="70" ry="30" fill="${HILL}" stroke="${INK}" stroke-width="4"/>
<path d="M-6 0L-4 -60L4 -60L6 0Z" fill="#fff" stroke="${INK}" stroke-width="3"/><g class="spin" style="transform-origin:0px -60px"><path d="M0 -60L-26 -86M0 -60L26 -34M0 -60L26 -86M0 -60L-26 -34" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g></g>
<g transform="translate(120 190)"><ellipse cx="0" cy="0" rx="36" ry="18" fill="#8E97AE" stroke="${INK}" stroke-width="4"/><ellipse cx="40" cy="14" rx="22" ry="12" fill="#A6AEC3" stroke="${INK}" stroke-width="4"/>
<path d="M-10 -2l8 -8l8 8l-8 8z" fill="#FF8A5B" stroke="${INK}" stroke-width="2"/></g>`;
}

// ---------- mission backdrops ----------
export function missionBackdrop(theme) {
  const k = uid('bd');
  const sky = `${defs(k)}<rect ${EXT} fill="url(#${k}sky)"/>`;
  const seaBand = (y) => `<rect x="-800" y="${y}" width="2880" height="1400" fill="url(#${k}sea)"/><path d="M-800 ${y}L2080 ${y}" stroke="#fff" stroke-width="4" opacity=".6"/>${waves(y + 60)}${waves(y + 130, '#fff', .4)}`;
  const ground = (y, color = GRASS) => `<path d="M-800 ${y}C-200 ${y - 40} 300 ${y - 50} 700 ${y - 20}C1000 ${y}, 1300 ${y - 30}, 2080 ${y - 40}L2080 1600L-800 1600Z" fill="${color}" stroke="${INK}" stroke-width="5"/>`;
  let body = '';
  switch (theme) {
    case 'bridge':
      body = `${sun(1100, 110)}${cloud(160, 110)}${cloud(760, 70, .7)}${seaBand(330)}
<path d="M-800 300L250 300L250 820L-800 820Z" fill="${GRASS}" stroke="${INK}" stroke-width="5"/>
<path d="M1030 300L2080 300L2080 820L1030 820Z" fill="${GRASS}" stroke="${INK}" stroke-width="5"/>
<path d="M200 300Q640 120 1080 300" fill="none" stroke="#B97A45" stroke-width="26"/><path d="M200 300Q640 120 1080 300" fill="none" stroke="${INK}" stroke-width="4" opacity=".5"/>
${[300, 420, 540, 660, 780, 900, 1000].map((x) => `<path d="M${x} ${300 - Math.sin(((x - 200) / 880) * Math.PI) * 90 + 10}L${x} 340" stroke="#8A5A34" stroke-width="8"/>`).join('')}
${tree(120, 330, .8)}${tree(1180, 330, .9, '#4FA84E')}`;
      break;
    case 'harbor':
      body = `${sun(180, 120)}${cloud(500, 90, .8)}${cloud(1000, 140, .6)}${seaBand(360)}
<g transform="translate(0 70)"><g class="bob"><path d="M300 220L760 220L740 330L320 330Z" fill="#E5484D" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M306 250L754 250" stroke="#fff" stroke-width="8"/>
<rect x="400" y="150" width="200" height="70" rx="10" fill="#fff" stroke="${INK}" stroke-width="5"/><rect x="560" y="80" width="30" height="70" fill="#FFC21A" stroke="${INK}" stroke-width="5"/>
${[430, 480, 530].map((x) => `<circle cx="${x}" cy="185" r="12" fill="#BDEBFF" stroke="${INK}" stroke-width="3.5"/>`).join('')}</g>
<path d="M280 330Q300 318 320 330T360 330T400 330T440 330T480 330T520 330T560 330T600 330T640 330T680 330T720 330T760 330" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/></g>
<path d="M-800 560L2080 560L2080 1600L-800 1600Z" fill="#B98A5A" stroke="${INK}" stroke-width="5"/>
${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => `<path d="M${-200 + i * 160} 560L${-200 + i * 160} 1000" stroke="#8A5A34" stroke-width="4"/>`).join('')}
<rect x="1060" y="380" width="30" height="180" fill="#8A5A34" stroke="${INK}" stroke-width="4"/><rect x="1150" y="380" width="30" height="180" fill="#8A5A34" stroke="${INK}" stroke-width="4"/>`;
      break;
    case 'beach':
      body = `${sun(1080, 120)}${cloud(220, 100, .9)}${cloud(700, 160, .6)}${seaBand(300)}
<path d="M-800 470C-100 430 400 430 700 450C1000 470 1400 430 2080 440L2080 1600L-800 1600Z" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
${palm(80, 520, 1.1)}${palm(1220, 500, 1)}
<g transform="translate(1000 520)"><path d="M0 0L0 -120" stroke="${INK}" stroke-width="5"/><path d="M-90 -110Q0 -190 90 -110Z" fill="#FF6FAE" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M-30 -118Q0 -180 30 -118" fill="#fff"/></g>`;
      break;
    case 'forest':
      body = `${cloud(200, 90, .8)}${cloud(900, 70, .7)}
${ground(560, GRASS)}
${tree(120, 600, 2.4, '#4FA84E')}${tree(1180, 610, 2.6, '#5DB85A')}${tree(640, 590, 3.2, '#57B356')}
${tree(360, 580, 1.4, '#6CC266')}${tree(920, 580, 1.5, '#6CC266')}`;
      break;
    case 'farm':
      body = `${sun(160, 110)}${cloud(620, 90, .8)}${cloud(1040, 150, .6)}
<ellipse cx="300" cy="560" rx="700" ry="180" fill="${HILL}" stroke="${INK}" stroke-width="5"/>
<g transform="translate(1040 520)"><path d="M-120 0L-120 -150L0 -230L120 -150L120 0Z" fill="#E5484D" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M-140 -140L0 -250L140 -140" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/><rect x="-44" y="-90" width="88" height="90" fill="#fff" stroke="${INK}" stroke-width="4"/>
<path d="M-44 -90L44 0M44 -90L-44 0" stroke="${INK}" stroke-width="4"/></g>
${ground(600, GRASS)}
<path d="M-200 640L1500 640" stroke="#B98A5A" stroke-width="8"/>${[...Array(18)].map((_, i) => `<path d="M${-160 + i * 90} 610L${-160 + i * 90} 680" stroke="#B98A5A" stroke-width="10" stroke-linecap="round"/>`).join('')}`;
      break;
    case 'hill':
      body = `${sun(1100, 120)}${cloud(160, 150, 1)}${cloud(560, 70, .9)}${cloud(900, 230, .7)}
<ellipse cx="1000" cy="720" rx="700" ry="260" fill="${HILL}" stroke="${INK}" stroke-width="5"/>
<ellipse cx="200" cy="760" rx="600" ry="220" fill="${GRASS}" stroke="${INK}" stroke-width="5"/>
<g transform="translate(1080 470)"><path d="M-14 0L-8 -150L8 -150L14 0Z" fill="#fff" stroke="${INK}" stroke-width="4"/>
<g class="spin" style="transform-origin:0px -150px"><path d="M0 -150L-60 -210M0 -150L60 -90M0 -150L60 -210M0 -150L-60 -90" stroke="${INK}" stroke-width="12" stroke-linecap="round"/></g><circle cx="0" cy="-150" r="10" fill="#FFC21A" stroke="${INK}" stroke-width="4"/></g>`;
      break;
    case 'reef':
      body = `<rect ${EXT} fill="url(#${k}sea)"/>
<rect x="-800" y="-600" width="2880" height="640" fill="${SEA_LIGHT}" opacity=".6"/>
${[...Array(9)].map((_, i) => `<path d="M${-100 + i * 180} -40L${-40 + i * 180} 800" stroke="#fff" stroke-width="40" opacity=".06"/>`).join('')}
<path d="M-800 640C-200 600 300 610 700 630C1000 640 1400 610 2080 620L2080 1600L-800 1600Z" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
${coral(140, 650, '#FF6B8A')}${coral(1140, 640, '#FF9A3D')}${coral(980, 660, '#B57BFF', .7)}
<g class="bubbles-bg">${[80, 300, 700, 1000, 1220].map((x, i) => `<circle cx="${x}" cy="${500 - i * 60}" r="${8 + (i % 3) * 4}" fill="none" stroke="#fff" stroke-width="3" opacity=".5"/>`).join('')}</g>`;
      break;
    case 'island':
      body = `${sun(640, 100)}${cloud(160, 120)}${cloud(1000, 90, .8)}${seaBand(380)}
<ellipse cx="640" cy="640" rx="560" ry="150" fill="${SAND}" stroke="${INK}" stroke-width="5"/>
<ellipse cx="640" cy="610" rx="420" ry="90" fill="${GRASS}"/>
${palm(300, 600, 1.2)}${palm(1000, 600, 1.1)}${lighthouse(640, 560, .55)}`;
      break;
  }
  return `<svg class="scene-bg" viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sky}${body}</svg>`;
}

function coral(x, y, color, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0C-4 -40 -30 -60 -40 -100M0 0C0 -50 10 -80 6 -130M0 0C10 -30 40 -50 50 -90" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/>
<path d="M0 0C-4 -40 -30 -60 -40 -100M0 0C0 -50 10 -80 6 -130M0 0C10 -30 40 -50 50 -90" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/></g>`;
}

// ---------- mission items (the thing that carries a letter) ----------
// Each returns an SVG sized 200 x 200 with the letter area centered near (100, 104).
export const ITEM_FOR_THEME = {
  bridge: 'bubble', harbor: 'crate', beach: 'shell', forest: 'apple',
  farm: 'egg', hill: 'balloon', reef: 'fish', island: 'star',
};

const BALLOON_COLORS = ['#FF6B8A', '#FFC21A', '#8B5CF6', '#16B6C6', '#FF8A3D', '#5DB85A'];

export function itemSVG(type, variant = 0) {
  const k = uid('it');
  let g = '';
  switch (type) {
    case 'bubble':
      g = `<circle cx="100" cy="100" r="86" fill="#E9FBFF" fill-opacity=".72" stroke="${INK}" stroke-width="5"/>
<circle cx="100" cy="100" r="78" fill="none" stroke="#9EE7FF" stroke-width="6" opacity=".7"/>
<path d="M48 70Q60 42 90 34" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="150" cy="148" r="8" fill="#fff" opacity=".9"/>`;
      break;
    case 'crate':
      g = `${shaded('M20 28H180V180H20Z', '#D9A066', '#B97A45', { dx: -8, dy: -8, id: `${k}c` })}
<rect x="32" y="40" width="136" height="128" fill="#F2D2A2" stroke="${INK}" stroke-width="4"/>
<path d="M20 28L40 48M180 28L160 48M20 180L40 160M180 180L160 160" stroke="${INK}" stroke-width="4"/>`;
      break;
    case 'shell':
      g = `<path d="M100 186L60 176C30 160 12 120 22 84C32 50 64 26 100 26C136 26 168 50 178 84C188 120 170 160 140 176Z" fill="#FFC9B5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
<path d="M100 186L100 40M100 186L60 50M100 186L140 50M100 186L32 94M100 186L168 94" stroke="#F2A58C" stroke-width="5"/>
<ellipse cx="100" cy="110" rx="58" ry="46" fill="#FFF3EA"/><path d="M84 174H116V194H84Z" fill="#FFC9B5" stroke="${INK}" stroke-width="4"/>`;
      break;
    case 'apple':
      g = `<path d="M100 14C104 28 104 40 100 48" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
<path d="M104 30C120 10 150 10 160 22C144 38 120 40 104 30Z" fill="#5DB85A" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
${shaded('M100 52C124 36 176 38 186 90C196 150 150 196 118 188C108 186 104 182 100 182C96 182 92 186 82 188C50 196 4 150 14 90C24 38 76 36 100 52Z', '#EF4B4B', '#C73333', { dx: -10, dy: -8, id: `${k}a` })}
<ellipse cx="100" cy="116" rx="54" ry="48" fill="#FFF1E8"/><ellipse cx="46" cy="80" rx="12" ry="18" fill="#fff" opacity=".35" transform="rotate(25 46 80)"/>`;
      break;
    case 'egg':
      g = `${shaded('M100 12C146 12 180 84 180 124C180 166 146 192 100 192C54 192 20 166 20 124C20 84 54 12 100 12Z', '#FFF8EC', '#EEDFC8', { dx: -10, dy: -10, id: `${k}e` })}
<ellipse cx="62" cy="64" rx="12" ry="20" fill="#fff" transform="rotate(25 62 64)"/>`;
      break;
    case 'balloon': {
      const c = BALLOON_COLORS[variant % BALLOON_COLORS.length];
      g = `<path d="M100 176C96 190 108 200 100 214" fill="none" stroke="${INK}" stroke-width="3"/>
${shaded('M100 6C150 6 184 44 184 92C184 140 144 176 100 176C56 176 16 140 16 92C16 44 50 6 100 6Z', c, shadeOf(c), { dx: -10, dy: -10, id: `${k}b` })}
<path d="M90 176L110 176L104 188L96 188Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<ellipse cx="100" cy="94" rx="58" ry="54" fill="#fff" opacity=".85"/><ellipse cx="50" cy="52" rx="12" ry="20" fill="#fff" opacity=".45" transform="rotate(35 50 52)"/>`;
      break;
    }
    case 'fish': {
      const c = BALLOON_COLORS[(variant + 2) % BALLOON_COLORS.length];
      g = `<path d="M150 100L196 60L190 100L196 140Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
${shaded('M10 100C30 44 80 26 116 32C150 38 166 70 166 100C166 130 150 162 116 168C80 174 30 156 10 100Z', c, shadeOf(c), { dx: -8, dy: -10, id: `${k}f` })}
<ellipse cx="96" cy="100" rx="52" ry="50" fill="#fff" opacity=".9"/><circle cx="36" cy="86" r="9" fill="${INK}"/><circle cx="33" cy="83" r="3" fill="#fff"/>`;
      break;
    }
    case 'star':
      g = `${shaded(starPath(100, 106, 96, 48), '#FFD84A', '#F0B429', { dx: -8, dy: -8, id: `${k}s` })}<circle cx="100" cy="108" r="44" fill="#FFF6C8"/>`;
      break;
    case 'badge':
      g = `<circle cx="100" cy="100" r="92" fill="#F0B429" stroke="${INK}" stroke-width="5"/>
<path d="${starPath(100, 100, 88, 74, 16)}" fill="#FFD84A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
<circle cx="100" cy="100" r="66" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/>`;
      break;
  }
  return `<svg class="item-art" viewBox="0 0 200 200" aria-hidden="true">${g}</svg>`;
}

function shadeOf(hex) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.round(v * 0.8));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// ---------- icons (48 x 48) ----------
export const ICONS = {
  gear: `<svg viewBox="0 0 48 48"><path d="M24 6l4 1 1 5 4 2 4-3 3 3-3 4 2 4 5 1 1 4-1 4-5 1-2 4 3 4-3 3-4-3-4 2-1 5-4 1-4-1-1-5-4-2-4 3-3-3 3-4-2-4-5-1-1-4 1-4 5-1 2-4-3-4 3-3 4 3 4-2 1-5z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="24" cy="24" r="7" fill="#8C93A8" stroke="${INK}" stroke-width="3"/></svg>`,
  map: `<svg viewBox="0 0 48 48"><path d="M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z" fill="#8CCB5E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M18 7v29M30 12v29" stroke="${INK}" stroke-width="3"/><path d="M10 26q8-8 14-2t14-6" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="3 3"/></svg>`,
  check: `<svg viewBox="0 0 48 48"><path d="M10 25l9 9 19-20" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  plus: `<svg viewBox="0 0 48 48"><path d="M24 10v28M10 24h28" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`,
  lock: `<svg viewBox="0 0 48 48"><rect x="10" y="21" width="28" height="21" rx="5" fill="#B9C0D0" stroke="${INK}" stroke-width="3"/><path d="M16 21v-5a8 8 0 0 1 16 0v5" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="24" cy="31" r="3" fill="${INK}"/></svg>`,
  star: `<svg viewBox="0 0 48 48"><path d="${starPath(24, 25, 20, 9)}" fill="#FFD84A" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  badges: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#F0B429" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="24" r="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="${starPath(24, 24.5, 8, 3.6)}" fill="#FFD84A" stroke="${INK}" stroke-width="2"/></svg>`,
  speaker: `<svg viewBox="0 0 48 48"><path d="M8 18h8l10-8v28l-10-8H8z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M32 17q5 7 0 14M36 12q9 12 0 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  back: `<svg viewBox="0 0 48 48"><path d="M18 12l14 12-14 12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  down: `<svg viewBox="0 0 48 48"><path d="M24 44L6 22H16V4H32V22H42Z" fill="#FFC93C" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/></svg>`,
  play: `<svg viewBox="0 0 48 48"><path d="M17 11l20 13-20 13z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`,
};
