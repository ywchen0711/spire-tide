// Every map: the harbour town and its houses, the island world map, the grotto and the tower.
// Rows of characters; the legend turns each character into a tile and, for some, an entity.
import { hash } from './gfx.js';

// characters shared by all maps
const BASE = {
  '.': 'grass', ',': 'flower', ';': 'tall', '=': 'dirt', ':': 'sand', 'T': 'tree', 'P': 'pine', 'n': 'bush', 'o': 'rock', 'u': 'stump',
  'w': 'water', 'W': 'deep', 'k': 'dock', '#': 'bridge', 'F': 'fence', 's': 'sign', 'O': 'well', 'L': 'lamp', 'X': 'wall', 'C': 'cliff',
  'R': 'roof_r', 'B': 'roof_b', 'G': 'roof_g', 'Q': 'roof_p', 'H': 'hwall', 'N': 'window', 'D': 'door', 'h': 'shop', 'S': 'swall', 'V': 'swin', 'E': 'sdoor',
  '_': 'floor', 'I': 'iwall', 'r': 'carpet', 'c': 'counter', 't': 'table', 'd': 'bed', 'l': 'shelf', 'p': 'pot', 'y': 'barrel', 'x': 'crate', 'f': 'hearth', 'A': 'altar', 'e': 'pew',
  '^': 'stairs', 'v': 'down',
};

// rows + legend -> a map; legend values are a tile kind or { k: kind, e: entity | (x, y, n) => entity }
function grid(rows, legend = {}, meta = {}) {
  const L = { ...BASE, ...legend }, h = rows.length, w = rows[0].length;
  rows.forEach((r, i) => { if (r.length !== w) throw new Error(`${meta.id} row ${i} is ${r.length} wide, not ${w}`); });
  const ents = [], kinds = [], count = {};
  for (let y = 0; y < h; y++) {
    kinds.push([]);
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x], v = L[ch];
      if (v === undefined) throw new Error(`${meta.id}: no legend for '${ch}'`);
      if (typeof v === 'string') { kinds[y].push(v); continue; }
      kinds[y].push(v.k);
      const n = (count[ch] = (count[ch] || 0) + 1) - 1;
      const e = typeof v.e === 'function' ? v.e(x, y, n) : v.e;
      if (e) for (const one of [].concat(e)) ents.push({ x, y, ...one });
    }
  }
  return { w, h, kindAt: (x, y) => kinds[y][x], ents, ...meta };
}
// a character canvas for maps that are easier to draw with code
function canvasMap(w, h, fill) {
  const g = Array.from({ length: h }, () => Array(w).fill(fill));
  const b = {
    g, w, h,
    set(x, y, c) { if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? g[y][x] : null; },
    rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) b.set(x + i, y + j, c); },
    stamp(x, y, rows) { rows.forEach((r, j) => [...r].forEach((c, i) => { if (c !== ' ') b.set(x + i, y + j, c); })); },
    rows() { return g.map((r) => r.join('')); },
  };
  return b;
}
const warp = (to, tx, ty, dir = 'd', extra = {}) => ({ type: 'warp', to, tx, ty, dir, ...extra });
const npc = (id, spriteName, talk, extra = {}) => ({ type: 'npc', id, sprite: spriteName, talk, ...extra });

export const MAPS = {};

