// The field menu (items, magic, equipment, status, save, settings), shops and the inn.
import { ctx, W, H, text, textW, windowBox, bar } from './gfx.js';
import { sprite } from './sprites.js';
import { ITEMS, SPELLS, HEROES, expFor } from './data.js';
import { S, stats, spellsOf, addItem, count, save } from './party.js';
import { menu, panel, notice, ask, pressKey } from './ui.js';
import { sfx, vol, setVolumes } from './audio.js';
import { healAmount } from './rules.js';

export const settings = { scan: true };
const fmtTime = (t) => { const s = Math.floor(t / 60), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h}:${String(m).padStart(2, '0')}`; };

function drawParty(x, y, w, sel = -1) {
  windowBox(x, y, w, 8 + S.members.length * 40);
  S.members.forEach((m, i) => {
    const s = stats(m), yy = y + 6 + i * 40;
    if (i === sel) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x + 4, yy - 2, w - 8, 38); }
    ctx.drawImage(sprite(m.id).d[0], x + 8, yy + 6);
    text(m.name, x + 30, yy, '#f8f8f8');
    text('Lv ' + m.lv, x + w - 8, yy, '#f8e070', { align: 'right' });
    text(`HP ${m.hp}/${s.maxhp}`, x + 30, yy + 13, m.hp <= 0 ? '#f86060' : m.hp < s.maxhp / 4 ? '#f8e070' : '#f8f8f8');
    text(`MP ${m.mp}/${s.maxmp}`, x + 30, yy + 25, '#c0d0f8');
    if (m.status.poison) text('毒', x + w - 8, yy + 13, '#c080f8', { align: 'right' });
  });
}
async function pickMember(title, filter = () => true) {
  const close = panel(() => {});
  const r = await menu(S.members.map((m) => ({ label: m.name, right: `${m.hp}/${stats(m).maxhp}`, disabled: !filter(m) })), { x: 96, y: 40, w: 150, title });
  close();
  return r < 0 ? null : S.members[r];
}

// ---------- field menu ----------
export async function fieldMenu(ctxInfo) {
  const close = panel(() => {
    drawParty(4, 4, 150, -1);
    windowBox(158, 160, 94, 44);
    text(`${S.gold} G`, 244, 168, '#f8e070', { align: 'right' });
    text(fmtTime(S.time), 244, 184, '#f8f8f8', { align: 'right' });
  });
  let last = 0;
  for (;;) {
    const r = await menu([
      '道具', '魔法', '裝備', '狀態', { label: '存檔', disabled: !ctxInfo.canSave }, '設定',
    ], { x: 162, y: 4, w: 90, start: last });
    if (r < 0) break;
    last = r;
    if (r === 0) await itemMenu();
    if (r === 1) await magicMenu();
    if (r === 2) await equipMenu();
    if (r === 3) await statusMenu();
    if (r === 4) { const ok = save(0); sfx(ok ? 'save' : 'buzz'); await notice(ok ? '記錄完成。' : '無法存檔（瀏覽器不允許）。'); }
    if (r === 5) await settingsMenu();
  }
  close();
}
async function itemMenu() {
  for (;;) {
    const list = Object.keys(S.inv).sort((a, b) => (ITEMS[a].slot ? 1 : 0) - (ITEMS[b].slot ? 1 : 0));
    if (!list.length) { await notice('什麼都沒有。'); return; }
    let desc = '';
    const close = panel(() => { windowBox(4, 186, W - 8, 34); text(desc, 14, 196); });
    const r = await menu(list.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].key ? '' : S.inv[id] })), { x: 4, y: 4, w: W - 8, cols: 2, maxRows: 10, onMove: (i) => { const it = ITEMS[list[i]]; desc = it.desc || (it.slot ? equipDesc(it) : ''); } });
    close();
    if (r < 0) return;
    const id = list[r], it = ITEMS[id];
    if (!it.use || it.use === 'escape') { sfx('buzz'); continue; }
    const target = await pickMember('給誰使用？', (m) => (it.use === 'revive' ? m.hp <= 0 : m.hp > 0));
    if (!target) continue;
    useItemOn(id, target);
  }
}
export function useItemOn(id, m) {
  const it = ITEMS[id], s = stats(m);
  if (it.use === 'heal') m.hp = Math.min(s.maxhp, m.hp + it.power);
  if (it.use === 'mp') m.mp = Math.min(s.maxmp, m.mp + it.power);
  if (it.use === 'cure') delete m.status.poison;
  if (it.use === 'revive') m.hp = Math.max(1, Math.round(s.maxhp * it.power));
  if (it.use === 'full') { m.hp = s.maxhp; m.mp = s.maxmp; }
  addItem(id, -1); sfx('heal');
}
function equipDesc(it) {
  const who = Object.entries(HEROES).filter(([, h]) => it.kind === 'any' || h.kinds.includes(it.kind)).map(([, h]) => h.name).join('、');
  const parts = [];
  if (it.atk) parts.push(`攻擊+${it.atk}`); if (it.def) parts.push(`防禦+${it.def}`);
  for (const [k, v] of Object.entries(it.bonus || {})) parts.push(`${{ str: '力量', def: '防禦', int: '智力', agi: '敏捷' }[k]}+${v}`);
  return `${parts.join(' ')}　可裝備：${who}`;
}
async function magicMenu() {
  const caster = await pickMember('誰要施法？', (m) => m.hp > 0 && spellsOf(m).some((s) => ['heal', 'healall', 'cure', 'revive'].includes(s)));
  if (!caster) return;
  for (;;) {
    const list = spellsOf(caster);
    const r = await menu(list.map((id) => ({ label: SPELLS[id].name, right: SPELLS[id].mp, disabled: !['heal', 'healall', 'cure', 'revive'].includes(id) || SPELLS[id].mp > caster.mp })), { x: 96, y: 40, w: 150, title: `${caster.name}　MP ${caster.mp}` });
    if (r < 0) return;
    const sp = SPELLS[list[r]], st = stats(caster);
    if (sp.target === 'allies') { caster.mp -= sp.mp; for (const m of S.members) if (m.hp > 0) m.hp = Math.min(stats(m).maxhp, m.hp + healAmount(sp.power, sp.k, st)); sfx('heal'); continue; }
    const t = await pickMember('對誰施放？', (m) => (sp.type === 'revive' ? m.hp <= 0 : m.hp > 0));
    if (!t) continue;
    caster.mp -= sp.mp; sfx('heal');
    if (sp.type === 'heal') t.hp = Math.min(stats(t).maxhp, t.hp + healAmount(sp.power, sp.k, st));
    if (sp.type === 'cure') delete t.status.poison;
    if (sp.type === 'revive') t.hp = Math.round(stats(t).maxhp * 0.5);
  }
}
export const canEquip = (m, it) => it.slot && (it.kind === 'any' || HEROES[m.id].kinds.includes(it.kind));
async function equipMenu() {
  const m = await pickMember('誰要換裝備？');
  if (!m) return;
  const SLOT = [['weapon', '武器'], ['armor', '防具'], ['acc', '飾品']];
  for (;;) {
    const st = stats(m);
    const close = panel(() => { windowBox(4, 120, W - 8, 52); text(`${m.name}　攻擊力 ${st.atk}　防禦力 ${st.dfn}`, 14, 128); text(`力量 ${st.str}　智力 ${st.int}　敏捷 ${st.agi}`, 14, 146, '#c0d0f8'); });
    const r = await menu(SLOT.map(([k, n]) => ({ label: n, right: m.equip[k] ? ITEMS[m.equip[k]].name : '──' })), { x: 4, y: 40, w: 200, title: `${m.name}的裝備` });
    close();
    if (r < 0) return;
    const slot = SLOT[r][0];
    const opts = Object.keys(S.inv).filter((id) => ITEMS[id].slot === slot && canEquip(m, ITEMS[id]));
    const cur = m.equip[slot];
    let preview = null;
    const close2 = panel(() => {
      windowBox(4, 150, W - 8, 52);
      const a = stats(m);
      let b = a;
      if (preview !== null) { const keep = m.equip[slot]; m.equip[slot] = preview; b = stats(m); m.equip[slot] = keep; }
      const cmp = (n, x, y) => { const c = y > x ? '#78f878' : y < x ? '#f87878' : '#f8f8f8'; return [n, x, y, c]; };
      const rows = [cmp('攻擊', a.atk, b.atk), cmp('防禦', a.dfn, b.dfn), cmp('智力', a.int, b.int), cmp('敏捷', a.agi, b.agi)];
      rows.forEach(([n, x, y, c], i) => { const X = 14 + (i % 2) * 120, Y = 158 + Math.floor(i / 2) * 18; text(`${n} ${x} → `, X, Y); text(String(y), X + textW(`${n} ${x} → `), Y, c); });
    });
    const labels = [{ label: '（卸下）' }, ...opts.map((id) => ({ label: ITEMS[id].name, right: S.inv[id] }))];
    const k = await menu(labels, { x: 60, y: 30, w: 170, title: SLOT[r][1], maxRows: 6, onMove: (i) => { preview = i === 0 ? null : opts[i - 1]; if (i === 0) preview = undefined; } });
    close2();
    if (k < 0) continue;
    if (cur) addItem(cur, 1);
    if (k === 0) m.equip[slot] = null;
    else { m.equip[slot] = opts[k - 1]; addItem(opts[k - 1], -1); }
    const s2 = stats(m); m.hp = Math.min(m.hp, s2.maxhp); m.mp = Math.min(m.mp, s2.maxmp);
    sfx('ok');
  }
}
async function statusMenu() {
  const m = await pickMember('查看誰的狀態？');
  if (!m) return;
  const st = stats(m);
  const close = panel(() => {
    windowBox(4, 4, W - 8, H - 8);
    ctx.drawImage(sprite(m.id).d[0], 14, 14);
    text(`${m.name}　${HEROES[m.id].title}`, 38, 12, '#f8e070');
    text(`Lv ${m.lv}`, 38, 28);
    text(`經驗 ${m.exp}`, 110, 12); text(`下一級 ${Math.max(0, expFor(m.lv + 1) - m.exp)}`, 110, 28);
    const L = [[`HP ${m.hp}/${st.maxhp}`, `MP ${m.mp}/${st.maxmp}`], [`力量 ${st.str}`, `防禦 ${st.def}`], [`智力 ${st.int}`, `敏捷 ${st.agi}`], [`攻擊力 ${st.atk}`, `防禦力 ${st.dfn}`]];
    L.forEach(([a, b], i) => { text(a, 14, 50 + i * 15); text(b, 130, 50 + i * 15); });
    text('裝備', 14, 116, '#a0c0f8');
    ['weapon', 'armor', 'acc'].forEach((k, i) => text(m.equip[k] ? ITEMS[m.equip[k]].name : '──', 50 + i * 66, 116));
    text('魔法', 14, 134, '#a0c0f8');
    const sp = spellsOf(m).map((s) => SPELLS[s].name);
    for (let i = 0; i < sp.length; i++) text(sp[i], 14 + (i % 4) * 58, 150 + Math.floor(i / 4) * 15);
    text('氣', 14, 196, '#a0c0f8'); bar(34, 201, 100, m.gauge, 100, '#f0b030');
  });
  await pressKey();
  close();
}
async function settingsMenu() {
  for (;;) {
    const lv = (v) => '■'.repeat(Math.round(v * 5)) + '□'.repeat(5 - Math.round(v * 5));
    const r = await menu([{ label: '音樂', right: lv(vol.music) }, { label: '音效', right: lv(vol.sfx) }, { label: '掃描線', right: settings.scan ? '開' : '關' }], { x: 60, y: 60, w: 170, title: '設定' });
    if (r < 0) return;
    if (r === 0) vol.music = (Math.round(vol.music * 5) + 1) % 6 / 5;
    if (r === 1) vol.sfx = (Math.round(vol.sfx * 5) + 1) % 6 / 5;
    if (r === 2) { settings.scan = !settings.scan; document.body.classList.toggle('noscan', !settings.scan); }
    setVolumes();
    try { localStorage.setItem('spire-tide-settings', JSON.stringify({ music: vol.music, sfx: vol.sfx, scan: settings.scan })); } catch (e) { /* private mode */ }
  }
}
export function loadSettings() {
  try { const s = JSON.parse(localStorage.getItem('spire-tide-settings')); if (s) { vol.music = s.music; vol.sfx = s.sfx; settings.scan = s.scan; document.body.classList.toggle('noscan', !s.scan); } } catch (e) { /* none */ }
}

// ---------- shop ----------
export async function shop(stock, greeting = '歡迎光臨！') {
  const close = panel(() => { windowBox(170, 4, 82, 24); text(`${S.gold} G`, 244, 10, '#f8e070', { align: 'right' }); });
  for (;;) {
    const r = await ask('店員', greeting, ['購買', '出售', '離開']);
    if (r === 0) await buy(stock);
    else if (r === 1) await sell();
    else break;
    greeting = '還需要什麼嗎？';
  }
  close();
}
async function buy(stock) {
  let info = '';
  for (;;) {
    const close = panel(() => {
      windowBox(4, 150, W - 8, 70);
      if (info) info.split('\n').forEach((l, i) => text(l, 12, 156 + i * 16));
    });
    const r = await menu(stock.map((id) => ({ label: ITEMS[id].name, right: ITEMS[id].price, disabled: ITEMS[id].price > S.gold })), {
      x: 4, y: 32, w: 160, maxRows: 7, title: '要買什麼？',
      onMove: (i) => {
        const it = ITEMS[stock[i]];
        if (!it.slot) { info = `${it.desc}\n持有 ${count(stock[i])}`; return; }
        info = S.members.map((m) => {
          if (!canEquip(m, it)) return `${m.name} ──`;
          const a = stats(m), keep = m.equip[it.slot]; m.equip[it.slot] = stock[i]; const b = stats(m); m.equip[it.slot] = keep;
          const d = it.slot === 'weapon' ? b.atk - a.atk : b.dfn - a.dfn;
          return `${m.name} ${d > 0 ? '▲' + d : d < 0 ? '▼' + -d : '＝'}`;
        }).join('　').replace(/(.*?　.*?)　/, '$1\n') + `　持有 ${count(stock[i])}`;
      },
    });
    close();
    if (r < 0) return;
    const id = stock[r], it = ITEMS[id];
    if (it.price > S.gold) { sfx('buzz'); continue; }
    S.gold -= it.price; addItem(id); sfx('chest');
    if (it.slot) {
      const who = S.members.filter((m) => canEquip(m, it));
      if (who.length) {
        const k = await ask('店員', `要現在裝備${it.name}嗎？`, ['不用', ...who.map((m) => m.name)]);
        if (k > 0) { const m = who[k - 1], old = m.equip[it.slot]; if (old) addItem(old); m.equip[it.slot] = id; addItem(id, -1); sfx('ok'); }
      }
    }
  }
}
async function sell() {
  for (;;) {
    const list = Object.keys(S.inv).filter((id) => !ITEMS[id].key && ITEMS[id].price > 0);
    if (!list.length) { await notice('沒有可以賣的東西。'); return; }
    const r = await menu(list.map((id) => ({ label: `${ITEMS[id].name}×${S.inv[id]}`, right: Math.floor(ITEMS[id].price / 2) })), { x: 4, y: 32, w: 180, maxRows: 9, title: '要賣什麼？' });
    if (r < 0) return;
    addItem(list[r], -1); S.gold += Math.floor(ITEMS[list[r]].price / 2); sfx('ok');
  }
}
