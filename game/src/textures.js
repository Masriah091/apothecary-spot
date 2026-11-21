// textures.js — every surface in the apothecary is painted on a canvas
// when the shop is built: floor planks, plaster, bottle labels with their
// runes, wax seals, the moon, the night sky, mushroom spots, the rug.
//
// Labels and seals exist in pairs: the honest painting and the meddled
// one. A difference swaps one canvas for the other on the same material,
// which is why the change hides in a working detail instead of moving
// furniture around.

const THREE = window.THREE;

// A small seeded random, so the stars and spots land in the same places
// on every build and the two panels never disagree by accident.
export function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasOf(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(canvas, repeat) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  return tex;
}

function css(hex) {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

// ——— Wood and plaster ———

export function woodTexture(baseHex, darkHex, planks = 6) {
  const [c, g] = canvasOf(256, 256);
  g.fillStyle = css(baseHex); g.fillRect(0, 0, 256, 256);
  const plankH = 256 / planks;
  const rnd = mulberry(41);
  for (let p = 0; p < planks; p++) {
    const y = p * plankH;
    g.fillStyle = `rgba(0,0,0,${0.04 + rnd() * 0.07})`;
    g.fillRect(0, y, 256, plankH);
    g.strokeStyle = css(darkHex); g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke();
    // grain: a few wandering darker strokes per plank
    for (let i = 0; i < 5; i++) {
      g.strokeStyle = `rgba(30,18,6,${0.10 + rnd() * 0.12})`;
      g.lineWidth = 1;
      g.beginPath();
      let gy = y + 4 + rnd() * (plankH - 8);
      g.moveTo(0, gy);
      for (let x = 0; x <= 256; x += 32) g.lineTo(x, gy + Math.sin(x * 0.05 + p) * 1.6);
      g.stroke();
    }
    // a knot now and then
    if (rnd() > 0.55) {
      const kx = 30 + rnd() * 196, ky = y + plankH / 2;
      g.strokeStyle = 'rgba(25,14,4,0.5)';
      for (let r = 2; r < 8; r += 2) { g.beginPath(); g.arc(kx, ky, r, 0, Math.PI * 2); g.stroke(); }
    }
  }
  return toTexture(c, [1, 1]);
}

export function plasterTexture(tintHex) {
  const [c, g] = canvasOf(256, 256);
  g.fillStyle = css(tintHex); g.fillRect(0, 0, 256, 256);
  const rnd = mulberry(97);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${rnd() > 0.5 ? '255,250,230' : '10,16,8'},${0.03 + rnd() * 0.05})`;
    g.fillRect(rnd() * 256, rnd() * 256, 2.2, 2.2);
  }
  for (let i = 0; i < 7; i++) { // faint cracks and stains
    g.strokeStyle = 'rgba(20,26,14,0.10)';
    g.lineWidth = 1;
    g.beginPath();
    let x = rnd() * 256, y = rnd() * 200;
    g.moveTo(x, y);
    for (let s = 0; s < 5; s++) { x += (rnd() - 0.5) * 26; y += rnd() * 22; g.lineTo(x, y); }
    g.stroke();
  }
  return toTexture(c, [2, 1]);
}

// ——— Runes, drawn as strokes so no font is needed ———
// Each glyph is a list of strokes in a unit box, in the old angular hand.

const RUNES = [
  [[0.35, 0.05, 0.35, 0.95], [0.35, 0.25, 0.8, 0.05], [0.35, 0.5, 0.8, 0.3]],            // fehu
  [[0.3, 0.95, 0.3, 0.05], [0.3, 0.05, 0.72, 0.35], [0.72, 0.35, 0.72, 0.95]],          // uruz
  [[0.35, 0.05, 0.35, 0.95], [0.35, 0.3, 0.75, 0.5], [0.75, 0.5, 0.35, 0.72]],          // thurisaz
  [[0.35, 0.05, 0.35, 0.95], [0.35, 0.22, 0.8, 0.42], [0.35, 0.45, 0.8, 0.65]],         // ansuz
  [[0.35, 0.05, 0.35, 0.95], [0.35, 0.05, 0.72, 0.2], [0.72, 0.2, 0.35, 0.45], [0.35, 0.45, 0.75, 0.95]], // raidho
  [[0.72, 0.08, 0.3, 0.5], [0.3, 0.5, 0.72, 0.92]],                                     // kenaz
  [[0.28, 0.05, 0.28, 0.95], [0.72, 0.05, 0.72, 0.95], [0.28, 0.5, 0.72, 0.5]],         // hagalaz
  [[0.5, 0.05, 0.5, 0.95]],                                                             // isa
  [[0.68, 0.05, 0.32, 0.42], [0.32, 0.42, 0.68, 0.6], [0.68, 0.6, 0.32, 0.95]],         // sol
  [[0.5, 0.95, 0.5, 0.05], [0.5, 0.05, 0.24, 0.32], [0.5, 0.05, 0.76, 0.32]],          // tiwaz
  [[0.5, 0.95, 0.5, 0.4], [0.5, 0.4, 0.22, 0.08], [0.5, 0.4, 0.78, 0.08]],             // algiz
  [[0.32, 0.05, 0.32, 0.95], [0.32, 0.28, 0.74, 0.05]],                                // laguz
];

export function drawRune(g, index, x, y, size, color) {
  const glyph = RUNES[index % RUNES.length];
  g.strokeStyle = color;
  g.lineWidth = Math.max(2, size * 0.11);
  g.lineCap = 'round';
  g.beginPath();
  for (const [x1, y1, x2, y2] of glyph) {
    g.moveTo(x + x1 * size, y + y1 * size);
    g.lineTo(x + x2 * size, y + y2 * size);
  }
  g.stroke();
}

// A bottle's paper label: border, one rune, and the wavy lines of a hand
// that wrote the contents in a script nobody reads any more.
export function labelTexture(runeIndex, tintHex = 0xe9d9ae) {
  const [c, g] = canvasOf(128, 160);
  g.fillStyle = css(tintHex); g.fillRect(0, 0, 128, 160);
  const rnd = mulberry(runeIndex * 7 + 3);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(120,90,40,${0.04 + rnd() * 0.05})`;
    g.fillRect(rnd() * 128, rnd() * 160, 2, 2);
  }
  g.strokeStyle = '#7c5a1d'; g.lineWidth = 3;
  g.strokeRect(7, 7, 114, 146);
  g.lineWidth = 1;
  g.strokeRect(12, 12, 104, 136);
  drawRune(g, runeIndex, 39, 26, 50, '#5e2f16');
  g.strokeStyle = 'rgba(70,48,20,0.75)';
  g.lineWidth = 2;
  for (let row = 0; row < 3; row++) {
    const y = 104 + row * 15;
    g.beginPath();
    g.moveTo(26, y);
    for (let x = 26; x <= 102; x += 8) g.lineTo(x, y + Math.sin(x * 0.4 + row * 2) * 1.8);
    g.stroke();
  }
  return toTexture(c);
}