// ---------- 潮鳴港 Tidebell (the harbour town) ----------
MAPS.town = {
  name: '潮鳴港', music: 'town', safe: true,
  build() {
    const b = canvasMap(40, 32, '.');
    // trees around, a gap north for the road out
    b.rect(0, 0, 40, 2, 'T'); b.rect(0, 0, 2, 24, 'T'); b.rect(38, 0, 2, 24, 'T');
    for (let y = 2; y < 23; y++) for (const x of [2, 37]) if (hash(x, y, 9) > 0.5) b.set(x, y, 'T');
    // harbour
    b.rect(0, 23, 40, 2, ':'); b.rect(0, 25, 40, 7, 'w'); b.rect(0, 29, 40, 3, 'W');
    b.rect(17, 25, 6, 4, 'k'); b.rect(18, 29, 4, 2, 'k');
    // roads
    b.rect(19, 0, 2, 25, '='); b.rect(3, 12, 34, 2, '='); b.rect(3, 20, 34, 1, '=');
    const house = (x, y, w, roof, doorAt) => {
      b.rect(x, y, w, 2, roof); b.rect(x, y + 2, w, 2, 'H');
      b.set(x + 1, y + 2, 'N'); b.set(x + w - 2, y + 2, 'N');
      b.set(x + doorAt, y + 3, 'D');
      return [x + doorAt, y + 3];
    };
    const path = (x, y0, y1) => { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) if (b.get(x, y) === '.' || b.get(x, y) === ',') b.set(x, y, '='); };
    const D = {};
    D.ren = house(4, 4, 5, 'R', 2); path(6, 8, 11);
    D.mayor = house(28, 3, 7, 'B', 3); path(31, 7, 11);
    D.inn = house(4, 15, 6, 'G', 2); path(6, 19, 19);
    D.shop = house(28, 15, 6, 'R', 3); b.set(29, 17, 'h'); b.set(32, 17, 'h'); path(31, 19, 19);
    D.hut1 = house(12, 15, 4, 'Q', 1); path(13, 19, 19);
    D.hut2 = house(23, 15, 4, 'R', 2); path(25, 19, 19);
    // chapel: stone walls under a blue roof
    b.rect(12, 3, 6, 3, 'B'); b.rect(12, 6, 6, 2, 'S'); b.set(13, 6, 'V'); b.set(16, 6, 'V'); b.set(14, 7, 'E'); path(14, 8, 11);
    // decoration
    b.set(24, 9, 'O'); b.set(18, 11, 'L'); b.set(21, 11, 'L'); b.set(18, 14, 'L'); b.set(21, 14, 'L');
    b.rect(9, 5, 1, 4, 'F'); b.rect(9, 9, 3, 1, 'F');
    b.stamp(10, 6, [',,', ',,', ',,']);
    b.stamp(3, 9, [',.,', '.,.']); b.stamp(33, 8, [',,.', '.,,']);
    b.stamp(22, 5, ['T T', ' T ']); b.stamp(25, 4, ['n']); b.stamp(35, 17, ['T', 'T']); b.stamp(10, 16, ['n']);
    b.stamp(16, 22, ['x', ' ']); b.stamp(23, 22, ['xx']); b.set(22, 24, 'y'); b.set(17, 24, 's');
    b.set(26, 21, 'n'); b.set(3, 21, 'T'); b.set(36, 21, 'n');
    const L = {
      x: { k: 'crate' }, y: { k: 'barrel' },
      s: { k: 'sign', e: { type: 'solid', talk: 'signHarbor' } },
    };
    const m = grid(b.rows(), L, { id: 'town' });
    const doorWarp = (key, to, tx, ty) => m.ents.push({ ...warp(to, tx, ty, 'u'), x: D[key][0], y: D[key][1] });
    doorWarp('ren', 'renhouse', 4, 6); doorWarp('mayor', 'mayor', 5, 7); doorWarp('inn', 'inn', 5, 7); doorWarp('shop', 'shop', 5, 7);
    m.ents.push({ ...warp('chapel', 5, 9, 'u'), x: 14, y: 7 });
    m.ents.push({ type: 'solid', talk: 'lockedHut', x: D.hut1[0], y: D.hut1[1] }, { type: 'solid', talk: 'lockedHut2', x: D.hut2[0], y: D.hut2[1] });
    for (const x of [19, 20]) m.ents.push({ ...warp('world', 14, 29, 'u', { exit: true }), x, y: 0 }, { type: 'trigger', run: 'guardBlock', x, y: 2 });
    m.ents.push(
      npc('guard', 'guard', 'guard', { x: 21, y: 2, dir: 'd' }),
      npc('mira', 'mira', 'miraTown', { x: 23, y: 10, dir: 'l', cond: (f) => !f.mira }),
      npc('girl', 'girl', 'girl', { x: 26, y: 10, dir: 'l' }),
      npc('boy', 'boy', 'boy', { x: 8, y: 13, wander: true }),
      npc('fisher', 'fisher', 'fisher', { x: 21, y: 28, dir: 'd' }),
      npc('sailor', 'sailor', 'sailor', { x: 18, y: 26, dir: 'r', wander: true }),
      npc('lady', 'mom', 'lady', { x: 33, y: 13, dir: 'l', wander: true }),
      npc('oldman', 'elder', 'oldman', { x: 11, y: 21, dir: 'd' }),
    );
    return m;
  },
};

