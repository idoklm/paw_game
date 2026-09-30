// Captain Ori: the kid who runs the rescue team from the lighthouse. Bust, viewBox 300 x 360.
// Animated parts: cap-head, cap-eyes, cap-arm, mouth-open / mouth-closed, eye-open / eye-closed.

import { INK, uid, blob, shaded, svgWrap } from './common.js';

const SKIN = '#E7A97C', SKIN_SHADE = '#C98759', HAIR = '#3A2318';
const COAT = '#FFC83A', COAT_SHADE = '#E4A21C', NAVY = '#22346B';

const FACE = 'M150 66C206 66 238 108 238 158C238 208 200 240 150 240C100 240 62 208 62 158C62 108 94 66 150 66Z';
const COAT_D = 'M30 364C32 298 80 256 150 256C220 256 268 298 270 364Z';

function eye(cx, cy) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="18" ry="21" fill="#fff" stroke="${INK}" stroke-width="3"/>
<circle cx="${cx}" cy="${cy + 3}" r="13.5" fill="#6B3E1F"/><circle cx="${cx}" cy="${cy + 3}" r="8" fill="#1A1020"/>
<circle cx="${cx + 5}" cy="${cy - 3}" r="5" fill="#fff"/><circle cx="${cx - 5}" cy="${cy + 9}" r="2.4" fill="#fff"/>
<path d="M${cx - 19} ${cy - 5}Q${cx} ${cy - 27} ${cx + 19} ${cy - 5}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
}

