// One vehicle per puppy, side view, facing left (the team drives from right to left).
// viewBox 360 x 240. The puppy head sits in the driver seat.
// Animated parts: veh-body, veh-wheel, veh-rotor, veh-siren (see css/art.css).

import { INK, SW, uid, shaded, svgWrap } from './common.js';
import { ROLES, PUPPY, puppySVG, emblem } from './puppies.js';

const GLASS = '#BDEBFF';

function wheel(cx, cy, r = 30) {
  return `<g class="veh-wheel"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#3A3450" stroke="${INK}" stroke-width="${SW}"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.48}" fill="#D5DCE7" stroke="${INK}" stroke-width="3.5"/>
<circle cx="${cx}" cy="${cy - r * 0.25}" r="3" fill="${INK}"/><circle cx="${cx - r * 0.22}" cy="${cy + r * 0.13}" r="3" fill="${INK}"/><circle cx="${cx + r * 0.22}" cy="${cy + r * 0.13}" r="3" fill="${INK}"/></g>`;
}

// Puppy head placed with its center near (cx, cy) and a given width.
function head(id, cx, cy, w = 120) {
  const h = w * (300 / 320);
  const inner = puppySVG(id, { headOnly: true }).replace('<svg ', `<svg x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" `);
  return inner;
}

