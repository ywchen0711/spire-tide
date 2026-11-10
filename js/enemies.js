// Battle art for every monster, painted from lit blobs, plus small field sprites for the ones
// that walk around in dungeons.
import { Painter, ramp, canvas } from './gfx.js';

const K = '#100818', WHITE = '#ffffff';
const eye = (p, x, y, col = K, glint = true, h = 2) => { for (let i = 0; i < h; i++) p.px(x, y + i, col); if (glint) p.px(x, y, WHITE); };

const ART = {
  jelly(c = '#58c858') {
    const p = new Painter(40, 32), R = ramp(c, 6);
    p.ball(20, 19, 17, 12, R, { spec: 0.5, cut: (u, v) => v > 0.8 });
    p.ball(20, 10, 5, 4, R, { z: 9, spec: 0.6 });
    p.ball(13, 14, 3, 2, ramp(c, 6).map((x, i) => R[Math.min(5, i + 2)]), { z: 13 });
    eye(p, 14, 17, K, false, 3); eye(p, 25, 17, K, false, 3); p.px(15, 17, WHITE); p.px(26, 17, WHITE);
    p.dots([[18, 23], [19, 24], [20, 24], [21, 24], [22, 23]], R[0]);
    return p.finish();
  },
  redjelly() {
    const c = ART.jelly('#e05838'), p = new Painter(40, 40);
    const R = ramp('#f8a030', 5);
    p.ball(20, 8, 4, 6, R, { z: 2 }); p.ball(13, 10, 2.5, 4, R, { z: 1 }); p.ball(27, 11, 2.5, 4, R, { z: 1 });
    const f = p.finish(), out = canvas(40, 40);
    out.x.drawImage(f, 0, 0); out.x.drawImage(c, 0, 8);
    return out;
  },
  bird() {
    const p = new Painter(48, 40), R = ramp('#e0c070', 6), W = ramp('#c07838', 5), O = ramp('#f08820', 5);
    p.poly([[30, 20], [46, 30], [40, 34], [28, 26]], W, { z: -2, lum: 0.4 });
    p.ball(24, 22, 11, 9, R, { z: 0 });
    p.poly([[22, 16], [8, 8], [2, 14], [10, 22], [20, 24]], W, { z: 6, lum: 0.6 });
    p.ball(16, 13, 7, 6.5, R, { z: 4 });
    p.poly([[10, 12], [1, 15], [10, 16]], O, { z: 9, lum: 0.75 });
    p.tube([[22, 30, 1.2], [21, 37, 1]], O); p.tube([[28, 30, 1.2], [29, 37, 1]], O);
    p.ball(18, 8, 3, 2, ramp('#d04030', 4), { z: 7 });
    eye(p, 14, 11);
    return p.finish();
  },
  hare() {
    const p = new Painter(44, 44), R = ramp('#d8c8b0', 6), Pk = ramp('#e8a0a0', 4), H = ramp('#f0d050', 5);
    p.ball(24, 30, 13, 10, R, { z: 0 });
    p.tube([[16, 14, 2.6, 2], [12, 2, 2, 2]], R); p.tube([[16, 14, 1.3, 4], [12, 3, 1, 4]], Pk);
    p.tube([[24, 14, 2.6, 2], [28, 2, 2, 2]], R); p.tube([[24, 14, 1.3, 4], [28, 3, 1, 4]], Pk);
    p.ball(20, 19, 8.5, 7.5, R, { z: 6 });
    p.poly([[20, 12], [22, 2], [24, 13]], H, { z: 12, lum: 0.75 });
    p.ball(14, 37, 4, 2.5, R, { z: 8 }); p.ball(30, 38, 4, 2.5, R, { z: 4 });
    p.ball(37, 27, 3.5, 3.5, ramp('#ffffff', 4), { z: 2 });
    eye(p, 16, 18); eye(p, 23, 18); p.dots([[19, 22], [20, 22]], '#c06070');
    return p.finish();
  },
  shroom() {
    const p = new Painter(44, 48), C = ramp('#d03838', 6), S = ramp('#f0e0c0', 5);
    p.tube([[22, 28, 8, 0], [22, 42, 9, 0]], S);
    p.ball(22, 44, 10, 3, S, { z: 2 });
    p.ball(22, 18, 20, 12, C, { z: 4, cut: (u, v) => v > 0.55 });
    p.ball(22, 25, 17, 3, ramp('#e8d0b0', 4), { z: 2 });
    for (const [x, y, r] of [[12, 12, 3], [24, 9, 3.5], [33, 15, 2.5], [18, 18, 2]]) p.ball(x, y, r, r * 0.8, ramp('#ffffff', 4), { z: 16 });
    p.tube([[13, 32, 2, 4], [8, 38, 2, 4]], S); p.tube([[31, 32, 2, 4], [36, 38, 2, 4]], S);
    eye(p, 18, 32); eye(p, 26, 32); p.dots([[21, 36], [22, 37], [23, 36]], '#804030');
    return p.finish();
  },
  bat() {
    const p = new Painter(60, 40), B = ramp('#6a4890', 6), M = ramp('#4a2860', 5);
    const wing = (s) => p.poly([[30, 16], [30 + s * 10, 6], [30 + s * 22, 4], [30 + s * 28, 14], [30 + s * 24, 22], [30 + s * 20, 18], [30 + s * 15, 26], [30 + s * 11, 20], [30 + s * 6, 26]], M, { z: -1, lum: 0.55, grad: 0.4 });
    wing(1); wing(-1);
    p.tube([[30, 16, 0.8, 1], [52, 5, 0.6, 1]], B); p.tube([[30, 16, 0.8, 1], [8, 5, 0.6, 1]], B);
    p.ball(30, 20, 7, 8, B, { z: 4 });
    p.poly([[25, 14], [24, 5], [29, 13]], B, { z: 6, lum: 0.6 }); p.poly([[35, 14], [36, 5], [31, 13]], B, { z: 6, lum: 0.6 });
    p.dots([[27, 18], [28, 18], [32, 18], [33, 18]], '#f83030'); p.dots([[28, 23], [32, 23]], WHITE);
    p.dots([[27, 22], [28, 22], [29, 22], [30, 22], [31, 22], [32, 22], [33, 22]], K);
    return p.finish();
  },
  crab(c = '#b85838', big = 1) {
    const S = big, p = new Painter(64 * S, 48 * S), R = ramp(c, 6), L = ramp(c, 5);
    const legs = (s) => { for (let k = 0; k < 3; k++) p.tube([[(32 + s * (12 + k * 5)) * S, (30 + k) * S, 2.2 * S, 0], [(32 + s * (22 + k * 4)) * S, (24 + k * 3) * S, 2 * S, 0], [(32 + s * (26 + k * 3)) * S, (42 + k) * S, 1.4 * S, 0]], L); };
    legs(1); legs(-1);
    p.ball(32 * S, 28 * S, 20 * S, 12 * S, R, { z: 4 * S, spec: 0.3 });
    for (let k = -2; k <= 2; k++) p.ball((32 + k * 7) * S, 20 * S, 2.2 * S, 2.2 * S, R, { z: 14 * S });
    const claw = (s) => {
      p.tube([[(32 + s * 14) * S, 26 * S, 3.5 * S, 8 * S], [(32 + s * 22) * S, 16 * S, 3.5 * S, 10 * S]], R);
      p.ball((32 + s * 24) * S, 11 * S, 7 * S, 6 * S, R, { z: 14 * S, spec: 0.3 });
      p.poly([[(32 + s * 20) * S, 6 * S], [(32 + s * 22) * S, -1 * S], [(32 + s * 27) * S, 5 * S]], R, { z: 18 * S, lum: 0.7 });
    };
    claw(1); claw(-1);
    p.tube([[28 * S, 20 * S, 1 * S, 10 * S], [27 * S, 13 * S, 1 * S, 10 * S]], R); p.tube([[36 * S, 20 * S, 1 * S, 10 * S], [37 * S, 13 * S, 1 * S, 10 * S]], R);
    p.ball(27 * S, 12 * S, 2 * S, 2 * S, ramp('#f8f0e0', 4), { z: 14 * S }); p.ball(37 * S, 12 * S, 2 * S, 2 * S, ramp('#f8f0e0', 4), { z: 14 * S });
    p.px(Math.round(27 * S), Math.round(12 * S), K); p.px(Math.round(37 * S), Math.round(12 * S), K);
    return p.finish({ inner: 2 * S });
  },
  bones() {
    const p = new Painter(48, 68), B = ramp('#e8e0c8', 5), M = ramp('#a0a8b8', 5), Wd = ramp('#8c5428', 5);
    p.tube([[18, 44, 2, 0], [16, 54, 1.8, 0], [15, 64, 1.8, 0]], B); p.tube([[28, 44, 2, 0], [30, 54, 1.8, 0], [31, 64, 1.8, 0]], B);
    p.ball(23, 42, 7, 3.5, B, { z: 2 });
    p.tube([[23, 22, 1.5, 0], [23, 42, 1.5, 0]], B);
    for (let k = 0; k < 4; k++) p.ball(23, 25 + k * 4, 8 - k * 0.8, 1.5, B, { z: 3 });
    p.tube([[15, 23, 2, 2], [12, 33, 1.6, 6], [16, 40, 1.5, 9]], B);
    p.tube([[31, 23, 2, 2], [36, 32, 1.6, 4], [40, 26, 1.5, 6]], B);
    p.poly([[38, 28], [44, 2], [46, 3], [41, 28]], M, { z: 10, lum: 0.75 }); p.poly([[36, 28], [44, 26], [44, 29], [36, 31]], Wd, { z: 11 });
    p.ball(11, 36, 8, 10, Wd, { z: 12, flat: 0.4 }); p.ball(11, 36, 3, 3, M, { z: 20 });
    p.ball(23, 13, 8, 8.5, B, { z: 6 });
    p.ball(23, 19, 5, 3, B, { z: 8 });
    for (const [x, y] of [[19, 12], [20, 12], [19, 13], [20, 13], [26, 12], [27, 12], [26, 13], [27, 13], [23, 16]]) p.px(x, y, K);
    p.px(19, 12, '#f84030'); p.px(26, 12, '#f84030');
    p.dots([[20, 20], [22, 20], [24, 20], [26, 20]], K);
    return p.finish();
  },
  clawmaw() {
    const c = ART.crab('#c04828', 2), p = new Painter(128, 100);
    const out = canvas(132, 104);
    out.x.drawImage(c, 2, 8);
    // spikes on the shell
    const s = new Painter(132, 40), R = ramp('#f0d0a0', 4);
    for (let k = -3; k <= 3; k++) s.poly([[66 + k * 9 - 3, 34], [66 + k * 9, 22 - Math.abs(k) * -1], [66 + k * 9 + 3, 34]], R, { z: 2, lum: 0.7 });
    out.x.drawImage(s.finish(), 0, 6);
    void p;
    return out;
  },
  merrow() {
    const p = new Painter(56, 72), G = ramp('#3a9880', 6), F = ramp('#58c8c8', 5), M = ramp('#b8c0d0', 5), Wd = ramp('#7c5030', 5);
    p.tube([[46, 4, 1.2, 8], [46, 70, 1.2, 8]], Wd);
    p.poly([[43, 6], [46, -2], [49, 6]], M, { z: 9, lum: 0.8 }); p.poly([[42, 6], [50, 6], [50, 8], [42, 8]], M, { z: 9 });
    p.tube([[22, 48, 3.5], [18, 60, 3], [16, 70, 3]], G); p.tube([[30, 48, 3.5], [34, 60, 3], [36, 70, 3]], G);
    p.ball(14, 70, 5, 2, F, { z: 3 }); p.ball(38, 70, 5, 2, F, { z: 3 });
    p.ball(26, 36, 11, 15, G, { z: 2 });
    p.ball(26, 38, 7, 11, ramp('#d8e8c0', 5), { z: 8 });
    p.poly([[18, 22], [26, 6], [34, 22]], F, { z: 0, lum: 0.6 });
    p.tube([[16, 28, 3, 6], [12, 40, 2.6, 8], [16, 48, 2.4, 10]], G);
    p.tube([[36, 28, 3, 6], [42, 34, 2.6, 10], [46, 34, 2.4, 12]], G);
    p.ball(26, 18, 9, 8, G, { z: 8 });
    p.poly([[17, 16], [10, 12], [16, 22]], F, { z: 10 }); p.poly([[35, 16], [42, 12], [36, 22]], F, { z: 10 });
    p.ball(26, 23, 6, 3, ramp('#2a6858', 4), { z: 13 });
    eye(p, 21, 16, '#f8e040', false); eye(p, 31, 16, '#f8e040', false); p.px(21, 17, K); p.px(31, 17, K);
    p.dots([[23, 23], [25, 23], [27, 23], [29, 23]], WHITE);
    return p.finish();
  },
  wisp() {
    const p = new Painter(44, 52), O = ['#801808', '#c83810', '#f07020', '#f8b030', '#f8e070', '#fffff0'];
    p.ball(22, 32, 13, 14, O, { amb: 0.5, z: 0 });
    p.ball(17, 20, 7, 9, O, { amb: 0.5, z: 2 }); p.ball(27, 14, 6, 10, O, { amb: 0.5, z: 2 }); p.ball(22, 8, 3, 7, O, { amb: 0.6, z: 4 });
    p.ball(22, 34, 8, 8, O.slice(3), { amb: 0.7, z: 10 });
    p.dots([[17, 30], [18, 30], [17, 31], [18, 31], [26, 30], [27, 30], [26, 31], [27, 31]], '#401008');
    p.dots([[19, 37], [20, 38], [21, 38], [22, 38], [23, 38], [24, 37]], '#401008');
    return p.finish({ out: '#401008' });
  },
  gargoyle() {
    const p = new Painter(72, 68), S = ramp('#8890a0', 6), D = ramp('#606878', 5);
    const wing = (s) => p.poly([[36 + s * 8, 24], [36 + s * 24, 4], [36 + s * 34, 8], [36 + s * 32, 22], [36 + s * 28, 18], [36 + s * 26, 30], [36 + s * 20, 26], [36 + s * 14, 34]], D, { z: -2, lum: 0.5, grad: 0.4 });
    wing(1); wing(-1);
    p.tube([[28, 50, 4], [24, 58, 3.5], [22, 66, 3]], S); p.tube([[44, 50, 4], [48, 58, 3.5], [50, 66, 3]], S);
    p.ball(36, 40, 13, 15, S, { z: 2 });
    p.tube([[24, 30, 4, 6], [18, 42, 3.4, 10], [22, 50, 3, 14]], S); p.tube([[48, 30, 4, 6], [54, 42, 3.4, 10], [50, 50, 3, 14]], S);
    for (const x of [19, 23, 49, 53]) p.poly([[x - 1, 50], [x, 56], [x + 1, 50]], ramp('#e8e0d0', 3), { z: 18 });
    p.ball(36, 22, 9, 8, S, { z: 10 });
    p.poly([[28, 18], [22, 6], [30, 15]], ramp('#d8d0b8', 4), { z: 12 }); p.poly([[44, 18], [50, 6], [42, 15]], ramp('#d8d0b8', 4), { z: 12 });
    p.ball(36, 27, 6, 3.5, S, { z: 15 });
    eye(p, 32, 21, '#f8d030', false); eye(p, 40, 21, '#f8d030', false);
    p.dots([[33, 28], [35, 29], [37, 29], [39, 28]], WHITE);
    return p.finish();
  },
  serpent() {
    const p = new Painter(72, 76), G = ramp('#2878a8', 6), B = ramp('#e8d8a0', 5), F = ramp('#e85848', 5);
    p.tube([[10, 70, 6, 0], [30, 66, 9, 0], [54, 62, 10, 0], [60, 48, 9, 4], [44, 40, 9, 8], [28, 36, 8, 10], [26, 22, 7, 14], [34, 12, 7, 16]], G, { spec: 0.2 });
    p.tube([[28, 36, 4, 18], [26, 22, 4, 20]], B);
    p.poly([[22, 24], [12, 14], [20, 30]], F, { z: 18 }); p.poly([[32, 24], [40, 16], [34, 30]], F, { z: 18 });
    p.ball(36, 12, 10, 8, G, { z: 18 });
    p.ball(44, 15, 7, 4, G, { z: 20 });
    p.poly([[30, 6], [36, -2], [42, 6]], F, { z: 22 });
    eye(p, 37, 9, '#f8e040', false); p.px(38, 10, K);
    p.dots([[48, 17], [46, 18], [44, 18], [42, 18]], K); p.dots([[46, 19], [43, 19]], WHITE);
    return p.finish();
  },
  seren() {
    const p = new Painter(96, 112), D = ramp('#482868', 6), Sk = ramp('#c8d0e8', 6), H = ramp('#e0e8f8', 6), T = ramp('#40d8c8', 5), M = ramp('#b0b8d0', 5);
    // trailing hair and mist
    p.tube([[46, 20, 9, -4], [38, 44, 10, -4], [30, 70, 7, -4], [20, 88, 4, -4]], H);
    p.tube([[52, 20, 9, -4], [62, 44, 10, -4], [68, 70, 7, -4], [76, 88, 4, -4]], H);
    p.poly([[30, 44], [66, 44], [80, 100], [62, 94], [50, 106], [38, 94], [18, 100]], D, { z: 2, lum: 0.55, grad: 0.5 });
    p.poly([[42, 44], [54, 44], [58, 90], [48, 98], [38, 90]], ramp('#683898', 5), { z: 3, lum: 0.6 });
    p.ball(48, 40, 11, 9, D, { z: 6 });
    p.ball(48, 36, 7, 4, Sk, { z: 10 });
    p.tube([[38, 36, 3, 8], [28, 48, 2.6, 12], [22, 40, 2.2, 16]], Sk); p.tube([[58, 36, 3, 8], [68, 46, 2.6, 12], [74, 52, 2.2, 16]], Sk);
    p.tube([[80, 8, 1.4, 14], [70, 100, 1.4, 14]], M);
    p.ball(80, 10, 5, 5, T, { z: 18, spec: 0.8, amb: 0.5 });
    p.ball(22, 38, 5, 5, T, { z: 18, spec: 0.8, amb: 0.5 });
    p.ball(48, 20, 9, 10, Sk, { z: 12 });
    p.ball(48, 12, 10, 7, H, { z: 14, cut: (u, v) => v > 0.35 });
    p.tube([[39, 14, 3, 14], [38, 26, 2.5, 13]], H); p.tube([[57, 14, 3, 14], [58, 26, 2.5, 13]], H);
    p.poly([[42, 6], [48, -1], [54, 6]], T, { z: 20 });
    eye(p, 44, 20, '#e02060', false); eye(p, 51, 20, '#e02060', false);
    p.dots([[47, 26], [48, 26]], '#8890b0');
    return p.finish({ out: '#100418' });
  },
  ordath() {
    const p = new Painter(160, 132), A = ramp('#305860', 6), G = ramp('#6a7848', 6), C = ramp('#e0b040', 6), E = ['#401008', '#c02018', '#f85030', '#f8d070'];
    // tentacles
    for (let k = 0; k < 6; k++) { const x = 40 + k * 16, s = k % 2 ? 1 : -1; p.tube([[x, 96, 7, 0], [x + s * 10, 112, 5, 0], [x - s * 4, 128, 3, 0]], G); }
    p.ball(80, 84, 46, 30, A, { z: 2 });
    p.ball(36, 56, 18, 16, A, { z: 8, spec: 0.3 }); p.ball(124, 56, 18, 16, A, { z: 8, spec: 0.3 });
    for (const x of [26, 36, 46]) p.poly([[x - 4, 46], [x, 30], [x + 4, 46]], ramp('#d0d8c8', 4), { z: 14 });
    for (const x of [114, 124, 134]) p.poly([[x - 4, 46], [x, 30], [x + 4, 46]], ramp('#d0d8c8', 4), { z: 14 });
    p.tube([[30, 66, 9, 10], [20, 90, 8, 14], [28, 108, 7, 18]], A); p.tube([[130, 66, 9, 10], [142, 88, 8, 14], [146, 70, 7, 18]], A);
    p.tube([[150, 4, 2.4, 20], [140, 124, 2.4, 20]], C);
    for (const dx of [-8, 0, 8]) p.poly([[150 + dx - 2, 10], [150 + dx * 1.2, -2], [150 + dx + 2, 10]], C, { z: 22 });
    p.ball(80, 50, 22, 20, G, { z: 14 });
    for (let k = -2; k <= 2; k++) p.tube([[80 + k * 7, 60, 4, 20], [80 + k * 9, 76, 3, 22], [80 + k * 8, 92, 1.8, 22]], G);
    p.ball(80, 30, 18, 6, C, { z: 22, spec: 0.5 });
    for (let k = -2; k <= 2; k++) p.poly([[80 + k * 8 - 4, 28], [80 + k * 8, 14 - (k === 0 ? 6 : 0)], [80 + k * 8 + 4, 28]], C, { z: 24 });
    p.ball(80, 21, 3, 3, ramp('#e83050', 4), { z: 30, spec: 0.8 });
    p.ball(70, 46, 5, 4, E, { z: 30, amb: 0.7 }); p.ball(90, 46, 5, 4, E, { z: 30, amb: 0.7 });
    p.dots([[70, 46], [90, 46]], '#ffffff');
    return p.finish({ out: '#081018', inner: 3 });
  },
};