// The wax seal at a scroll's end: a stamped disc, its letter the only
// honest thing about it.
export function sealTexture(letter, waxHex) {
  const [c, g] = canvasOf(128, 128);
  g.clearRect(0, 0, 128, 128);
  const grad = g.createRadialGradient(56, 52, 8, 64, 64, 58);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, css(waxHex));
  grad.addColorStop(1, css(waxHex));
  g.fillStyle = css(waxHex);
  g.beginPath();
  // a blobby, hand-poured edge
  const rnd = mulberry(letter.charCodeAt(0));
  for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.35) {
    const r = 52 + (rnd() - 0.5) * 9;
    const x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r;
    if (a === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath(); g.fill();
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = grad; g.fill();
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = 'rgba(255,235,200,0.5)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(64, 64, 40, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,240,210,0.9)';
  g.font = 'bold 52px Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(letter, 64, 68);
  const tex = toTexture(c);
  return tex;
}

// A tiny rune stamped on the parchment end-cap of a scroll.
export function scrollEndTexture(runeIndex) {
  const [c, g] = canvasOf(96, 96);
  g.fillStyle = '#e2d0a0'; g.fillRect(0, 0, 96, 96);
  g.strokeStyle = 'rgba(110,80,35,0.6)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(48, 48, 40, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(48, 48, 33, 0, Math.PI * 2); g.stroke();
  drawRune(g, runeIndex, 30, 26, 38, '#6e4520');
  return toTexture(c);
}

// ——— The window's sky and moon ———

export function skyTexture(skyHex, lowHex, seed, withBrightStar) {
  const [c, g] = canvasOf(512, 512);
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, css(skyHex));
  grad.addColorStop(1, css(lowHex));
  g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
  const rnd = mulberry(seed);
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 512, y = rnd() * 512;
    const r = rnd() * 1.5 + 0.4;
    g.fillStyle = `rgba(255,252,240,${0.35 + rnd() * 0.6})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  if (withBrightStar) {
    // the one star bright enough to notice missing: high, left of the moon
    const x = 150, y = 128;
    g.fillStyle = 'rgba(255,255,246,1)';
    g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,240,0.85)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x - 11, y); g.lineTo(x + 11, y);
    g.moveTo(x, y - 11); g.lineTo(x, y + 11);
    g.stroke();
  }
  return toTexture(c);
}

// The moon as a transparent painting: full, or bitten to a crescent.
export function moonTexture(kind, moonHex) {
  const [c, g] = canvasOf(256, 256);
  g.clearRect(0, 0, 256, 256);
  const grad = g.createRadialGradient(108, 104, 20, 128, 128, 112);
  grad.addColorStop(0, '#fffdf4');
  grad.addColorStop(0.75, css(moonHex));
  grad.addColorStop(1, css(moonHex));
  g.fillStyle = grad;
  g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.fill();
  // craters
  const rnd = mulberry(7);
  g.fillStyle = 'rgba(160,150,120,0.20)';
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    g.arc(50 + rnd() * 150, 50 + rnd() * 150, 5 + rnd() * 15, 0, Math.PI * 2);
    g.fill();
  }
  if (kind === 'crescent') {
    g.globalCompositeOperation = 'destination-out';
    g.beginPath(); g.arc(178, 108, 88, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over';
  }
  return toTexture(c);
}

// A soft round glow, for candle halos and the moon's halo ring.
export function glowTexture() {
  const [c, g] = canvasOf(128, 128);
  const grad = g.createRadialGradient(64, 64, 2, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.32)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  return toTexture(c);
}

// Steam: a wisp of soft blobs climbing and thinning.
export function steamTexture() {
  const [c, g] = canvasOf(128, 256);
  const rnd = mulberry(23);
  for (let i = 0; i < 26; i++) {
    const y = 246 - i * 9.4;
    const x = 64 + Math.sin(i * 0.55) * 16 + (rnd() - 0.5) * 10;
    const r = 12 + i * 1.15;
    const grad = g.createRadialGradient(x, y, 1, x, y, r);
    grad.addColorStop(0, `rgba(255,255,255,${0.16 - i * 0.004})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  return toTexture(c);
}