// ---------- houses ----------
MAPS.renhouse = {
  name: '蓮的家', music: 'town', safe: true,
  build: () => grid([
    'IIIIIIIIII',
    'IIIfIIllII',
    'Id______pI',
    'Id__tt__yI',
    'I________I',
    'I_rrrr___I',
    'I________I',
    'IIII__IIII',
  ], { a: '_' }, { id: 'renhouse', ents: [] }),
};
MAPS.renhouse.build = ((orig) => () => { const m = orig(); m.ents.push(npc('mom', 'mom', 'mom', { x: 6, y: 4, dir: 'l' }), { ...warp('town', 6, 8, 'd'), x: 4, y: 7 }, { ...warp('town', 6, 8, 'd'), x: 5, y: 7 }); return m; })(MAPS.renhouse.build);

MAPS.mayor = {
  name: '村長家', music: 'town', safe: true,
  build() {
    const m = grid([
      'IIIIIIIIIII',
      'IIllIIIfIII',
      'I_________I',
      'I__ttt____I',
      'I_________I',
      'I_rrrrr__dI',
      'I________dI',
      'I_________I',
      'IIIII_IIIII',
    ], {}, { id: 'mayor' });
    m.ents.push(npc('mayor', 'elder', 'mayor', { x: 4, y: 2, dir: 'd' }), npc('mwife', 'mom', 'mayorWife', { x: 8, y: 3, dir: 'l', wander: true }), { ...warp('town', 31, 7, 'd'), x: 5, y: 8 });
    return m;
  },
};
MAPS.inn = {
  name: '海鷗亭', music: 'town', safe: true,
  build() {
    const m = grid([
      'IIIIIIIIIII',
      'IIllIIIyIII',
      'I______d_dI',
      'Iccc___d_dI',
      'I_________I',
      'I_tt___d_dI',
      'I______d_dI',
      'I_rrr_____I',
      'IIIII_IIIII',
    ], {}, { id: 'inn' });
    m.ents.push(npc('innkeeper', 'merchant', 'inn', { x: 2, y: 2, dir: 'd' }), npc('traveler', 'sailor', 'traveler', { x: 4, y: 5, dir: 'l' }), { ...warp('town', 6, 19, 'd'), x: 5, y: 8 });
    return m;
  },
};
MAPS.shop = {
  name: '港口商店', music: 'town', safe: true,
  build() {
    const m = grid([
      'IIIIIIIIIII',
      'Ill_IIIlllI',
      'I_________I',
      'Icccc_ccccI',
      'I_________I',
      'Iy_______pI',
      'Iy__rrr__pI',
      'I_________I',
      'IIIII_IIIII',
    ], {}, { id: 'shop' });
    m.ents.push(npc('itemshop', 'merchant', 'itemShop', { x: 2, y: 2, dir: 'd' }), npc('armshop', 'fisher', 'armShop', { x: 7, y: 2, dir: 'd' }), { ...warp('town', 31, 19, 'd'), x: 5, y: 8 });
    return m;
  },
};
MAPS.chapel = {
  name: '海神禮拜堂', music: 'town', safe: true,
  build() {
    const m = grid([
      'IIIIIIIIIII',
      'IIIIIAIIIII',
      'I____r____I',
      'I____r____I',
      'Iee__r__eeI',
      'I____r____I',
      'Iee__r__eeI',
      'I____r____I',
      'I____r____I',
      'I____r____I',
      'IIIII_IIIII',
    ], { A: { k: 'altar' } }, { id: 'chapel' });
    m.ents.push(npc('nun', 'nun', 'nun', { x: 5, y: 2, dir: 'd' }), npc('lys', 'lys', 'lysChapel', { x: 7, y: 3, dir: 'l', cond: (f) => f.key && !f.lys }), { ...warp('town', 14, 8, 'd'), x: 5, y: 10 });
    return m;
  },
};

