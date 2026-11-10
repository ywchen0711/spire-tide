// Monster sprites by other pixel artists, shared under CC-BY 3.0 or CC0; CREDITS.md names them all.
// Each monster was cut out of its sheet, recoloured where needed and packed into assets/monsters.png.
// The boxes are [x, y, w, h, scale]: the scale is how big the sprite is drawn, in game pixels per
// sprite pixel. Below 1 the sprite is drawn with the real screen pixels, so it is smaller and finer.
import { canvas } from './gfx.js';

const ATLAS = { jelly: [150, 88, 24, 19, 1], peckbird: [166, 0, 47, 67, 0.75], hornhare: [458, 0, 34, 47, 1], shroom: [411, 0, 46, 53, 0.75], redjelly: [175, 88, 24, 19, 1], bat: [85, 88, 64, 38, 0.75], rockcrab: [214, 0, 47, 65, 0.75], bones: [54, 0, 44, 69, 0.75], merrow: [310, 0, 45, 63, 0.75], wisp: [0, 88, 55, 47, 0.75], gargoyle: [356, 0, 54, 56, 0.75], serpent: [56, 88, 28, 45, 1], clawmaw: [262, 0, 47, 65, 1.5], seren: [99, 0, 66, 69, 1.25], ordath: [0, 0, 53, 87, 1.1] };

// the module waits for the picture, so every monster is ready before the first battle
const img = new Image();
img.src = 'assets/monsters.png';
let ok = false;
try { await img.decode(); ok = true; } catch (err) { console.warn('monster sheet missing, using the drawn monsters', err); }

const cache = new Map();
export const hasSheet = (k) => ok && !!ATLAS[k];
function cut(k, fs) {
  const [x, y, w, h] = ATLAS[k], c = canvas(w, h);
  c.x.drawImage(img, x, y, w, h, 0, 0, w, h);
  c.fs = fs;
  return c;
}
export function sheetArt(k) {
  if (!cache.has(k)) cache.set(k, cut(k, ATLAS[k][4]));
  return cache.get(k);
}
// the one that walks around the map: the same picture, drawn about 22 game pixels tall
export function sheetMini(k) {
  const key = 'mini:' + k;
  if (!cache.has(key)) { const [, , w, h] = ATLAS[k]; cache.set(key, cut(k, Math.min(1, 22 / Math.max(w, h)))); }
  return cache.get(key);
}
