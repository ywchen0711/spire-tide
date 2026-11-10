// A small 16-bit style sound chip: pulse, triangle, string and noise voices through an echo,
// a note sequencer for the soundtrack, and sound effects.
let A = null, master, musicBus, sfxBus, echoIn, noiseBuf;
const waves = {};
export const vol = { music: 0.55, sfx: 0.7 };
// music can be switched off altogether; the volume is kept for when it comes back on
export const music = { on: true };
const mv = () => (music.on ? vol.music : 0);

export function initAudio() {
  if (A) { if (A.state === 'suspended') A.resume(); return; }
  A = new (window.AudioContext || window.webkitAudioContext)();
  master = A.createGain(); master.gain.value = 0.8;
  const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
  master.connect(lp); lp.connect(A.destination);
  musicBus = A.createGain(); musicBus.gain.value = mv(); musicBus.connect(master);
  sfxBus = A.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
  // the echo that makes it sound like the cartridge sound chip
  echoIn = A.createGain(); echoIn.gain.value = 0.32;
  const d = A.createDelay(1); d.delayTime.value = 0.21;
  const fb = A.createGain(); fb.gain.value = 0.36;
  const ef = A.createBiquadFilter(); ef.type = 'lowpass'; ef.frequency.value = 2400;
  echoIn.connect(d); d.connect(ef); ef.connect(fb); fb.connect(d); ef.connect(master);
  for (const duty of [0.125, 0.25, 0.5]) {
    const n = 48, re = new Float32Array(n), im = new Float32Array(n);
    for (let k = 1; k < n; k++) re[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * duty);
    waves[duty] = A.createPeriodicWave(re, im);
  }
  noiseBuf = A.createBuffer(1, A.sampleRate, A.sampleRate);
  const ch = noiseBuf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;
  if (A.state === 'suspended') A.resume();
  if (pending) { const p = pending; pending = null; playMusic(p); }
}
export function setVolumes() { if (!A) return; musicBus.gain.value = mv(); sfxBus.gain.value = vol.sfx; }