// ---------- the world map ----------
MAPS.world = {
  name: '', music: 'field', world: true, safe: true,
  build(flags) {
    const W = 48, H = 40, b = canvasMap(W, H, 'w');
    const noise = (x, y) => {
      const v = (s, k) => { const X = Math.floor(x / s), Y = Math.floor(y / s), fx = x / s - X, fy = y / s - Y; const l = (a, c, t) => a + (c - a) * (t * t * (3 - 2 * t)); return l(l(hash(X, Y, k), hash(X + 1, Y, k), fx), l(hash(X, Y + 1, k), hash(X + 1, Y + 1, k), fx), fy); };
      return v(6, 1) * 0.65 + v(3, 2) * 0.35;
    };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = (x - 22) / 18.5, dy = (y - 20) / 16.5, d = Math.hypot(dx, dy) + (noise(x, y) - 0.5) * 0.45;
      if (d < 1) b.set(x, y, d > 0.9 ? ':' : '.');
    }
    // the islet of the tower
    for (let y = 19; y <= 25; y++) for (let x = 42; x <= 46; x++) if (Math.hypot(x - 44, (y - 22) * 0.9) < 2.6) b.set(x, y, Math.hypot(x - 44, y - 22) > 1.8 ? ':' : '.');
    // mountains across the north, forests here and there
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (b.get(x, y) !== '.') continue;
      const n = noise(x + 40, y + 17);
      if (y < 11 && n > 0.42 + (y - 4) * 0.03) b.set(x, y, 'M');
      else if (n > 0.6) b.set(x, y, 'T');
      else if (n < 0.22) b.set(x, y, 'h');
    }
    // river from the hills to the south sea
    for (let y = 9; y < H; y++) { const x = 25 + Math.round(Math.sin(y * 0.35) * 1.2); if (b.get(x, y) && b.get(x, y) !== 'w') b.set(x, y, 'r'); }
    // roads
    const road = (x0, y0, x1, y1) => { let x = x0, y = y0; for (;;) { const c = b.get(x, y); b.set(x, y, c === 'r' ? '#' : '='); if (x === x1 && y === y1) break; if (x !== x1) x += Math.sign(x1 - x); else y += Math.sign(y1 - y); } };
    road(14, 29, 14, 20); road(14, 20, 30, 20); road(30, 20, 30, 8); road(30, 20, 38, 20); road(38, 20, 38, 22);
    // keep the ground near places open
    for (const [x, y] of [[14, 30], [30, 7], [38, 22], [13, 30], [15, 30]]) if (b.get(x, y) !== 'w') b.set(x, y, '.');
    b.rect(29, 6, 3, 1, 'M'); b.set(30, 7, '.');
    b.rect(37, 21, 3, 3, ':'); b.set(38, 22, '=');
    // the sandbar to the tower rises once the tide is sealed
    for (let x = 39; x <= 42; x++) b.set(x, 22, flags && flags.tide ? ':' : 'w');
    const m = grid(b.rows(), { '.': 'ograss', T: 'oforest', M: 'omount', w: 'osea', ':': 'osand', '=': 'oroad', h: 'ohill', r: 'water', '#': 'bridge' }, { id: 'world' });
    m.ents.push(
      { type: 'icon', icon: 'town', x: 14, y: 30 }, { ...warp('town', 19, 1, 'd'), x: 14, y: 30 },
      { type: 'icon', icon: 'cave', x: 30, y: 7 }, { ...warp('cave1', 16, 22, 'u'), x: 30, y: 7 },
      { type: 'icon', icon: 'tower', x: 44, y: 22 }, { ...warp('tower1', 10, 16, 'u'), x: 44, y: 22 },
      { type: 'icon', icon: 'shrine', x: 38, y: 21 }, { type: 'solid', talk: 'capeShrine', x: 38, y: 21 },
      { type: 'trigger', run: 'cape', x: 38, y: 22 },
    );
    m.enc = (x, y) => (x > 33 ? 'shore' : y < 22 ? 'north' : 'plains');
    return m;
  },
};

