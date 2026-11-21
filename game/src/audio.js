// audio.js — the apothecary's small sounds, synthesised with WebAudio:
// a bell-like chime when a difference is found, a dull thud for a
// misclick, a shimmer for a hint, the clock's tick in the last seconds.
// No audio files; the shop is quiet until the player first touches it.

let ctx = null;
let muted = false;

export function unlockAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = value;
}

function tone(freq, at, dur, type = 'sine', gain = 0.16, slideTo = null) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playClick() {
  tone(660, 0, 0.07, 'triangle', 0.08);
}

export function playFind() {
  // a little two-note bell: the sound of a thing recognised
  tone(1318, 0, 0.34, 'sine', 0.14);
  tone(1760, 0.07, 0.42, 'sine', 0.12);
  tone(2637, 0.07, 0.2, 'sine', 0.04);
}

export function playMiss() {
  tone(196, 0, 0.16, 'square', 0.05, 130);
}

export function playHint() {
  tone(1046, 0, 0.2, 'sine', 0.07);
  tone(1244, 0.06, 0.2, 'sine', 0.06);
  tone(1568, 0.12, 0.26, 'sine', 0.06);
}

export function playTick() {
  tone(880, 0, 0.04, 'square', 0.03);
}

export function playRoundClear() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.3, 'triangle', 0.1));
}

export function playGameOver() {
  [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.09));
}

export function playNightClear() {
  [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => tone(f, i * 0.1, 0.4, 'sine', 0.09));
}
