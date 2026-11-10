// Hand-drawn 16x24 walking sprites. A sprite is a head (13 rows, by hair style) laid over a body
// (rows 11-23, by outfit), coloured from a per-character palette.
import { canvas, fromGrid, flipX } from './gfx.js';

// a half row mirrored into a full 16-pixel row
const M = (h) => { if (h.length !== 8) throw new Error('half ' + h); return h + [...h].reverse().join(''); };
const F = (r) => { r = r.replace(/\|/g, ''); if (r.length !== 16) throw new Error('row ' + r + ' ' + r.length); return r; };
const sym = (rows) => rows.map((r) => (r.replace(/\|/g, '').length === 8 ? M(r.replace(/\|/g, '')) : F(r)));
const full = (rows) => rows.map(F);

// ---------- heads: down, up, left; 13 rows each ----------
const FACE_D = [ // shared lower face for the front view; rows 7-12
  null, null, null, null, null, null, null,
  '.oHs|ssss', '.oHs|ssss', '.oHs|sess', '.oSs|sess', '..oS|sssm', '...o|oSSS',
];
const HEADS = {
  spiky: {
    d: sym(['....|...o', '...o|.oho', '..oh|ohhl', '..oh|hhll', '.ohh|hhhh', '.ohh|hhhh', 'ohhH|hhhH', 'ohHh|Hssh', ...FACE_D.slice(8)]),
    u: sym(['....|...o', '...o|.oho', '..oh|ohhl', '..oh|hhll', '.ohh|hhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|..o.|o.o.|....', '....|oohoh|oho|o...', '...o|hhlh|hlhh|ho..', '..oh|hllh|hhhh|hhoo', '.ohh|hhhh|hhhh|hhho', 'ohhh|hhhh|hhhh|hHHo', 'ohhH|hhhh|hhhh|hHHo', 'oHhs|Hhhh|hhhh|HHo.', '.oHs|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  long: {
    d: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|hlhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|Hhss', 'ohHs|ssss', 'ohHs|sess', 'oHHs|sess', 'oHHS|sssm', 'oHHo|oSSS']),
    u: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|hlhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', 'ohHh|hhhH', 'oHHh|hhhH', 'oHHH|hhHH', 'oHHH|HHHH']),
    l: full(['....|.ooo|oo..|....', '...o|ohhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hho.', 'ohhh|hhhh|hhhh|hhho', 'ohHh|hhhh|hhhh|hHho', 'oHss|Hhhh|hhhh|hHHo', '.oss|sshh|hhhh|HHHo', '.ose|sssS|hhhh|HHHo', '.ose|sssS|hhhH|HHHo', '..os|ssss|HhHH|HHo.', '...o|oSSo|HHHH|Ho..']),
  },
  ponytail: {
    d: sym(['....|.ooo', '...o|ohhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhh|hhhh', 'ohhH|hhhh', 'ohHh|sHss', ...FACE_D.slice(8)]),
    u: full(['....|.ooo|ooo.|....', '...o|ohhh|hhho|o...', '..oh|hlll|lllh|ho..', '.ohh|lhhh|hhhl|hho.', '.ohh|hhhh|hhhh|hho.', 'ohhh|hhhh|hhhh|hhho', 'ohhh|hhaa|aahh|hhho', 'ohhH|hhhh|hhhh|Hhho', '.oHh|hhhl|lhhh|hHo.', '.oHH|hhhl|hhhh|HHo.', '.oSH|HhHh|hhHH|HSo.', '..oS|HHoh|hoHH|So..', '...o|oSoh|hoSo|o...']),
    l: full(['....|.ooo|oo..|....', '...o|ohhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|aao.', 'ohhh|hhhh|hhhh|aaho', 'ohHh|hhhh|hhhh|ohho', 'oHss|Hhhh|hhhh|ohhH', '.oss|sshh|hhhH|oohH', '.ose|sssS|hhHH|o.oH', '.ose|sssS|sHHo|..oH', '..os|ssss|SHHo|...o', '...o|oSSS|Sooo|....']),
  },
  bun: {
    d: sym(['....|..oo', '....|.ohl', '...o|oohh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|sssh', ...FACE_D.slice(8)]),
    u: sym(['....|..oo', '....|.ohl', '...o|oohh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', 'ohhH|hhhh', 'ohHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|..oo|o...', '....|....|.ohl|ho..', '....|oooo|ohhh|o...', '...o|hlll|hhho|....', '..oh|lhhh|hhhh|o...', '.ohh|hhhh|hhhh|ho..', '.ohH|hhhh|hhhh|Hho.', '.oss|Hhhh|hhhh|HHo.', '.oss|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  bald: { // old man with a white beard
    d: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', 'ohhS|ssss', 'ohhS|ssss', '.ohS|SSss', '.ohs|sess', '.oSs|sess', '..ow|wwww', '..ow|wwww']),
    u: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', 'ohhS|ssss', 'ohhh|SSss', '.ohh|hhSS', '.ohh|hhhh', '.oSh|hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|.ooo|oo..|....', '...o|slls|ssoo|....', '..os|ssss|ssss|o...', '.oss|ssss|ssss|so..', '.oss|ssss|ssss|Sso.', '.oss|ssss|sssh|hho.', '.oss|ssSS|SShh|hho.', '.oss|ssSS|ssSh|hho.', '.ose|sssS|sssS|ho..', '.oww|wwss|ssSS|o...', 'owww|wwwS|SSoo|....', '.oww|wwwo|oo..|....']),
  },
  beard: { // Garo: shaved head, big red beard
    d: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', '.oSs|ssss', '.oSH|HHss', '.oSs|ssss', '.ohs|sess', 'ohhh|sehh', 'ohhh|hlhh', '.ohh|hhhh']),
    u: sym(['....|....', '....|.ooo', '...o|osll', '..os|ssss', '.oss|ssss', '.oSs|ssss', '.oSs|ssss', '.oSS|ssss', '.oSS|SSss', '.ohS|SSSS', 'ohhh|SSSS', 'ohhh|hhhh', '.ohh|hhhh']),
    l: full(['....|....|....|....', '....|.ooo|oo..|....', '...o|slls|ssoo|....', '..os|ssss|ssss|o...', '.oss|ssss|ssss|so..', '.oss|ssss|ssss|Sso.', '.oss|ssss|ssss|Sso.', '.oHH|ssSS|ssss|Sso.', '.oss|ssss|ssss|So..', '.ose|sssh|sssS|So..', '.ohh|hhhh|hSSS|o...', 'ohhh|lhhh|hhoo|....', '.ohh|hhhh|ho..|....']),
  },
  bandana: {
    d: sym(['....|....', '....|oooo', '...o|aaak', '..oa|aaak', '.oaa|aaaa', '.oAA|AAAA', 'ohhA|AAAA', 'ohhs|ssss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|aaak', '..oa|aaak', '.oaa|aaaa', '.oAA|AAAA', 'ohhA|AAAA', 'ohhh|hhhh', '.oHh|hhhh', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|aaak|kaoo|....', '..oa|aaak|aaaa|o...', '.oaa|aaaa|aaaa|ao..', '.oAA|AAAA|AAAA|Ao..', '.ohA|AAAA|AAAA|Aoao', '.oss|hhhh|hhhh|oaao', '.oss|sshh|hhhH|Hoao', '.ose|sssS|hhhH|Ho.o', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  short: {
    d: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', '.ohH|hhhh', '.oHh|Hhss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', '.ohh|hhhh', '.ohh|hhhh', '.oHh|hhhh', '.oHh|hhhH', '.oHH|hhhh', '.oSH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|hhhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hho.', '.ohH|hhhh|hhhh|hHo.', '.oss|Hhhh|hhhh|HHo.', '.oss|sshh|hhhH|HHo.', '.ose|sssS|hhhH|Ho..', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
  helmet: {
    d: sym(['....|....', '....|oooo', '...o|mmmw', '..om|mmmw', '.omm|mmmm', '.omm|mmmm', 'oMMM|MMMM', 'oMMs|ssss', ...FACE_D.slice(8)]),
    u: sym(['....|....', '....|oooo', '...o|mmmw', '..om|mmmw', '.omm|mmmm', '.omm|mmmm', 'oMMM|MMMM', 'oMMm|mmmm', '.oMm|mmmm', '.oMM|mmmm', '.oSM|MMMM', '..oS|SSSS', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|mmmw|wmoo|....', '..om|mmmw|mmmm|o...', '.omm|mmmm|mmmm|mo..', '.omm|mmmm|mmmm|Mo..', 'oMMM|MMMM|MMMM|MMo.', '.oss|MMmm|mmmm|MMo.', '.oss|ssMm|mmmM|MMo.', '.ose|sssS|MmmM|Mo..', '.ose|sssS|sMMM|Mo..', '..os|ssss|SSSS|o...', '...o|oSSS|Sooo|....']),
  },
  hood: {
    d: sym(['....|....', '....|oooo', '...o|cckk', '..oc|ckkk', '.occ|kkkk', '.ocC|cccc', 'ocCh|hhhh', 'ocCh|ssss', 'ocCs|ssss', 'ocCs|sess', 'oCCs|sess', 'oCCS|sssm', 'oCCo|oSSS']),
    u: sym(['....|....', '....|oooo', '...o|cckk', '..oc|ckkk', '.occ|kkkk', '.occ|cccc', 'occc|cccc', 'occC|cccc', 'occC|cccc', 'oCcC|cccC', 'oCCc|cccC', 'oCCC|ccCC', 'oCCC|CCCC']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|cckk|kcoo|....', '..oc|ckkk|cccc|o...', '.occ|kkkk|cccc|co..', '.oCc|cccc|cccc|Cco.', 'oChh|hccc|cccc|CCo.', 'oCss|hccc|cccc|CCo.', '.oss|sscc|cccC|CCo.', '.ose|ssCc|cccC|CCo.', '.ose|ssCc|cCCC|CCo.', '..os|sssC|CCCC|Co..', '...o|oSSo|CCCC|o...']),
  },
  pigtails: {
    d: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', 'oohh|hhhh', 'ahhH|hhhh', 'ohHh|sHss', 'ohos|ssss', 'oo.o|sess', '...o|sess', '..oS|sssm', '...o|oSSS']),
    u: sym(['....|....', '....|oooo', '...o|hhhh', '..oh|hlll', '.ohh|lhhh', 'oohh|hhhh', 'ahhh|hhhh', 'ohhH|hhhh', 'oho.|hhhH', 'oo.H|hhhh', '..oH|Hhhh', '..oS|HHHH', '...o|oSSS']),
    l: full(['....|....|....|....', '....|oooo|oo..|....', '...o|hhhh|hhoo|....', '..oh|hlll|hhhh|o...', '.ohh|lhhh|hhhh|ho..', '.ohh|hhhh|hhhh|hhoo', '.ohH|hhhh|hhhh|hHah', '.oss|Hhhh|hhhh|HHoh', '.oss|sshh|hhhH|HHoh', '.ose|sssS|hhhH|Ho.o', '.ose|sssS|sHHH|Ho..', '..os|ssss|SHHH|o...', '...o|oSSS|Sooo|....']),
  },
};

// ---------- bodies: rows 11-23 (13 rows; the first two hide under the head) ----------
const LEGS_D = { // left foot forward / right foot forward for the front view
  stand: ['...o|ppPo|oPpp|o...', '...o|ppPo|oPpp|o...', '...o|bbBo|oBbb|o...', '...o|ooo.|.ooo|o...'],
  a: ['...o|ppPo|oPpp|o...', '...o|bbPo|oPpp|o...', '...o|bbBo|obbb|o...', '....|ooo.|oooo|....'],
};
const BODIES = {
  tunic: {
    d: [sym(['....|....', '....|....', '...o|oaaa', '..ok|caAA', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|bbab', '..oo|Cccc', '...o|Cccc']), LEGS_D],
    u: [sym(['....|....', '....|....', '...o|oSSS', '..ok|caaa', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|bbbb', '..oo|Cccc', '...o|Cccc']), LEGS_D],
    l: { // left view: stand, a, b
      top: full(['....|....|....|....', '....|....|....|....', '...o|aaaa|oo..|....', '..oa|aAck|kco.|....', '..oc|ccck|kcco|....', '..oc|cccC|kcCo|....', '..oc|cccs|sCCo|....', '..ob|bbbs|sbbo|....', '..oc|cccc|CCo.|....', '..oc|cccc|CCo.|....']),
      stand: full(['...o|ppPP|o...|....', '...o|ppPP|o...|....', '..ob|bbBB|o...|....', '..oo|oooo|....|....']),
      a: full(['..op|pooP|Po..|....', '.opp|o..o|PPo.|....', 'obbb|o..o|BBo.|....', 'oooo|....|ooo.|....']),
      b: full(['...o|pPPo|....|....', '...o|pPPo|....|....', '..ob|bBBo|....|....', '..oo|ooo.|....|....']),
    },
  },
  robe: {
    d: [sym(['....|....', '....|....', '...o|oaaa', '..ok|caAA', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|Ccab', '..oC|cccc', '..oC|cccc']), {
      stand: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..oo|bboo|oobb|oo..'],
      a: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..ob|bboo|oooo|oo..'],
    }],
    u: [sym(['....|....', '....|....', '...o|oSSS', '..ok|cccc', '.okk|cccc', '.okC|cccc', '.osC|cccc', '.oso|Cccc', '..oC|cccc', '..oC|cccc']), {
      stand: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..oo|bboo|oobb|oo..'],
      a: ['..oC|cccc|cccc|Co..', '.oCC|cccc|cccc|CCo.', '.oCC|cccC|Cccc|CCo.', '..ob|bboo|oooo|oo..'],
    }],
    l: {
      top: full(['....|....|....|....', '....|....|....|....', '...o|aaaa|oo..|....', '..oa|aAck|kco.|....', '..oc|ccck|kcco|....', '..oc|cccC|kcCo|....', '..oc|cccs|sCCo|....', '..oc|cccs|sCCo|....', '..oc|cccc|CCo.|....', '..oc|cccc|CCCo|....']),
      stand: full(['..oc|cccc|CCCo|....', '.occ|cccc|CCCo|....', '.occ|cccc|cCCC|o...', '..ob|bbBo|ooo.|....']),
      a: full(['..oc|cccc|CCCo|....', '.occ|cccc|cCCC|o...', 'occc|cccc|ccCC|o...', '.obb|o.oo|BBo.|....']),
      b: full(['..oc|cccc|CCCo|....', '.occ|cccc|CCCo|....', '.occ|cccc|cCCo|....', '..ob|bBoo|o...|....']),
    },
  },
  heavy: {
    d: [sym(['....|....', '....|....', '..oo|kkkk', '.okk|kkcc', 'okkk|cccc', 'okkC|cccc', 'osCC|cccc', 'osso|aaAa', '.ooC|Cccc', '..oC|Cccc']), {
      stand: ['..oP|ppPo|oPpp|Po..', '..oP|ppPo|oPpp|Po..', '..ob|bbBo|oBbb|bo..', '..oo|ooo.|.ooo|oo..'],
      a: ['..oP|ppPo|oPpp|Po..', '..ob|bbPo|oPpp|Po..', '..ob|bbBo|obbb|bo..', '...o|ooo.|oooo|o...'],
    }],
    u: [sym(['....|....', '....|....', '..oo|SSSS', '.okk|kkkk', 'okkk|cccc', 'okkC|cccc', 'osCC|cccc', 'osso|aaaa', '.ooC|Cccc', '..oC|Cccc']), {
      stand: ['..oP|ppPo|oPpp|Po..', '..oP|ppPo|oPpp|Po..', '..ob|bbBo|oBbb|bo..', '..oo|ooo.|.ooo|oo..'],
      a: ['..oP|ppPo|oPpp|Po..', '..ob|bbPo|oPpp|Po..', '..ob|bbBo|obbb|bo..', '...o|ooo.|oooo|o...'],
    }],
    l: {
      top: full(['....|....|....|....', '....|....|....|....', '..ok|kkkk|kooo|....', '.okk|kkck|kkkk|o...', '.okc|ccck|kkcC|o...', '.okc|cccC|kkCC|o...', '.okc|cccs|ssCC|o...', '.oaa|aaas|ssaa|o...', '.ocC|cccc|CCCo|....', '.ocC|cccc|CCCo|....']),
      stand: full(['..oP|ppPP|Po..|....', '..oP|ppPP|Po..|....', '.obb|bbBB|Bo..|....', '.ooo|oooo|o...|....']),
      a: full(['.oPp|pooP|PPo.|....', 'oPpp|o..o|PPPo|....', 'obbb|o..o|BBBo|....', 'oooo|....|oooo|....']),
      b: full(['..oP|pPPP|o...|....', '..oP|pPPP|o...|....', '..ob|bBBB|o...|....', '..oo|oooo|....|....']),
    },
  },
};

// ---------- characters ----------
const SKIN = { s: '#f8c898', S: '#d08868', m: '#c06858', e: '#281830', o: '#20101c', w: '#f0f0f8' };
export const CHARS = {
  ren:     { head: 'spiky', body: 'tunic', pal: { h: '#384888', H: '#202858', l: '#6080c8', c: '#3878d0', C: '#2048a0', k: '#78b0f0', a: '#d84038', A: '#982028', p: '#6b5038', P: '#483020', b: '#a06838', B: '#683818' } },
  mira:    { head: 'long', body: 'robe', pal: { h: '#d84838', H: '#902830', l: '#f89070', c: '#40a058', C: '#286838', k: '#88d088', a: '#f0c040', A: '#b08020', b: '#704020', B: '#482010' } },
  garo:    { head: 'beard', body: 'heavy', pal: { h: '#c85820', H: '#883010', l: '#f09040', c: '#887060', C: '#584030', k: '#a0a8b8', a: '#d0a030', A: '#906010', p: '#584838', P: '#382818', b: '#4a3020', B: '#2a1808', s: '#e8b080', S: '#b87850' } },
  lys:     { head: 'ponytail', body: 'robe', pal: { h: '#d8d8f0', H: '#9090b8', l: '#ffffff', c: '#f0f0f8', C: '#a0a8c8', k: '#ffffff', a: '#4870e0', A: '#2040a0', b: '#806040', B: '#503020' } },
  mom:     { head: 'bun', body: 'robe', pal: { h: '#784828', H: '#4a2810', l: '#a87048', c: '#c06878', C: '#884050', k: '#e898a0', a: '#f0e8d0', A: '#c0b090', b: '#604030', B: '#402010' } },
  elder:   { head: 'bald', body: 'robe', pal: { h: '#d8d8d8', H: '#a0a0a8', l: '#ffffff', c: '#7858a8', C: '#503878', k: '#a888d0', a: '#e0c060', A: '#a08030', b: '#604030', B: '#402010' } },
  sailor:  { head: 'bandana', body: 'tunic', pal: { h: '#583820', H: '#382010', l: '#805838', c: '#f0f0f0', C: '#a8b0c8', k: '#ffffff', a: '#d03838', A: '#902020', p: '#3858a8', P: '#203878', b: '#604020', B: '#402010', s: '#e0a070', S: '#b07048' } },
  merchant:{ head: 'short', body: 'heavy', pal: { h: '#986830', H: '#684018', l: '#c09050', c: '#b07838', C: '#784818', k: '#e8d8b0', a: '#486838', A: '#284818', p: '#584030', P: '#382010', b: '#503020', B: '#301808' } },
  guard:   { head: 'helmet', body: 'tunic', pal: { h: '#a0a0a8', H: '#606068', l: '#ffffff', m: '#b8c0d0', M: '#707890', c: '#a03030', C: '#681818', k: '#b8c0d0', a: '#d8b040', A: '#987018', p: '#505868', P: '#303848', b: '#584030', B: '#382010' } },
  nun:     { head: 'hood', body: 'robe', pal: { h: '#e8d098', H: '#b09060', l: '#fff0c0', c: '#283048', C: '#141828', k: '#485878', a: '#f0f0f0', A: '#b0b0c0', b: '#302018', B: '#201008' } },
  girl:    { head: 'pigtails', body: 'robe', pal: { h: '#e8a830', H: '#b07010', l: '#ffd870', c: '#e87898', C: '#b04868', k: '#ffb0c8', a: '#ffffff', A: '#c0c0d0', b: '#a05030', B: '#703018' } },
  boy:     { head: 'short', body: 'tunic', pal: { h: '#402818', H: '#281408', l: '#684830', c: '#58a038', C: '#386820', k: '#90d068', a: '#e8c048', A: '#a88018', p: '#806040', P: '#584028', b: '#704828', B: '#482810' } },
  fisher:  { head: 'bald', body: 'heavy', pal: { h: '#c8c8c8', H: '#909098', l: '#f0f0f0', c: '#4870a0', C: '#284870', k: '#88a8d0', a: '#806040', A: '#584020', p: '#585048', P: '#383028', b: '#403020', B: '#281808', s: '#e0a070', S: '#b07048' } },
  herald:  { head: 'long', body: 'robe', pal: { h: '#e0e8f8', H: '#8890b8', l: '#ffffff', c: '#381848', C: '#200828', k: '#7840a0', a: '#40e0d0', A: '#209088', b: '#200818', B: '#100408', s: '#c8d0e8', S: '#8890b0', e: '#e02060', m: '#8890b0' } },
};

const cache = new Map();
function build(name) {
  const C = CHARS[name], pal = { ...SKIN, ...C.pal };
  pal.H = pal.H || pal.h; pal.l = pal.l || pal.h;
  for (const k of 'mMwkaApPbB') if (!(k in pal)) pal[k] = pal.c || '#888888';
  const head = HEADS[C.head], body = BODIES[C.body];
  const frames = {};
  const make = (headRows, bodyRows) => {
    const c = canvas(16, 24);
    fromGrid(bodyRows, pal, c, 0, 11);
    // the head goes over the body, skipping its clear pixels
    fromGrid(headRows, pal, c, 0, 0);
    return c;
  };
  for (const dir of ['d', 'u']) {
    const [top, legs] = body[dir];
    const st = [...top, ...full(legs.stand)], a = [...top, ...full(legs.a)];
    const aMir = [...top, ...full(legs.a).map((r) => [...r].reverse().join(''))];
    frames[dir] = [make(head[dir], st), make(head[dir], a), make(head[dir], st), make(head[dir], aMir)];
  }
  const L = body.l;
  frames.l = [make(head.l, [...L.top, ...L.stand]), make(head.l, [...L.top, ...L.a]), make(head.l, [...L.top, ...L.stand]), make(head.l, [...L.top, ...L.b])];
  frames.r = frames.l.map(flipX);
  return frames;
}
// frames[dir][0..3]; dir is d, u, l or r
export function sprite(name) {
  let f = cache.get(name);
  if (!f) { f = build(name); cache.set(name, f); }
  return f;
}