// ---------- 北岬洞窟 the Northern Cape Grotto ----------
const caveLegend = (chests, troops, extra = {}) => ({
  K: 'cwall', '.': 'cfloor', '~': 'cwater', m: 'stal', '*': 'crystal',
  b: { k: 'cfloor', e: { type: 'block' } },
  o: { k: 'cfloor', e: { type: 'plate', group: 1 } },
  g: { k: 'cfloor', e: { type: 'gate', group: 1 } },
  h: { k: 'cfloor', e: (x, y) => ({ type: 'hole', key: x + ',' + y }) },
  $: { k: 'cfloor', e: (x, y, n) => ({ type: 'chest', ...chests[n] }) },
  e: { k: 'cfloor', e: (x, y, n) => ({ type: 'enemy', n, troop: troops[n][0], art: troops[n][1], hx: x, hy: y, range: 4, sight: 4 }) },
  '@': { k: 'cfloor', e: { type: 'save' } },
  r: { k: 'cfloor', e: { type: 'sign', talk: 'resetStone', sprite: 'stone' } },
  ...extra,
});
MAPS.cave1 = {
  name: '北岬洞窟', music: 'cave',
  build: () => {
    const m = grid([
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KKK.$.KKKKKKKKKK.v.KKKKKKK.$..KK',
      'KKK...KKKKKKKKKK...KKKKKKK....KK',
      'KKK.G.KKKKKKKKKK...KKKKKKK....KK',
      'KKKK.KKKKKKKKKKKKjKKKKKKKKhhhhKK',
      'KKKK.KKKKKKKKKKKK.KKKKKKKK....KK',
      'KKKKgKKKKKKKKKKKK.KKKKKKKKhhhhKK',
      'KK.....KKKKKKKKK...KKKKKKK....KK',
      'KK.b...KKKKKKKKK.e.KKKKKK.b..b.K',
      'KK..o..KKKKKKKKK...KKKKKK..b...K',
      'KK.....KKKKKKKKKK.KKKKKKK......K',
      'KK..b..KKKKKKKKKK.KKKKKKK......K',
      'KK.o...KKKKKKKKKK.KKKKKKK...b..K',
      'KKr....KKKKKKKKKK.KKKKKKK.....rK',
      'KKK...KKKKKKKKKKK.KKKKKKKK....KK',
      'KKKK.KKKKKKKKKKKK.KKKKKKKKK..KKK',
      'KKKK.....m..e.......~~.......KKK',
      'KKKK..........@.....~~...e...KKK',
      'KKKKKKKK..*.................KKKK',
      'KKKKKKKKKKKKKKK...KKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKK...KKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKK.KKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKXKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    ], caveLegend([{ id: 'c1a', item: 'ironsword' }, { id: 'c1b', item: 'powerring' }], [['cbat', 'bat'], ['cshroom', 'shroom'], ['ccrab', 'crab']], {
      G: { k: 'cfloor', e: npc('garo', 'garo', 'garoCell', { dir: 'd', cond: (f) => !f.garo }) },
      j: { k: 'cfloor', e: { type: 'gate', group: 9, flag: 'garo' } },
      v: { k: 'down', e: warp('cave2', 3, 15, 'r') },
      X: { k: 'cfloor', e: warp('world', 30, 8, 'd', { exit: true }) },
    }), { id: 'cave1', dark: 0.55 });
    return m;
  },
};
MAPS.cave2 = {
  name: '北岬洞窟 地下', music: 'cave',
  build: () => grid([
    'KKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKK.........$.KKKKKKKK',
    'KKKKK...........KKKKKKKK',
    'KKKKK.....B.....KKKKKKKK',
    'KKKKK...........KKKKKKKK',
    'KKKKK~~...T...~~KKKKKKKK',
    'KKKKKKKKKKgKKKKKKKKKKKKK',
    'KKKKKKKo.....oKKKKKKKKKK',
    'KKKKKKK.......KKKKKKKKKK',
    'KKKKKKK.b.o...KKKKKKKKKK',
    'KKKKKKK.....b.KKKKKKKKKK',
    'KKKKKKK...b...KKKKKKKKKK',
    'KKKKKKKr......KKKKKKKKKK',
    'KKKKKKKKKK.KKKKKKKKKKKKK',
    'KK^.......e......KKKKKKK',
    'KK.....m...@...e.KKKKKKK',
    'KKKK~~~~.....*...KKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKK',
  ], caveLegend([{ id: 'c2a', item: 'wardcharm' }], [['ccrab2', 'crab'], ['cbones', 'bones']], {
    '^': { k: 'stairs', e: warp('cave1', 17, 3, 'd') },
    B: { k: 'cfloor', e: { type: 'boss', id: 'clawmaw', art: 'clawmaw', scale: 0.4, talk: 'clawmaw', cond: (f) => !f.boss1 } },
    T: { k: 'cfloor', e: { type: 'trigger', run: 'clawmaw', once: 'boss1seen' } },
  }), { id: 'cave2', dark: 0.6 }),
};

