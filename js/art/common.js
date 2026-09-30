// Shared drawing helpers for all SVG art.
// Style rules: one ink color for outlines, flat fills, one cel-shade layer, one highlight.

export const INK = '#2B2340';
export const SW = 5; // standard outline width in a 400-unit viewBox

let counter = 0;
export const uid = (prefix = 'u') => `${prefix}${++counter}`;

// Horizontal mirror around x = cx.
export const mirrorX = (cx) => `translate(${2 * cx} 0) scale(-1 1)`;

// Union of circles with one clean outline: stroke layer below, fill layer above.
export function blob(circles, fill, sw = SW, stroke = INK) {
  const c = circles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  return `<g fill="${stroke}" stroke="${stroke}" stroke-width="${sw * 2}">${c}</g><g fill="${fill}">${c}</g>`;
}

// A filled path with a cel-shade crescent on the lower right and an outline.
// `inner` is drawn inside the clip, above the base fill (patterns, muzzle, and so on).
export function shaded(d, fill, shade, { dx = -12, dy = -12, inner = '', sw = SW, id = uid('c') } = {}) {
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>
<g clip-path="url(#${id})"><path d="${d}" fill="${shade}"/><path d="${d}" fill="${fill}" transform="translate(${dx} ${dy})"/>${inner}</g>
<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
}

export function shadedEllipse(cx, cy, rx, ry, fill, shade, opts = {}) {
  const d = `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
  return shaded(d, fill, shade, { dx: -rx * 0.22, dy: -ry * 0.25, ...opts });
}

export function starPath(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / n;
    const rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}

export function svgWrap(viewBox, inner, cls = '', extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="${cls}" ${extra}>${inner}</svg>`;
}