// small 16x16 walkers for dungeon maps
const MINI = {
  bat() { const p = new Painter(18, 14), B = ramp('#6a4890', 5); p.poly([[9, 6], [1, 2], [0, 8], [4, 7], [6, 11]], B, { lum: 0.5 }); p.poly([[9, 6], [17, 2], [18, 8], [14, 7], [12, 11]], B, { lum: 0.5 }); p.ball(9, 7, 3, 3.5, B, { z: 3 }); p.dots([[8, 6], [10, 6]], '#f83030'); return p.finish(); },
  crab() { const p = new Painter(18, 14), R = ramp('#b85838', 5); p.ball(9, 9, 7, 4, R, { z: 1 }); p.ball(2.5, 5, 2.5, 2.5, R, { z: 3 }); p.ball(15.5, 5, 2.5, 2.5, R, { z: 3 }); p.dots([[7, 6], [11, 6]], K); return p.finish(); },
  bones() { const p = new Painter(16, 20), B = ramp('#e8e0c8', 4); p.tube([[8, 9, 1, 0], [8, 15, 1, 0]], B); p.tube([[6, 15, 1, 0], [5, 19, 1, 0]], B); p.tube([[10, 15, 1, 0], [11, 19, 1, 0]], B); p.ball(8, 11, 4, 1.2, B, { z: 2 }); p.ball(8, 5, 4, 4, B, { z: 3 }); p.dots([[6, 5], [10, 5]], K); return p.finish(); },
  shroom() { const p = new Painter(16, 16), C = ramp('#d03838', 5), S = ramp('#f0e0c0', 4); p.tube([[8, 9, 3, 0], [8, 14, 3.5, 0]], S); p.ball(8, 7, 7, 4.5, C, { z: 3, cut: (u, v) => v > 0.5 }); p.dots([[5, 5], [10, 4]], WHITE); p.dots([[7, 11], [9, 11]], K); return p.finish(); },
  merrow() { const p = new Painter(16, 22), G = ramp('#3a9880', 5); p.tube([[6, 14, 1.5], [5, 21, 1.4]], G); p.tube([[10, 14, 1.5], [11, 21, 1.4]], G); p.ball(8, 11, 4, 5, G, { z: 1 }); p.ball(8, 5, 4, 3.5, G, { z: 3 }); p.poly([[8, 0], [5, 3], [11, 3]], ramp('#58c8c8', 4), { z: 4 }); p.tube([[13, 2, 0.6, 5], [13, 21, 0.6, 5]], ramp('#b8c0d0', 4)); p.dots([[6, 5], [10, 5]], '#f8e040'); return p.finish(); },
  wisp() { const p = new Painter(16, 18), O = ['#801808', '#c83810', '#f07020', '#f8b030', '#f8e070']; p.ball(8, 11, 6, 6, O, { amb: 0.5 }); p.ball(8, 5, 3, 5, O, { amb: 0.6, z: 2 }); p.dots([[6, 11], [10, 11]], '#401008'); return p.finish({ out: '#401008' }); },
  gargoyle() { const p = new Painter(20, 20), S = ramp('#8890a0', 5); p.poly([[10, 8], [1, 2], [2, 10]], S, { lum: 0.4 }); p.poly([[10, 8], [19, 2], [18, 10]], S, { lum: 0.4 }); p.ball(10, 12, 5, 6, S, { z: 2 }); p.ball(10, 6, 3.5, 3, S, { z: 4 }); p.dots([[9, 6], [11, 6]], '#f8d030'); return p.finish(); },
  serpent() { const p = new Painter(18, 18), G = ramp('#2878a8', 5); p.tube([[3, 16, 2.5, 0], [12, 14, 3, 1], [12, 8, 2.6, 3], [8, 4, 2.6, 5]], G); p.ball(9, 4, 3.5, 3, G, { z: 7 }); p.px(9, 3, '#f8e040'); return p.finish(); },
};

const cache = new Map();
export function enemyArt(key) {
  if (!cache.has(key)) cache.set(key, ART[key]());
  return cache.get(key);
}
export function miniArt(key) {
  const k = 'mini:' + key;
  if (!cache.has(k)) cache.set(k, MINI[key] ? MINI[key]() : enemyArt(key));
  return cache.get(k);
}
export const ART_KEYS = Object.keys(ART);