// ---------- 蒼潮魔塔 the Spire of the Blue Tide ----------
const towerLegend = (chests, troops, extra = {}) => ({
  Z: 'twall', '+': 'tfloor', '-': 'tcarpet', '|': 'tpillar', '%': 'twater', '0': 'void', i: 'ice',
  R: { k: 'tfloor', e: { type: 'post', color: 'r' } },
  U: { k: 'tfloor', e: { type: 'post', color: 'b' } },
  t: { k: 'tfloor', e: { type: 'toggle' } },
  b: { k: 'tfloor', e: { type: 'block' } },
  o: { k: 'tfloor', e: { type: 'plate', group: 1 } },
  g: { k: 'tcarpet', e: { type: 'gate', group: 1 } },
  h: { k: 'tfloor', e: (x, y) => ({ type: 'hole', key: x + ',' + y }) },
  $: { k: 'tfloor', e: (x, y, n) => ({ type: 'chest', ...chests[n] }) },
  e: { k: 'tfloor', e: (x, y, n) => ({ type: 'enemy', n, troop: troops[n][0], art: troops[n][1], hx: x, hy: y, range: 4, sight: 5 }) },
  '@': { k: 'tfloor', e: { type: 'save' } },
  r: { k: 'tfloor', e: { type: 'sign', talk: 'resetStone', sprite: 'stone' } },
  ...extra,
});
MAPS.tower1 = {
  name: '蒼潮魔塔 一層', music: 'tower',
  build: () => grid([
    'ZZZZZZZZZZZZZZZZZZZZZZZZ',
    'ZZZ^ZZZ$ZZZZZZZZZZZZZZZZ',
    'ZZZRZZZUZZZZZZZZZZZZZZZZ',
    'ZZ+++++++ZZZZ+++++++ZZZZ',
    'ZZ+|+++|+ZZZZ+|+++t+ZZZZ',
    'ZZ+++++++++R++++++++ZZZZ',
    'ZZ+|t++|+ZZZZ+|+++|+ZZZZ',
    'ZZ+++++++ZZZZ+++++++ZZZZ',
    'ZZZZZZZZZZZZZZZZUZZZZZZZ',
    'ZZZZZZZZZZZZZZZZ+ZZZZZZZ',
    'ZZZZZZZZZZZZZZZZ+ZZZZZZZ',
    'ZZZ++++++++++++++++ZZZZZ',
    'ZZZ+e++|++--++|++++ZZZZZ',
    'ZZZ+++++++--++++e++ZZZZZ',
    'ZZZ++|++++--++++|++ZZZZZ',
    'ZZZ+++++@+--++++++eZZZZZ',
    'ZZZ+++++++--+++++++ZZZZZ',
    'ZZZZZZZZZZXZZZZZZZZZZZZZ',
  ], towerLegend([{ id: 't1a', item: 'galeboots' }], [['tmerrow', 'merrow'], ['twisp', 'wisp'], ['tmerrow2', 'merrow']], {
    '^': { k: 'stairs', e: warp('tower2', 10, 15, 'u') },
    X: { k: 'tcarpet', e: warp('world', 43, 22, 'l', { exit: true }) },
  }), { id: 'tower1', tint: 'rgba(0,10,40,0.12)' }),
};
MAPS.tower2 = {
  name: '蒼潮魔塔 二層', music: 'tower',
  build: () => grid([
    'ZZZZZZZZZZZZZZZZZZZZZZZZ',
    'ZZZZZZZZZZZ^ZZZZZZZZZZZZ',
    'ZZZZZZZZZZZ+ZZZZZZZZZZZZ',
    'ZZZiii|iiiiiiiii|iiiiZZZ',
    'ZZZiiiiiii|iiiiiiiiiiZZZ',
    'ZZZiiiiiiiiiiiiiii|iiZZZ',
    'ZZZiiiiii|iiiiiiiiii|ZZZ',
    'ZZZiiii|iii|iiiiiiiiiZZZ',
    'ZZZ|iiiiiiii|iiiii|iiZZZ',
    'ZZZ|i|ii|iiiiiiiiiiiiZZZ',
    'ZZZ|iiiiiiiii|i|iiiiiZZZ',
    'ZZZiiii|iiiiiii|i|iiiZZZ',
    'ZZZiiiiiiii+|iiiiiii|ZZZ',
    'ZZZZZZZZZZZ+ZZZZZZZZZZZZ',
    'ZZZZZZZ$+e++++e+$ZZZZZZZ',
    'ZZZZZZZ++++@+++++ZZZZZZZ',
    'ZZZZZZZZZZZvZZZZZZZZZZZZ',
    'ZZZZZZZZZZZZZZZZZZZZZZZZ',
  ], towerLegend([{ id: 't2a', item: 'tideblade' }, { id: 't2b', item: 'titanaxe' }], [['tgarg', 'gargoyle'], ['tserp', 'serpent']], {
    '^': { k: 'stairs', e: warp('tower3', 11, 17, 'u') },
    v: { k: 'down', e: warp('tower1', 3, 3, 'd') },
  }), { id: 'tower2', tint: 'rgba(0,20,60,0.12)' }),
};
MAPS.tower3 = {
  name: '蒼潮魔塔 三層', music: 'tower',
  build: () => grid([
    'ZZZZZZZZZZZZZZZZZZZZZZZZ',
    'ZZZZZZZZZZZ^ZZZZZZZZZZZZ',
    'ZZZZZZZ|+++G+++|ZZZZZZZZ',
    'ZZZZZZZ++++-++++ZZZZZZZZ',
    'ZZZZZZZ|+++S+++|ZZZZZZZZ',
    'ZZZZZZZ++++-++++ZZZZZZZZ',
    'ZZZZZZZ|+++-+++|ZZZZZZZZ',
    'ZZZZZZZZZZZTZZZZZZZZZZZZ',
    'ZZZZZZZZZZZgZZZZZZZZZZZZ',
    'ZZZZo+++++++++++++oZZZZZ',
    'ZZZZ+++++++++++++++ZZZZZ',
    'ZZZZhhhhhhh+hhhhhhhZZZZZ',
    'ZZZZ+++++++++++++++ZZZZZ',
    'ZZZZ++++++b+b++++++ZZZZZ',
    'ZZZZ$++++++++++++++ZZZZZ',
    'ZZZZ+r++++++++++++@ZZZZZ',
    'ZZZZZZZZZZZ+ZZZZZZZZZZZZ',
    'ZZZZZZZZZZZ+ZZZZZZZZZZZZ',
    'ZZZZZZZZZZZvZZZZZZZZZZZZ',
    'ZZZZZZZZZZZZZZZZZZZZZZZZ',
  ], towerLegend([{ id: 't3a', item: 'starrod' }], [], {
    '^': { k: 'stairs', e: warp('tower4', 9, 9, 'u') },
    v: { k: 'down', e: warp('tower2', 11, 2, 'd') },
    G: { k: 'tcarpet', e: { type: 'gate', group: 8, flag: 'seren' } },
    S: { k: 'tcarpet', e: { type: 'boss', id: 'seren', art: 'seren', scale: 0.32, talk: 'seren', cond: (f) => !f.seren } },
    T: { k: 'tcarpet', e: { type: 'trigger', run: 'seren', once: 'serenSeen' } },
  }), { id: 'tower3', tint: 'rgba(20,0,60,0.14)' }),
};
MAPS.tower4 = {
  name: '蒼潮魔塔 塔頂', music: 'tower',
  build: () => grid([
    '00000000000000000000',
    '0000|++++++++++|0000',
    '000++++++++++++++000',
    '000++++++O+++++++000',
    '000++++++++++++++000',
    '000|++++++++++++|000',
    '000++++++T+++++++000',
    '000++++++-+++++++000',
    '000|+++++-++++++|000',
    '0000+++++-++++++0000',
    '000000000v0000000000',
    '00000000000000000000',
  ], towerLegend([], [], {
    O: { k: 'tfloor', e: { type: 'boss', id: 'ordath', art: 'ordath', scale: 0.42, talk: 'ordath', cond: (f) => !f.ordath } },
    T: { k: 'tfloor', e: { type: 'trigger', run: 'ordath', once: 'ordathSeen' } },
    v: { k: 'down', e: warp('tower3', 11, 2, 'd') },
  }), { id: 'tower4', tint: 'rgba(40,0,40,0.18)' }),
};
