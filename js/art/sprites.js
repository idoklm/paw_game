// Paths and layout data for the generated art (tools/images.py + tools/sprites.py).

export const sprite = (name) => `assets/sprites/${name}.webp`;
export const bg = (name) => `assets/bg/${name}.webp`;

export const pupImg = (id) => sprite(`pup-${id}`);
export const cheerImg = (id) => sprite(`cheer-${id}`);
export const vehImg = (id) => sprite(`veh-${id}`);

// Where the letter sits on each item, as fractions of the sprite box, and the letter size
// as a fraction of the item width.
export const ITEM_GLYPH = {
  bubble: { x: 0.5, y: 0.5, s: 0.5 },
  crate: { x: 0.5, y: 0.52, s: 0.46 },
  shell: { x: 0.5, y: 0.52, s: 0.42 },
  apple: { x: 0.5, y: 0.6, s: 0.42 },
  egg: { x: 0.5, y: 0.57, s: 0.46 },
  balloon: { x: 0.5, y: 0.4, s: 0.46 },
  fish: { x: 0.49, y: 0.53, s: 0.36 },
  star: { x: 0.5, y: 0.56, s: 0.34 },
  badge: { x: 0.5, y: 0.37, s: 0.42 },
};

export const ITEM_FOR_THEME = {
  bridge: 'bubble', harbor: 'crate', beach: 'shell', forest: 'apple',
  farm: 'egg', hill: 'balloon', reef: 'fish', island: 'star',
};

// The bay map (bg-map, 1536x1024) is shown 1280 wide, so 853 high; it is moved up by MAP_TOP
// to center it on the 800-high stage. Points are in that 1280x853 picture.
export const MAP_TOP = -27;
export const MAP_STOPS = [
  { x: 1095, y: 148 }, // 0: lighthouse (home)
  { x: 1070, y: 440 }, // 1: river bridge
  { x: 1135, y: 540 }, // 2: harbor
  { x: 658, y: 748 },  // 3: beach
  { x: 365, y: 735 },  // 4: forest
  { x: 268, y: 525 },  // 5: farm
  { x: 215, y: 318 },  // 6: windmill hill
  { x: 290, y: 155 },  // 7: coral reef
  { x: 612, y: 285 },  // 8: palm island
];
// The road through all stops, in order (stops included), for the driving vehicle.
export const MAP_ROAD = [
  [1095, 148], [1170, 215], [1192, 290], [1130, 345], [1098, 392], [1070, 440],
  [1112, 490], [1135, 540], [1050, 660], [900, 780], [780, 778], [658, 748],
  [520, 756], [365, 735], [240, 688], [205, 600], [268, 525], [228, 468], [148, 402],
  [152, 350], [215, 318], [246, 250], [258, 190], [290, 155], [252, 205], [248, 272],
  [300, 338], [352, 352], [470, 318], [560, 294], [612, 285],
];

// Catmull-Rom spline through the points, as an SVG path in stage coordinates.
export function roadPath(points = MAP_ROAD, top = MAP_TOP) {
  const p = points.map(([x, y]) => [x, y + top]);
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// All art files, for preloading before a scene shows.
export function preload(urls) {
  return Promise.all(urls.map((u) => new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = u;
  })));
}