function windshield(x, y) {
  return `<path d="M${x} ${y + 50}L${x + 18} ${y}L${x + 30} ${y}L${x + 26} ${y + 50}Z" fill="${GLASS}" opacity=".85" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M${x + 16} ${y + 12}L${x + 11} ${y + 30}" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
}

function siren(x, y, color) {
  return `<rect x="${x - 4}" y="${y + 10}" width="30" height="8" rx="3" fill="#8C93A8" stroke="${INK}" stroke-width="3"/>
<path class="veh-siren" d="M${x} ${y + 11}C${x} ${y - 6} ${x + 22} ${y - 6} ${x + 22} ${y + 11}Z" fill="${color}" stroke="${INK}" stroke-width="3.5"/>
<path d="M${x + 6} ${y + 4}Q${x + 8} ${y - 1} ${x + 12} ${y - 1}" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function badgeDisk(role, x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="24" fill="#fff" stroke="${INK}" stroke-width="4"/><g transform="scale(.8)">${emblem(role)}</g></g>`;
}

function car(p, k, { bodyD, extra = '', front = '', wheels = [[92, 196], [272, 196]] }) {
  const r = ROLES[p.role];
  return `<g class="veh-body">${extra}${head(p.id, 134, 40, 156)}
${shaded(bodyD, r.main, r.dark, { dx: -10, dy: -10, id: `${k}b` })}
${front}</g>${wheels.map(([x, y]) => wheel(x, y)).join('')}`;
}

const BUILDERS = {
  fire(p, k) {
    const r = ROLES.fire;
    const bodyD = 'M34 190L34 128Q34 110 52 110L336 110Q344 110 344 118L344 190Z';
    const ladder = `<g stroke="${INK}" stroke-width="4" stroke-linecap="round"><path d="M176 88L338 78M176 104L338 94" stroke="#C9D1DE" stroke-width="7"/><path d="M176 88L338 78M176 104L338 94" fill="none"/>
${[196, 224, 252, 280, 308].map((x) => `<path d="M${x} ${88 - (x - 176) * 0.062}L${x} ${104 - (x - 176) * 0.062}" stroke-width="4"/>`).join('')}</g>
<path d="M186 104L186 112M320 94L320 112" stroke="${INK}" stroke-width="5"/>`;
    const front = `<path d="M34 160L344 160" stroke="${r.accent}" stroke-width="9"/><path d="M34 160L344 160" stroke="${INK}" stroke-width="2" opacity=".2"/>
<circle cx="250" cy="142" r="14" fill="#C9D1DE" stroke="${INK}" stroke-width="3.5"/><circle cx="250" cy="142" r="6" fill="${r.dark}"/>
<rect x="28" y="136" width="16" height="14" rx="4" fill="#FFF3B0" stroke="${INK}" stroke-width="3"/>
${windshield(58, 62)}${siren(160, 82, '#FF5A4E')}`;
    return car(p, k, { bodyD, extra: ladder, front });
  },
  police(p, k) {
    const bodyD = 'M26 190L26 150Q26 124 54 120L112 112L300 112Q336 112 342 146L344 190Z';
    const front = `<path d="M170 124L262 124L262 176L170 176Z" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
<g transform="translate(216 150) scale(.9)">${emblem('police')}</g>
<rect x="22" y="148" width="16" height="12" rx="4" fill="#FFF3B0" stroke="${INK}" stroke-width="3"/>
${windshield(62, 64)}<path d="M268 112L276 74L296 74L304 112" fill="none" stroke="${INK}" stroke-width="5"/>
<g>${siren(272, 56, '#FF4D5E')}</g>`;
    return car(p, k, { bodyD, front });
  },
  pilot(p, k) {
    const r = ROLES.pilot;
    const bodyD = 'M40 140C40 96 84 76 150 76C210 76 250 96 262 118L346 108L350 132L258 164C244 188 208 200 150 200C84 200 40 184 40 140Z';
    const rotor = `<path d="M172 76L172 50" stroke="${INK}" stroke-width="7"/><g class="veh-rotor"><ellipse cx="180" cy="40" rx="150" ry="7" fill="#8C93A8" stroke="${INK}" stroke-width="4"/></g>
<rect x="156" y="38" width="32" height="14" rx="6" fill="${r.dark}" stroke="${INK}" stroke-width="3.5"/>`;
    const skids = `<path d="M90 198L80 222M210 198L220 222" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M40 222L260 222Q274 222 276 212" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>`;
    const glass = `<path d="M52 136C52 106 76 88 118 86L130 144Z" fill="${GLASS}" opacity=".22" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M64 128C66 112 78 102 94 98" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
    const tail = `<circle cx="344" cy="118" r="17" fill="none" stroke="#8C93A8" stroke-width="5"/><circle cx="344" cy="118" r="5" fill="${INK}"/>`;
    return `<g class="veh-body">${skids}${rotor}
${shaded(bodyD, r.main, r.dark, { dx: -10, dy: -10, id: `${k}b` })}
<clipPath id="${k}w"><path d="M20 150C20 20 90 -50 200 -50L200 150Z"/></clipPath>
<g clip-path="url(#${k}w)">${head(p.id, 106, 92, 150)}</g>${glass}
<path d="M150 170L250 170" stroke="${r.accent}" stroke-width="8" stroke-linecap="round"/>
${badgeDisk('pilot', 196, 132, .8)}${tail}</g>`;
  },
  builder(p, k) {
    const r = ROLES.builder;
    const bodyD = 'M74 186L74 124Q74 110 88 110L310 110Q330 110 330 130L330 186Z';
    const tracks = `<rect x="64" y="176" width="286" height="50" rx="25" fill="#3A3450" stroke="${INK}" stroke-width="${SW}"/>
${[96, 150, 206, 262, 318].map((x) => `<g class="veh-wheel"><circle cx="${x}" cy="201" r="17" fill="#D5DCE7" stroke="${INK}" stroke-width="3.5"/><circle cx="${x}" cy="194" r="3" fill="${INK}"/></g>`).join('')}`;
    const blade = `<path d="M74 142L30 128L18 214L70 214Z" fill="#9AA3B8" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
<path d="M30 128Q10 170 18 214" fill="none" stroke="#6B7390" stroke-width="7"/><path d="M74 160L96 160" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>`;
    const cage = `<path d="M84 110L88 -30L224 -30L228 110" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="78" y="-42" width="156" height="16" rx="7" fill="${r.dark}" stroke="${INK}" stroke-width="4"/>`;
    const front = `<rect x="262" y="72" width="16" height="40" rx="5" fill="#6B7390" stroke="${INK}" stroke-width="3.5"/>
<path d="M200 150L330 150" stroke="${r.accent}" stroke-width="8"/>${badgeDisk('builder', 268, 146, .8)}`;
    return `${tracks}<g class="veh-body">${blade}${head(p.id, 156, 44, 150)}${cage}
${shaded(bodyD, r.main, r.dark, { dx: -10, dy: -10, id: `${k}b` })}${front}</g>`;
  },
  lifeguard(p, k) {
    const r = ROLES.lifeguard;
    const hullD = 'M16 128L346 128L322 184Q312 204 284 204L86 204Q52 204 38 178Z';
    const front = `<path d="M28 150L336 150" stroke="#fff" stroke-width="10"/><path d="M34 166L330 166" stroke="${r.dark}" stroke-width="5" opacity=".6"/>
<g transform="translate(262 140)">${emblem('lifeguard')}</g>
<path d="M300 128L300 60" stroke="${INK}" stroke-width="5"/><path d="M300 62L336 72L300 84Z" fill="${r.accent}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
${windshield(58, 76)}`;
    const waves = `<path d="M0 214Q22 202 44 214T88 214T132 214T176 214T220 214T264 214T308 214T352 214" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>`;
    return `${wheel(96, 206, 22)}${wheel(270, 206, 22)}<g class="veh-body">${head(p.id, 144, 56, 156)}
${shaded(hullD, r.main, r.dark, { dx: -10, dy: -10, id: `${k}b` })}${front}</g>${waves}`;
  },
  vet(p, k) {
    const r = ROLES.vet;
    const bodyD = 'M24 190L24 146Q24 120 52 116L150 110L150 60Q150 46 164 46L326 46Q344 46 344 64L344 190Z';
    const front = `<rect x="178" y="68" width="136" height="80" rx="16" fill="#fff" stroke="${INK}" stroke-width="4"/>
<g transform="translate(246 108) scale(1.25)">${emblem('vet')}</g>
<rect x="20" y="148" width="16" height="12" rx="4" fill="#FFF3B0" stroke="${INK}" stroke-width="3"/>
<path d="M24 170L344 170" stroke="${r.dark}" stroke-width="6"/>
${windshield(56, 64)}${siren(232, 22, '#FF4D8E')}`;
    return car(p, k, { bodyD, front });
  },
};

export function vehicleSVG(puppyId, opts = {}) {
  const p = PUPPY[puppyId];
  const k = uid('v');
  const inner = `<ellipse cx="184" cy="228" rx="160" ry="9" fill="${INK}" opacity=".15"/>${BUILDERS[p.role](p, k)}`;
  return svgWrap('0 -50 360 290', inner, `veh veh-${p.role} ${opts.className || ''}`, 'aria-hidden="true"');
}