// ——— Small goods ———

export function mushroomTexture(spotCount, spotHex) {
  const [c, g] = canvasOf(128, 128);
  g.fillStyle = '#8a3b2a'; g.fillRect(0, 0, 128, 128);
  const rnd = mulberry(spotCount * 13 + 5);
  g.fillStyle = 'rgba(0,0,0,0.12)';
  for (let i = 0; i < 200; i++) g.fillRect(rnd() * 128, rnd() * 128, 2, 2);
  g.fillStyle = css(spotHex);
  for (let i = 0; i < spotCount; i++) {
    g.beginPath();
    g.arc(16 + rnd() * 96, 16 + rnd() * 96, 4 + rnd() * 6, 0, Math.PI * 2);
    g.fill();
  }
  return toTexture(c);
}

export function rugTexture(redHex, goldHex) {
  const [c, g] = canvasOf(256, 340);
  g.fillStyle = css(redHex); g.fillRect(0, 0, 256, 340);
  g.strokeStyle = css(goldHex); g.lineWidth = 5;
  g.strokeRect(14, 14, 228, 312);
  g.lineWidth = 2;
  g.strokeRect(28, 28, 200, 284);
  g.save();
  g.translate(128, 170);
  g.rotate(Math.PI / 4);
  g.lineWidth = 3;
  g.strokeRect(-52, -52, 104, 104);
  g.strokeRect(-30, -30, 60, 60);
  g.restore();
  g.fillStyle = css(goldHex);
  for (const [x, y] of [[128, 52], [128, 288], [52, 170], [204, 170]]) {
    g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
  }
  const rnd = mulberry(3);
  g.fillStyle = 'rgba(0,0,0,0.10)';
  for (let i = 0; i < 500; i++) g.fillRect(rnd() * 256, rnd() * 340, 2, 2);
  return toTexture(c);
}

// The framed herbal chart on the wall: a plant, drawn in ink, with ruled
// lines of cramped writing under it.
export function chartTexture(parchmentHex) {
  const [c, g] = canvasOf(256, 320);
  g.fillStyle = css(parchmentHex); g.fillRect(0, 0, 256, 320);
  g.strokeStyle = '#6e5226'; g.lineWidth = 3;
  g.strokeRect(10, 10, 236, 300);
  g.strokeStyle = '#4a5a34'; g.lineWidth = 3;
  g.beginPath(); // the plant: stem, leaves, bell flowers
  g.moveTo(128, 250); g.quadraticCurveTo(122, 170, 130, 84);
  g.stroke();
  g.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const y = 220 - i * 30, side = i % 2 ? 1 : -1;
    g.beginPath();
    g.moveTo(128, y);
    g.quadraticCurveTo(128 + side * 30, y - 12, 128 + side * 46, y - 26);
    g.stroke();
    g.beginPath();
    g.ellipse(128 + side * 46, y - 28, 9, 13, side * 0.6, 0, Math.PI * 2);
    g.stroke();
  }
  g.strokeStyle = 'rgba(70,48,20,0.8)';
  g.lineWidth = 2;
  for (let row = 0; row < 3; row++) {
    const y = 272 + row * 14;
    g.beginPath(); g.moveTo(52, y); g.lineTo(204, y); g.stroke();
  }
  return toTexture(c);
}