const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- voices ----------
function env(g, t, a, peak, dec, sus, end, rel) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.setTargetAtTime(peak * sus, t + a, dec);
  g.gain.setValueAtTime(g.gain.value || peak * sus, end);
  g.gain.cancelScheduledValues(end);
  g.gain.setTargetAtTime(0.0001, end, rel);
}
function voice(inst, m, t, dur, v, out, echo = true) {
  const end = t + dur, f = freq(m);
  const g = A.createGain(); g.connect(out); if (echo) g.connect(echoIn);
  const osc = (type, fr, detune = 0) => { const o = A.createOscillator(); if (waves[type]) o.setPeriodicWave(waves[type]); else o.type = type; o.frequency.value = fr; o.detune.value = detune; return o; };
  let stop = end + 0.6;
  if (inst === 'lead' || inst === 'lead50' || inst === 'thin') {
    const o = osc(inst === 'lead' ? 0.25 : inst === 'thin' ? 0.125 : 0.5, f);
    // delayed vibrato
    if (dur > 0.3) { const l = A.createOscillator(), lg = A.createGain(); l.frequency.value = 5.5; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + Math.min(0.5, dur)); l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(stop); }
    o.connect(g); env(g, t, 0.01, v, 0.25, 0.7, end, 0.05); o.start(t); o.stop(stop);
  } else if (inst === 'pluck') {
    const o = osc(0.25, f); o.connect(g); env(g, t, 0.005, v, 0.12, 0.25, end, 0.04); o.start(t); o.stop(stop);
  } else if (inst === 'bass') {
    const o = osc('triangle', f); o.connect(g); env(g, t, 0.005, v, 0.3, 0.75, end - 0.01, 0.03); o.start(t); o.stop(stop);
  } else if (inst === 'strings') {
    const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; lp.connect(g);
    for (const dt of [-7, 7]) { const o = osc('sawtooth', f, dt); o.connect(lp); o.start(t); o.stop(end + 1.2); }
    env(g, t, Math.min(0.25, dur * 0.4), v * 0.5, 0.5, 0.85, end, 0.25); stop = end + 1.2;
  } else if (inst === 'bell') {
    for (const [r, a] of [[1, 1], [2.76, 0.35], [5.4, 0.12]]) { const o = osc('sine', f * r); const og = A.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + 2); }
    g.gain.setValueAtTime(v, t); g.gain.setTargetAtTime(0.0001, t, 0.45); stop = t + 2;
  } else if (inst === 'organ') {
    for (const [r, a] of [[1, 1], [2, 0.5], [4, 0.2]]) { const o = osc(0.5, f * r); const og = A.createGain(); og.gain.value = a * 0.6; o.connect(og); og.connect(g); o.start(t); o.stop(stop); }
    env(g, t, 0.02, v * 0.6, 0.4, 0.8, end, 0.1);
  }
  return g;
}
function drum(kind, t, v, out) {
  const g = A.createGain(); g.connect(out);
  if (kind === 'k') {
    const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.12);
    o.connect(g); g.gain.setValueAtTime(v * 1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.start(t); o.stop(t + 0.2);
  } else {
    const n = A.createBufferSource(); n.buffer = noiseBuf;
    const f = A.createBiquadFilter();
    if (kind === 's') { f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 0.8; } else { f.type = 'highpass'; f.frequency.value = 7000; }
    n.connect(f); f.connect(g); g.connect(echoIn);
    const len = kind === 's' ? 0.16 : kind === 'H' ? 0.18 : 0.04;
    g.gain.setValueAtTime(v * (kind === 's' ? 1.1 : 0.5), t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.start(t, Math.random() * 0.5); n.stop(t + len + 0.02);
  }
}

// ---------- notation ----------
// "a4:8 c5 e5 -:4 [c4 e4 g4]:1" : note+octave, :length (4 = quarter, dots allowed), - is a rest,
// [..] a chord, k/s/h/H drums. A length carries over to the following notes.
const NOTE = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
function midi(tok) {
  const m = /^([a-g])(#|b)?(\d)$/.exec(tok);
  if (!m) throw new Error('note ' + tok);
  return 12 * (+m[3] + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}
function parse(src) {
  const ev = [];
  let t = 0, len = 1;
  src = src.replace(/\(([^()]*)\)\*(\d+)/g, (_, body, n) => Array(+n).fill(body).join(' '));
  const toks = src.match(/\[[^\]]*\](:\d+\.?)?|\S+/g) || [];
  for (const tok of toks) {
    let body = tok, l = null;
    const c = tok.lastIndexOf(':');
    if (c > 0) { body = tok.slice(0, c); l = tok.slice(c + 1); }
    if (l) { const dot = l.endsWith('.'); len = 4 / parseInt(l, 10) * (dot ? 1.5 : 1); }
    if (body === '-') { t += len; continue; }
    if (body.startsWith('[')) { const notes = body.slice(1, -1).trim().split(/\s+/).map(midi); ev.push({ t, len, notes }); }
    else if ('ksHh'.includes(body) && body.length === 1) ev.push({ t, len, drum: body });
    else ev.push({ t, len, notes: [midi(body)] });
    t += len;
  }
  return { ev, len: t };
}

// ---------- songs ----------
const bars = (s, n) => Array(n).fill(s).join(' ');
export const SONGS = {
  title: { bpm: 84, ch: [
    { inst: 'lead50', v: 0.16, n: 'd5:4. e5:8 f5:4 a5:4 bb5:2 a5:4 g5:4 a5:4. g5:8 f5:4 e5:4 e5:2. -:4 d5:4. e5:8 f5:4 a5:4 bb5:4 d6:4 c6:4 bb5:4 a5:4 g5:4 f5:4 e5:4 c#5:2 e5:2 c5:4 f5:4 a5:4 c6:4 d6:2 c6:4 bb5:4 bb5:4 a5:4 g5:4 f5:4 e5:1 f5:4 a5:4 c6:4 d6:4 e6:2 d6:4 c6:4 c#6:4 d6:4 e6:4 c#6:4 d6:1' },
    { inst: 'bass', v: 0.3, n: 'd3:4 a3 d4 a3 bb2 f3 bb3 f3 c3 g3 c4 g3 a2 e3 a3 e3 d3 a3 d4 a3 bb2 f3 bb3 f3 g2 d3 g3 d3 a2 e3 a3 c#4 f2 c3 f3 c3 bb2 f3 bb3 f3 g2 d3 g3 d3 a2 e3 a3 e3 f2 c3 f3 c3 c3 g3 c4 g3 a2 e3 a3 e3 d3:1' },
    { inst: 'strings', v: 0.11, n: '[d4 f4 a4]:1 [d4 f4 bb4] [c4 e4 g4] [c#4 e4 a4] [d4 f4 a4] [d4 f4 bb4] [d4 g4 bb4] [c#4 e4 a4] [c4 f4 a4] [d4 f4 bb4] [d4 g4 bb4] [c#4 e4 a4] [c4 f4 a4] [c4 e4 g4] [c#4 e4 a4] [d4 f4 a4]' },
    { drums: true, v: 0.18, n: bars('k:4 -:4 -:4 -:8 k:8', 7) + ' k:4 -:4 s:8 s:8 s:8 s:8 ' + bars('k:4 -:4 -:4 -:8 k:8', 7) + ' k:4 s:8 s:8 s:8 s:8 s:4' },
  ] },
  town: { bpm: 112, ch: [
    { inst: 'lead', v: 0.15, n: 'c5:8 f5 a5 c6 a5:4 f5 d5:8 f5 bb5 d6 c6:4 bb5 g5:8 a5 bb5 g5 e5:4 c5 f5:2 -:4 c5:4 a5:8 bb5 c6 a5 f5:4 a5 bb5:4 d6 c6 bb5 a5:8 g5 f5 e5 g5:4 e5 f5:2. -:4 a5:4. g5:8 f5:4 a5:4 bb5:4. a5:8 g5:4 bb5:4 c6:4 bb5:8 a5 g5:4 e5:4 f5:4 a5:4 c6:2 d6:4. c6:8 bb5:4 d6:4 c6:4. bb5:8 a5:4 c6:4 bb5:8 a5 g5 f5 e5:4 g5:4 f5:2. -:4' },
    { inst: 'bass', v: 0.3, n: 'f2:4 c3 f3 c3 bb2 f3 bb3 f3 c3 g3 c4 g3 f2 c3 f3 c3 f2 c3 f3 c3 bb2 f3 bb3 f3 c3 g3 c4 g3 f2 c3 f2:2 d3:4 a3 d4 a3 g2 d3 g3 d3 c3 g3 c4 g3 f2 c3 f3 c3 bb2 f3 bb3 f3 f2 c3 f3 c3 c3 g3 c4 g3 f2:4 c3 f2:2' },
    { inst: 'pluck', v: 0.07, n: '-:4 [a4 c5]:4 -:4 [a4 c5]:4 -:4 [bb4 d5] -:4 [bb4 d5] -:4 [bb4 e5] -:4 [bb4 e5] -:4 [a4 c5] -:4 [a4 c5] -:4 [a4 c5] -:4 [a4 c5] -:4 [bb4 d5] -:4 [bb4 d5] -:4 [bb4 e5] -:4 [g4 c5] -:4 [a4 c5] -:4 [a4 c5] -:4 [a4 d5] -:4 [a4 d5] -:4 [bb4 d5] -:4 [bb4 d5] -:4 [bb4 e5] -:4 [bb4 e5] -:4 [a4 c5] -:4 [a4 c5] -:4 [bb4 d5] -:4 [bb4 d5] -:4 [a4 c5] -:4 [a4 c5] -:4 [bb4 e5] -:4 [bb4 e5] -:4 [a4 c5] -:4 [a4 c5]' },
    { drums: true, v: 0.12, n: bars('k:4 h:4 k:4 h:8 h:8', 16) },
  ] },
  field: { bpm: 126, ch: [
    { inst: 'lead50', v: 0.15, n: 'a5:2 f#5:4. e5:8 d5:4 e5 f#5 a5 b5:2 a5:4. g5:8 f#5:2. -:4 g5:2 f#5:4. e5:8 d5:4 e5 f#5 g5 a5:4 b5 c#6 d6 e6:2. -:4 d6:2 b5:4. a5:8 b5:4 a5 g5 f#5 a5:2 f#5:4 d5:4 e5:2. -:4 f#5:2 g5:4 a5:4 b5:4 a5 g5 f#5 e5:4 f#5 g5 c#5 d5:2. -:4' },
    { inst: 'bass', v: 0.28, n: bars('d3:8 d3 a3 d3 d4 d3 a3 d3', 2) + ' ' + bars('g2:8 g2 d3 g2 g3 g2 d3 g2', 1) + ' ' + bars('d3:8 d3 a3 d3 d4 d3 a3 d3', 1) + ' ' + bars('e3:8 e3 b3 e3 e4 e3 b3 e3', 2) + ' ' + bars('a2:8 a2 e3 a2 a3 a2 e3 a2', 2) + ' ' + bars('g2:8 g2 d3 g2 g3 g2 d3 g2', 2) + ' ' + bars('d3:8 d3 a3 d3 d4 d3 a3 d3', 1) + ' ' + bars('a2:8 a2 e3 a2 a3 a2 e3 a2', 1) + ' ' + bars('b2:8 b2 f#3 b2 b3 b2 f#3 b2', 1) + ' ' + bars('g2:8 g2 d3 g2 g3 g2 d3 g2', 1) + ' ' + bars('a2:8 a2 e3 a2 a3 a2 e3 a2', 1) + ' ' + bars('d3:8 d3 a3 d3 d4 d3 a3 d3', 1) },
    { inst: 'pluck', v: 0.06, n: bars('d4:8 f#4 a4 d5 a4 f#4 d4 f#4', 2) + ' g4:8 b4 d5 g5 d5 b4 g4 b4 d4:8 f#4 a4 d5 a4 f#4 d4 f#4 ' + bars('e4:8 g4 b4 e5 b4 g4 e4 g4', 2) + ' ' + bars('e4:8 a4 c#5 e5 c#5 a4 e4 a4', 2) + ' ' + bars('d4:8 g4 b4 d5 b4 g4 d4 g4', 2) + ' d4:8 f#4 a4 d5 a4 f#4 d4 f#4 e4:8 a4 c#5 e5 c#5 a4 e4 a4 d4:8 f#4 b4 d5 b4 f#4 d4 f#4 d4:8 g4 b4 d5 b4 g4 d4 g4 e4:8 a4 c#5 e5 c#5 a4 e4 a4 d4:8 f#4 a4 d5 a4 f#4 d4 f#4' },
    { drums: true, v: 0.13, n: bars('k:4 s:4 k:8 k:8 s:4', 15) + ' k:8 s:8 s:8 s:8 s:8 s:8 s:4' },
  ] },
  cave: { bpm: 92, ch: [
    { inst: 'thin', v: 0.08, n: '(a3:8 e4 a4 c5 e5 c5 a4 e4 f3 c4 f4 a4 c5 a4 f4 c4 g3 d4 g4 b4 d5 b4 g4 d4 e3 b3 e4 g#4 b4 g#4 e4 b3 a3 e4 a4 c5 e5 c5 a4 e4 d3 a3 d4 f4 a4 f4 d4 a3 a3 e4 a4 c5 e5 c5 a4 e4 e3 b3 e4 g#4 b4 g#4 e4 b3)*2' },
    { inst: 'strings', v: 0.12, n: '-:1 -:1 -:1 -:1 -:1 -:1 -:1 -:1 e5:2. d5:4 c5:1 b4:2. c5:4 g#4:1 a4:2 e5:2 f5:2. e5:4 e5:2 c5:2 b4:1' },
    { inst: 'bass', v: 0.3, n: '(a2:1 f2 g2 e2 a2 d2 a2 e2)*2' },
  ] },
  tower: { bpm: 104, ch: [
    { inst: 'lead', v: 0.13, n: '-:1 -:1 -:1 -:1 b5:4. a5:8 g5:4 f#5:4 e5:2 g5:2 a5:4. g5:8 f#5:4 e5:4 d#5:1 e5:4 g5:4 b5:4 e6:4 c6:2. b5:4 a5:4 c6:4 b5:4 a5:4 b5:1' },
    { inst: 'bass', v: 0.3, n: '(' + bars('e2:8 e3', 4) + ' ' + bars('c2:8 c3', 4) + ' ' + bars('a1:8 a2', 4) + ' ' + bars('b1:8 b2', 4) + ')*3' },
    { inst: 'strings', v: 0.11, n: '([e4 g4 b4]:1 [c4 e4 g4] [a3 c4 e4] [b3 d#4 f#4])*3' },
    { drums: true, v: 0.1, n: bars('k:4 h:8 h:8 s:4 h:8 k:8', 12) },
  ] },
  battle: { bpm: 152, ch: [
    { inst: 'lead50', v: 0.14, n: 'a5:4 e5:8 a5:8 -:8 a5:8 b5:8 c6:8 b5:4 g5:8 e5:8 -:4 d5:4 c5:4. d5:8 e5:4 f5:4 g5:4. f5:8 e5:4 d5:4 e5:8 a5:8 -:8 a5:8 b5:8 c6:8 b5:8 a5:8 g5:4 e5:4 -:4 e5:4 f5:4 a5:4 c6:4 a5:4 g#5:2 b5:2 d6:4. c6:8 a5:4 f5:4 e5:4. f5:8 e5:4 c5:4 d5:4 f5:4 a5:4 d6:4 b5:2. g#5:4 c6:4. b5:8 a5:4 f5:4 g5:4. f5:8 g5:4 b5:4 a5:4 e5:4 a5:4 c6:4 b5:2 e6:2' },
    { inst: 'bass', v: 0.3, n: bars('a2:8 a2 a3 a2', 4) + ' ' + bars('f2:8 f2 f3 f2', 2) + ' ' + bars('g2:8 g2 g3 g2', 2) + ' ' + bars('a2:8 a2 a3 a2', 4) + ' ' + bars('f2:8 f2 f3 f2', 2) + ' ' + bars('e2:8 e2 e3 e2', 2) + ' ' + bars('d3:8 d3 d4 d3', 2) + ' ' + bars('a2:8 a2 a3 a2', 2) + ' ' + bars('d3:8 d3 d4 d3', 2) + ' ' + bars('e2:8 e2 e3 e2', 2) + ' ' + bars('f2:8 f2 f3 f2', 2) + ' ' + bars('g2:8 g2 g3 g2', 2) + ' ' + bars('a2:8 a2 a3 a2', 2) + ' ' + bars('e2:8 e2 e3 e2', 2) },
    { inst: 'pluck', v: 0.06, n: bars('-:8 [c5 e5]:8 -:8 [c5 e5]:8', 4) + ' ' + bars('-:8 [c5 f5]:8 -:8 [c5 f5]:8', 2) + ' ' + bars('-:8 [b4 d5]:8 -:8 [b4 d5]:8', 2) + ' ' + bars('-:8 [c5 e5]:8 -:8 [c5 e5]:8', 4) + ' ' + bars('-:8 [c5 f5]:8 -:8 [c5 f5]:8', 2) + ' ' + bars('-:8 [b4 e5]:8 -:8 [b4 e5]:8', 2) + ' ' + bars('-:8 [d5 f5]:8 -:8 [d5 f5]:8', 2) + ' ' + bars('-:8 [c5 e5]:8 -:8 [c5 e5]:8', 2) + ' ' + bars('-:8 [d5 f5]:8 -:8 [d5 f5]:8', 2) + ' ' + bars('-:8 [b4 e5]:8 -:8 [b4 e5]:8', 2) + ' ' + bars('-:8 [c5 f5]:8 -:8 [c5 f5]:8', 2) + ' ' + bars('-:8 [b4 d5]:8 -:8 [b4 d5]:8', 2) + ' ' + bars('-:8 [c5 e5]:8 -:8 [c5 e5]:8', 2) + ' ' + bars('-:8 [b4 e5]:8 -:8 [b4 e5]:8', 2) },
    { drums: true, v: 0.15, n: bars('k:8 h:8 s:8 h:8 k:8 k:8 s:8 h:8', 15) + ' s:8 s:8 s:8 s:8 s:8 s:8 s:8 s:8' },
  ] },
  boss: { bpm: 160, ch: [
    { inst: 'lead50', v: 0.14, n: 'g5:8 g5 -:8 g5 ab5:8 g5 f5 eb5 f5:4 eb5:4 d5:4 eb5:4 c5:8 c5 eb5 ab5 c6:4 ab5:4 bb5:2 d6:2 g5:8 g5 -:8 g5 c6:8 bb5 ab5 g5 f5:4 g5:4 ab5:4 bb5:4 db6:4. c6:8 bb5:4 ab5:4 g5:2 b5:2' },
    { inst: 'bass', v: 0.32, n: bars('c2:8 c3', 8) + ' ' + bars('ab1:8 ab2', 4) + ' ' + bars('bb1:8 bb2', 4) + ' ' + bars('c2:8 c3', 8) + ' ' + bars('db2:8 db3', 4) + ' ' + bars('g1:8 g2', 4) },
    { inst: 'strings', v: 0.12, n: '[c4 eb4 g4]:1 [c4 eb4 g4] [c4 eb4 ab4] [d4 f4 bb4] [c4 eb4 g4] [c4 eb4 g4] [db4 f4 ab4] [d4 g4 b4]' },
    { drums: true, v: 0.16, n: bars('k:8 k:8 s:8 k:8 k:8 h:8 s:8 h:8', 7) + ' s:16 s s s s:8 s s s s:4' },
  ] },
  final: { bpm: 168, ch: [
    { inst: 'lead50', v: 0.14, n: 'f5:8 c6:8 -:8 c6:8 db6:8 c6:8 bb5:8 ab5:8 g5:4 c6:4 -:4 e5:4 f5:8 ab5:8 c6:8 f6:8 eb6:4 db6:4 c6:2 -:2 db6:4. c6:8 bb5:4 ab5:4 g5:4 bb5:4 db6:4 e5:4 f5:2 ab5:2 g5:1' },
    { inst: 'bass', v: 0.32, n: bars('f2:8 f3', 8) + ' ' + bars('db2:8 db3', 4) + ' ' + bars('c2:8 c3', 4) + ' ' + bars('bb1:8 bb2', 4) + ' ' + bars('c2:8 c3', 4) + ' ' + bars('f2:8 f3', 4) + ' ' + bars('c2:8 c3', 4) },
    { inst: 'organ', v: 0.1, n: '[f4 ab4 c5]:1 [f4 ab4 c5] [f4 ab4 db5] [e4 g4 c5] [f4 bb4 db5] [e4 g4 c5] [f4 ab4 c5] [e4 g4 bb4]' },
    { drums: true, v: 0.16, n: bars('k:8 h:8 s:8 k:8 k:8 k:8 s:8 h:8', 7) + ' s:8 s s s s:16 s s s s s s s' },
  ] },
  victory: { bpm: 140, once: true, ch: [
    { inst: 'lead50', v: 0.15, n: 'g4:8 c5:8 e5:8 g5:4 e5:8 g5:4. a5:8 g5:8 f5:8 e5:8 d5:8 e5:8 c5:2' },
    { inst: 'bass', v: 0.28, n: 'c3:8 c3 c3 c3:4 c3:8 e3:4. f3:4 g3:4 g2:4 c3:2' },
    { inst: 'pluck', v: 0.07, n: '[e4 g4]:8 [e4 g4] [e4 g4] [e4 g4]:4 [e4 g4]:8 [e4 g4]:4. [f4 a4]:4 [f4 b4]:4 [f4 b4]:4 [e4 g4]:2' },
  ] },
  inn: { bpm: 100, once: true, ch: [
    { inst: 'bell', v: 0.2, n: 'f5:8 a5 c6 f6:4 e6:8 c6:8 f6:2' },
    { inst: 'bass', v: 0.25, n: 'f3:2 c3:4 f2:2' },
  ] },
  gameover: { bpm: 70, once: true, ch: [
    { inst: 'strings', v: 0.16, n: 'a4:2 f4:2 e4:2 c#4:2 d4:1' },
    { inst: 'bass', v: 0.25, n: 'd3:1 a2:1 d2:1' },
  ] },
  ending: { bpm: 72, ch: [
    { inst: 'bell', v: 0.16, n: 'd5:4. e5:8 f5:4 a5:4 bb5:2 a5:4 g5:4 a5:4. g5:8 f5:4 e5:4 e5:2. -:4 d5:4. e5:8 f5:4 a5:4 bb5:4 d6:4 c6:4 bb5:4 a5:4 g5:4 f5:4 e5:4 c#5:2 e5:2 c5:4 f5:4 a5:4 c6:4 d6:2 c6:4 bb5:4 bb5:4 a5:4 g5:4 f5:4 e5:1 f5:4 a5:4 c6:4 d6:4 e6:2 d6:4 c6:4 c#6:4 d6:4 e6:4 c#6:4 d6:1' },
    { inst: 'strings', v: 0.12, n: '[d4 f4 a4]:1 [d4 f4 bb4] [c4 e4 g4] [c#4 e4 a4] [d4 f4 a4] [d4 f4 bb4] [d4 g4 bb4] [c#4 e4 a4] [c4 f4 a4] [d4 f4 bb4] [d4 g4 bb4] [c#4 e4 a4] [c4 f4 a4] [c4 e4 g4] [c#4 e4 a4] [d4 f4 a4]' },
    { inst: 'bass', v: 0.26, n: 'd3:2 a2 bb2 f2 c3 g2 a2 e2 d3 a2 bb2 f2 g2 d3 a2 e2 f2 c3 bb2 f2 g2 d3 a2 e2 f2 c3 c3 g2 a2 e2 d3:1' },
  ] },
};
const compiled = {};
function compile(name) {
  if (compiled[name]) return compiled[name];
  const s = SONGS[name], chs = s.ch.map((c) => ({ ...c, ...parse(c.n) }));
  const len = Math.max(...chs.map((c) => c.len));
  return (compiled[name] = { bpm: s.bpm, once: s.once, chs, len });
}
export const songLengths = () => Object.fromEntries(Object.keys(SONGS).map((k) => [k, compile(k).chs.map((c) => c.len)]));

// ---------- sequencer ----------
let cur = null, timer = null, pending = null;
export let currentSong = null;
export function playMusic(name, { restart = false } = {}) {
  if (!A) { pending = name; return; }
  if (currentSong === name && !restart && cur) return;
  stopMusic();
  currentSong = name;
  if (!name) return;
  const song = compile(name), spb = 60 / song.bpm;
  const g = A.createGain(); g.gain.value = 1; g.connect(musicBus);
  cur = { song, spb, g, start: A.currentTime + 0.08, idx: song.chs.map(() => 0), loop: 0 };
  timer = setInterval(tick, 25);
  tick();
}
export function stopMusic(fade = 0) {
  if (timer) clearInterval(timer);
  timer = null;
  if (cur) {
    const g = cur.g;
    if (fade && A) { g.gain.setTargetAtTime(0.0001, A.currentTime, fade / 3); setTimeout(() => g.disconnect(), fade * 1000 + 200); } else g.disconnect();
  }
  cur = null; currentSong = null;
}
function tick() {
  if (!cur) return;
  const { song, spb, g } = cur, horizon = A.currentTime + 0.2;
  for (;;) {
    let any = false;
    song.chs.forEach((c, i) => {
      while (cur.idx[i] < c.ev.length) {
        const e = c.ev[cur.idx[i]], t = cur.start + (cur.loop * song.len + e.t) * spb;
        if (t > horizon) break;
        cur.idx[i]++; any = true;
        if (t < A.currentTime - 0.05) continue;
        if (e.drum) drum(e.drum, t, c.v, g);
        else for (const m of e.notes) voice(c.inst, m, t, e.len * spb * 0.92, c.v, g);
      }
    });
    const doneAll = song.chs.every((c, i) => cur.idx[i] >= c.ev.length);
    if (doneAll) {
      if (song.once) { clearInterval(timer); timer = null; return; }
      if (cur.start + (cur.loop + 1) * song.len * spb > horizon + 0.5) break;
      cur.loop++; cur.idx = song.chs.map(() => 0);
      continue;
    }
    if (!any) break;
  }
}

// ---------- sound effects ----------
function blip(seq, inst = 'lead50', v = 0.18, step = 0.05, echo = false) {
  if (!A) return;
  let t = A.currentTime + 0.01;
  for (const m of seq) { if (m) voice(inst, m, t, step * 0.9, v, sfxBus, echo); t += step; }
}
function noise(t0, len, f0, f1, v = 0.3, type = 'bandpass') {
  const n = A.createBufferSource(); n.buffer = noiseBuf;
  const f = A.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + len); f.Q.value = 1.2;
  const g = A.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  n.connect(f); f.connect(g); g.connect(sfxBus); n.start(t0, Math.random() * 0.4); n.stop(t0 + len + 0.05);
}
function sweep(t0, len, f0, f1, type = 'square', v = 0.15) {
  const o = A.createOscillator(); if (waves[type]) o.setPeriodicWave(waves[type]); else o.type = type;
  o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + len);
  const g = A.createGain(); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + len);
  o.connect(g); g.connect(sfxBus); g.connect(echoIn); o.start(t0); o.stop(t0 + len + 0.05);
}
export function sfx(name) {
  if (!A) return;
  const t = A.currentTime + 0.01;
  switch (name) {
    case 'cursor': blip([88], 'thin', 0.1, 0.03); break;
    case 'ok': blip([84, 91], 'lead50', 0.12, 0.04); break;
    case 'cancel': blip([79, 72], 'lead50', 0.1, 0.04); break;
    case 'buzz': blip([50, 50], 'lead50', 0.12, 0.08); break;
    case 'text': blip([96], 'thin', 0.03, 0.015); break;
    case 'hit': noise(t, 0.12, 2500, 300, 0.45); sweep(t, 0.08, 300, 80, 0.5, 0.18); break;
    case 'crit': noise(t, 0.2, 4000, 200, 0.55); sweep(t, 0.15, 600, 60, 0.5, 0.2); break;
    case 'slash': noise(t, 0.1, 6000, 1200, 0.3, 'highpass'); break;
    case 'miss': sweep(t, 0.12, 900, 1600, 0.125, 0.08); break;
    case 'hurt': noise(t, 0.18, 1200, 150, 0.5); sweep(t, 0.15, 220, 60, 'triangle', 0.3); break;
    case 'fire': noise(t, 0.5, 800, 200, 0.45, 'lowpass'); sweep(t, 0.4, 200, 60, 'sawtooth', 0.1); break;
    case 'ice': for (let i = 0; i < 5; i++) blip([96 + i * 2], 'bell', 0.08, 0.04); noise(t, 0.3, 8000, 3000, 0.2, 'highpass'); break;
    case 'bolt': noise(t, 0.35, 3000, 400, 0.6); sweep(t, 0.3, 1400, 90, 0.125, 0.18); break;
    case 'holy': blip([84, 88, 91, 96, 100], 'bell', 0.1, 0.05, true); break;
    case 'heal': blip([79, 84, 88, 91, 96], 'bell', 0.1, 0.06, true); break;
    case 'buff': blip([72, 76, 79, 84], 'lead', 0.08, 0.05, true); break;
    case 'sleep': blip([84, 79, 76, 72], 'bell', 0.08, 0.12, true); break;
    case 'bubble': for (let i = 0; i < 6; i++) sweep(t + i * 0.05, 0.06, 300 + i * 60, 900 + i * 80, 'sine', 0.12); break;
    case 'abyss': sweep(t, 1.0, 400, 40, 'sawtooth', 0.2); noise(t, 1.0, 600, 60, 0.4, 'lowpass'); break;
    case 'spore': noise(t, 0.4, 2000, 600, 0.2); break;
    case 'drain': sweep(t, 0.4, 900, 200, 0.25, 0.12); break;
    case 'die': noise(t, 0.45, 1600, 100, 0.4); sweep(t, 0.4, 500, 50, 0.5, 0.12); break;
    case 'boom': noise(t, 0.9, 1200, 40, 0.7, 'lowpass'); sweep(t, 0.7, 120, 30, 'triangle', 0.4); break;
    case 'encounter': sweep(t, 0.35, 200, 1600, 0.25, 0.14); sweep(t + 0.1, 0.35, 300, 2400, 0.5, 0.1); noise(t, 0.4, 500, 4000, 0.2); break;
    case 'run': sweep(t, 0.3, 800, 200, 0.25, 0.12); break;
    case 'door': noise(t, 0.12, 600, 200, 0.3); blip([60, 55], 'bass', 0.25, 0.06); break;
    case 'stairs': for (let i = 0; i < 4; i++) noise(t + i * 0.08, 0.06, 900, 300, 0.25); break;
    case 'chest': blip([72, 76, 79, 84, 0, 91], 'lead50', 0.12, 0.06, true); break;
    case 'push': noise(t, 0.2, 400, 120, 0.4, 'lowpass'); break;
    case 'switch': blip([67, 79], 'lead', 0.12, 0.05); break;
    case 'gate': for (let i = 0; i < 3; i++) noise(t + i * 0.1, 0.1, 700, 200, 0.35); blip([60, 67, 72], 'bass', 0.25, 0.1); break;
    case 'level': blip([72, 76, 79, 84, 79, 84, 88, 91], 'lead50', 0.12, 0.07, true); break;
    case 'save': blip([84, 88, 91, 96, 91, 96], 'bell', 0.12, 0.08, true); break;
    case 'step': noise(t, 0.03, 800, 400, 0.05); break;
    case 'bump': sweep(t, 0.06, 140, 80, 'triangle', 0.25); break;
    case 'slide': noise(t, 0.15, 3000, 6000, 0.08, 'highpass'); break;
    case 'warp': sweep(t, 0.6, 200, 2000, 0.125, 0.12); sweep(t + 0.15, 0.5, 300, 3000, 0.25, 0.08); break;
    case 'quake': noise(t, 0.8, 300, 40, 0.8, 'lowpass'); sweep(t, 0.6, 80, 30, 'triangle', 0.5); break;
    case 'special': sweep(t, 0.3, 300, 1800, 0.5, 0.15); blip([84, 91, 96, 103], 'lead50', 0.1, 0.05, true); break;
  }
}

// the music switch: the button, the M key and the saved choice
const MKEY = 'spire-tide-music';
try { music.on = localStorage.getItem(MKEY) !== 'off'; } catch (e) { /* private mode */ }
export function setMusic(on) {
  music.on = on; setVolumes();
  try { localStorage.setItem(MKEY, on ? 'on' : 'off'); } catch (e) { /* private mode */ }
  const b = document.getElementById('musicBtn'); if (b) b.classList.toggle('off', !on);
}
if (typeof document !== 'undefined') {
  const b = document.getElementById('musicBtn');
  if (b) { b.classList.toggle('off', !music.on); b.addEventListener('click', (e) => { e.stopPropagation(); initAudio(); setMusic(!music.on); }); }
  addEventListener('keydown', (e) => { if (e.code === 'KeyM' && !e.repeat) setMusic(!music.on); });
}