export function captainSVG(opts = {}) {
  const k = uid('cap');
  const Y = 168;
  const ears = `<ellipse cx="64" cy="170" rx="17" ry="21" fill="${SKIN}" stroke="${INK}" stroke-width="4.5"/><ellipse cx="66" cy="172" rx="8" ry="11" fill="${SKIN_SHADE}"/>
<ellipse cx="236" cy="170" rx="17" ry="21" fill="${SKIN}" stroke="${INK}" stroke-width="4.5"/><ellipse cx="234" cy="172" rx="8" ry="11" fill="${SKIN_SHADE}"/>`;
  const backHair = blob([[88, 128, 28], [74, 158, 20], [212, 128, 28], [226, 158, 20], [112, 98, 30], [150, 88, 32], [188, 98, 30]], HAIR, 4.5);
  const face = shaded(FACE, SKIN, SKIN_SHADE, { dx: -12, dy: -10, id: `${k}f`, sw: 4.5,
    inner: `<ellipse cx="112" cy="96" rx="26" ry="10" fill="#fff" opacity=".18" transform="rotate(-18 112 96)"/>` });
  const fringe = blob([[108, 118, 17], [130, 110, 18], [154, 112, 17], [178, 110, 17], [198, 120, 15]], HAIR, 4);
  const blush = `<ellipse cx="100" cy="204" rx="16" ry="9" fill="#FF8C8C" opacity=".45"/><ellipse cx="200" cy="204" rx="16" ry="9" fill="#FF8C8C" opacity=".45"/>
<g fill="#B7703F" opacity=".7"><circle cx="92" cy="192" r="2.4"/><circle cx="101" cy="197" r="2.4"/><circle cx="88" cy="201" r="2.4"/><circle cx="208" cy="192" r="2.4"/><circle cx="199" cy="197" r="2.4"/><circle cx="212" cy="201" r="2.4"/></g>`;
  const eyes = `<g class="cap-eyes"><g class="eye-open">${eye(116, Y)}${eye(184, Y)}</g>
<g class="eye-closed"><path d="M98 ${Y + 4}Q116 ${Y - 14} 134 ${Y + 4}M166 ${Y + 4}Q184 ${Y - 14} 202 ${Y + 4}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g></g>`;
  const brows = `<path d="M100 136Q116 127 132 134M168 134Q184 127 200 136" fill="none" stroke="${HAIR}" stroke-width="6" stroke-linecap="round"/>`;
  const nose = `<path d="M144 192Q151 200 158 193" fill="none" stroke="${SKIN_SHADE}" stroke-width="4.5" stroke-linecap="round"/>`;
  const mouthD = 'M124 210Q150 214 176 210Q174 236 150 238Q126 236 124 210Z';
  const mouth = `<g class="mouth-open"><clipPath id="${k}m"><path d="${mouthD}"/></clipPath><path d="${mouthD}" fill="#7A2437"/>
<g clip-path="url(#${k}m)"><path d="M122 208L178 208L176 219Q150 222 124 219Z" fill="#fff"/><ellipse cx="150" cy="236" rx="15" ry="8" fill="#FF8A9A"/></g>
<path d="${mouthD}" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>
<g class="mouth-closed"><path d="M126 212Q150 230 174 212" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/></g>`;
  const hat = `${shaded('M64 96C60 60 104 40 150 40C196 40 240 60 236 96C206 108 94 108 64 96Z', '#FFFFFF', '#D9E1EE', { dx: -10, dy: -8, id: `${k}h`, sw: 4.5 })}
<path d="M80 96Q150 112 220 96L220 116Q150 132 80 116Z" fill="${NAVY}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M86 116Q150 136 214 116Q204 142 150 146Q96 142 86 116Z" fill="#1B1F3B" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M110 128Q150 138 190 128" fill="none" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>
<g transform="translate(150 76)"><path d="M-7 18L-4 -4L4 -4L7 18Z" fill="#F5C142" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M-4 5L4 3M-5 12L5 10" stroke="#E0463F" stroke-width="3"/><path d="M-6 -4L6 -4L4 -12L-4 -12Z" fill="#FFE9A0" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M-12 -10L-18 -12M12 -10L18 -12" stroke="#F5C142" stroke-width="3" stroke-linecap="round"/></g>`;
  const neck = `<rect x="128" y="226" width="44" height="44" rx="10" fill="${SKIN_SHADE}" stroke="${INK}" stroke-width="4"/>`;
  const shirtClip = `${k}s`;
  const coat = `${shaded(COAT_D, COAT, COAT_SHADE, { dx: -14, dy: -4, id: `${k}c`, sw: 4.5 })}
<clipPath id="${shirtClip}"><path d="M118 256L150 306L182 256Z"/></clipPath>
<path d="M118 256L150 306L182 256Z" fill="#fff"/>
<g clip-path="url(#${shirtClip})" stroke="${NAVY}" stroke-width="6"><path d="M110 266H190M110 280H190M110 294H190"/></g>
<path d="M118 256L150 306L182 256" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M150 306L150 364" stroke="${INK}" stroke-width="3.5"/>
<path d="M116 252L150 306L126 314L96 266Z" fill="${COAT_SHADE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<path d="M184 252L150 306L174 314L204 266Z" fill="${COAT}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
<rect x="138" y="322" width="24" height="9" rx="4.5" fill="${NAVY}" stroke="${INK}" stroke-width="2.5"/>
<rect x="138" y="344" width="24" height="9" rx="4.5" fill="${NAVY}" stroke="${INK}" stroke-width="2.5"/>
<g transform="translate(206 318)"><circle r="19" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
<path d="M-6 12L-3 -8L3 -8L6 12Z" fill="#E0463F" stroke="${INK}" stroke-width="2"/><path d="M-4 -1L4 -2M-5 6L5 5" stroke="#fff" stroke-width="3"/>
<path d="M-5 -8L5 -8L3 -14L-3 -14Z" fill="#FFD84A" stroke="${INK}" stroke-width="2"/></g>`;
  const arm = `<g class="cap-arm"><path d="M232 306C254 274 264 244 266 218" fill="none" stroke="${INK}" stroke-width="46" stroke-linecap="round"/>
<path d="M232 306C254 274 264 244 266 218" fill="none" stroke="${COAT}" stroke-width="36" stroke-linecap="round"/>
<path d="M248 228Q266 236 284 226" fill="none" stroke="${COAT_SHADE}" stroke-width="7" stroke-linecap="round"/>
${blob([[266, 196, 21], [252, 178, 8], [263, 172, 8.5], [275, 173, 8], [285, 181, 7.5], [246, 200, 8]], SKIN, 4)}
<path d="M258 196Q266 202 274 196" fill="none" stroke="${SKIN_SHADE}" stroke-width="3.5" stroke-linecap="round"/></g>`;
  const inner = `${coat}${neck}${opts.noArm ? '' : arm}<g class="cap-head">${backHair}${ears}${face}${fringe}${blush}${eyes}${brows}${nose}${mouth}${hat}</g>`;
  return svgWrap('0 0 300 364', inner, `cap ${opts.className || ''}`, 'aria-hidden="true"');
}
