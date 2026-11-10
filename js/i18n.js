// Language switching. Text is written in place as L('中文', 'English'); data tables get
// getters so .name and .desc follow the current language.

function initial() {
  try { const v = localStorage.getItem('spire-tide-lang'); if (v === 'zh' || v === 'en') return v; } catch (e) { /* no storage */ }
  try { return /^zh/i.test(navigator.language) ? 'zh' : 'en'; } catch (e) { return 'zh'; }
}
export let LANG = initial();
const hooks = [];
export function onLang(f) { hooks.push(f); }
export function setLang(l) {
  LANG = l;
  try { localStorage.setItem('spire-tide-lang', l); } catch (e) { /* private mode */ }
  try { document.documentElement.lang = l === 'en' ? 'en' : 'zh-Hant'; } catch (e) { /* node */ }
  for (const f of hooks) f(l);
}
export const isEn = () => LANG === 'en';
export const L = (zh, en) => (LANG === 'en' ? en : zh);

// table: { id: { name, desc, ... } }; en: { id: [name, desc] } or { id: { name, desc } }
export function localize(table, en, fields = ['name', 'desc']) {
  for (const [id, tr] of Object.entries(en)) {
    const o = table[id];
    if (!o) continue;
    const vals = Array.isArray(tr) ? Object.fromEntries(fields.map((f, i) => [f, tr[i]])) : tr;
    for (const [f, v] of Object.entries(vals)) {
      if (v === undefined) continue;
      const zh = o[f];
      Object.defineProperty(o, f, { get: () => (LANG === 'en' ? v : zh), enumerable: true, configurable: true });
    }
  }
}

// speaker names in dialogue
const NAMES = {
  蓮: 'Ren', 米菈: 'Mira', 葛羅: 'Garo', 莉絲: 'Lys', 母親: 'Mother', 守衛: 'Guard', 小女孩: 'Girl', 男孩: 'Boy',
  老漁夫: 'Old Fisher', 水手: 'Sailor', 鎮上的婦人: 'Townswoman', 老爺爺: 'Old Man', 村長夫人: "Mayor's Wife",
  旅人: 'Traveller', 老闆: 'Innkeeper', 修女: 'Sister', 巫女: 'Priestess', 村長: 'Mayor', 鐵匠: 'Smith',
  '？？？': '???', 塞壬: 'Seren', 歐爾德: 'Ordath', 店員: 'Clerk',
};
export const speaker = (n) => (n && LANG === 'en' ? NAMES[n] || n : n);
