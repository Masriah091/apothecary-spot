// counter-craft.js — the working heart of the shop, on and above the
// counter: the cauldron and its steam, the mortar, the three-candle
// candelabrum, the sealed scrolls, the balance with its weights and dial,
// the open book, the cat, and the herb bundles hanging from the beam.
//
// Eighteen of the catalogue's differences live here — the brew's colour
// and sheen, flames out and leaning, a seal's wax and letter, a pestle's
// lean, a bell, a pair of eyes, a paw, a needle, a gem, a knot, a leaf.

const THREE = window.THREE;

import { std, box, cyl, ball, place, mark, onDiff, makeFlame } from './builder-kit.js';
import { FIXED } from './palette.js';
import { sealTexture, scrollEndTexture, steamTexture } from './textures.js';

const TOP = 1.17; // the counter's surface
const CZ = -1.55; // the counter's centre line

export function buildCounterCraft(P, reg, glowTex) {
  const group = new THREE.Group();
  const iron = std(P.iron, { roughness: 0.55, metalness: 0.6 });
  const brass = std(P.brass, { roughness: 0.35, metalness: 0.8 });

  // ——— The cauldron, its brew, its steam, its ladle ———
  const pot = new THREE.Group();
  pot.position.set(-1.5, TOP, CZ + 0.05);
  group.add(pot);
  const belly = ball(0.62, iron, 24, 18);
  belly.scale.set(1, 0.8, 1);
  belly.position.y = 0.42;
  pot.add(belly);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.055, 10, 28), iron);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.78;
  rim.castShadow = true;
  pot.add(rim);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const leg = cyl(0.045, 0.06, 0.3, iron, 8);
    place(leg, Math.cos(a) * 0.4, 0.13, Math.sin(a) * 0.4, Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35);
    pot.add(leg);
  }
  const brewMat = std(P.brewBase, { roughness: 0.25, emissive: P.brewGlow, emissiveIntensity: 0.55 });
  const brew = new THREE.Mesh(new THREE.CircleGeometry(0.5, 26), brewMat);
  brew.rotation.x = -Math.PI / 2;
  brew.position.y = 0.76;
  pot.add(brew);
  const bubbleMat = std(P.brewGlow, { roughness: 0.3, emissive: P.brewGlow, emissiveIntensity: 0.7 });
  for (const [bx, bz, br] of [[-0.2, 0.1, 0.07], [0.15, -0.14, 0.055], [0.05, 0.22, 0.04], [-0.28, -0.18, 0.045]]) {
    const bubble = ball(br, bubbleMat, 10, 8);
    bubble.position.set(bx, 0.77, bz);
    pot.add(bubble);
  }
  onDiff(reg, 'brew-hue', (on) => {
    brewMat.color.set(on ? 0x7d3fae : P.brewBase);
    brewMat.emissive.set(on ? 0x9e53e0 : P.brewGlow);
  });
  onDiff(reg, 'brew-sheen', (on) => {
    brewMat.emissive.set(on ? 0x2ee6c8 : P.brewGlow);
    brewMat.emissiveIntensity = on ? 0.95 : 0.55;
  });
  mark(reg, 'brew-hue', pot, 0, 0.8, 0);
  mark(reg, 'brew-sheen', pot, 0.1, 0.8, 0.1);

  const steamMat = new THREE.MeshBasicMaterial({
    map: steamTexture(), transparent: true, opacity: 0.72, depthWrite: false,
    color: 0xf4f1e6, side: THREE.DoubleSide,
  });
  for (let i = 0; i < 3; i++) {
    const wisp = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 1.7), steamMat);
    wisp.position.set(-1.5 + (i - 1) * 0.22, TOP + 1.75, CZ + 0.05 + (i % 2) * 0.1);
    wisp.rotation.y = i * 1.1;
    group.add(wisp);
  }
  onDiff(reg, 'steam-tint', (on) => { steamMat.color.set(on ? 0x9fb6cc : 0xf4f1e6); });
  mark(reg, 'steam-tint', group, -1.5, TOP + 1.8, CZ + 0.05);

  // the ladle, resting across the rim, its handle gem outward
  const ladle = new THREE.Group();
  ladle.position.set(-1.05, TOP + 0.82, CZ + 0.28);
  ladle.rotation.z = -0.5;
  group.add(ladle);
  const handle = cyl(0.028, 0.028, 0.85, std(P.woodDark), 8);
  handle.rotation.z = Math.PI / 2;
  ladle.add(handle);
  const cup = ball(0.11, iron, 12, 8);
  cup.scale.set(1, 0.55, 1);
  cup.position.x = -0.48;
  ladle.add(cup);
  const gemMat = std(0xc22333, { roughness: 0.2, emissive: 0xc22333, emissiveIntensity: 0.35 });
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.055), gemMat);
  gem.position.x = 0.47;
  ladle.add(gem);
  onDiff(reg, 'ladle-gem', (on) => {
    gemMat.color.set(on ? 0x1fae5e : 0xc22333);
    gemMat.emissive.set(on ? 0x1fae5e : 0xc22333);
  });
  mark(reg, 'ladle-gem', ladle, 0.47, 0, 0);

  // ——— Mortar and pestle ———
  const mortar = new THREE.Group();
  mortar.position.set(0.3, TOP, CZ - 0.05);
  group.add(mortar);
  const bowl = cyl(0.24, 0.15, 0.24, std(0x6a6f76, { roughness: 0.5, metalness: 0.3 }), 18);
  bowl.position.y = 0.12;
  mortar.add(bowl);
  const herbIn = ball(0.17, std(FIXED.herbLeaf, { roughness: 0.95 }), 12, 8);
  herbIn.scale.set(1, 0.4, 1);
  herbIn.position.y = 0.24;
  mortar.add(herbIn);
  const pestle = new THREE.Group();
  pestle.position.set(0.05, 0.26, 0);
  pestle.rotation.z = -0.55;
  mortar.add(pestle);
  const pestleBody = cyl(0.045, 0.06, 0.42, std(0x8a8f96, { roughness: 0.45, metalness: 0.3 }), 10);
  pestleBody.position.y = 0.16;
  pestle.add(pestleBody);
  const pestleKnob = ball(0.07, pestleBody.material, 10, 8);
  pestleKnob.position.y = 0.4;
  pestle.add(pestleKnob);
  onDiff(reg, 'pestle-lean', (on) => { pestle.rotation.z = on ? 0.55 : -0.55; });
  mark(reg, 'pestle-lean', mortar, 0.05, 0.55, 0);

  // ——— The candelabrum: three candles, three flames ———
  const candelabrum = new THREE.Group();
  candelabrum.position.set(1.7, TOP, CZ - 0.12);
  group.add(candelabrum);
  const base = cyl(0.2, 0.26, 0.06, brass, 16);
  base.position.y = 0.03;
  candelabrum.add(base);
  const stem = cyl(0.035, 0.05, 0.5, brass, 10);
  stem.position.y = 0.3;
  candelabrum.add(stem);
  const flames = {};
  const candleAt = (x, h, key) => {
    const arm = cyl(0.025, 0.025, Math.abs(x) + 0.1, brass, 8);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(x / 2, 0.52, 0);
    candelabrum.add(arm);
    const cupM = cyl(0.075, 0.05, 0.05, brass, 10);
    cupM.position.set(x, 0.55, 0);
    candelabrum.add(cupM);
    const wax = cyl(0.055, 0.065, h, std(P.candleWax, { roughness: 0.55 }), 12);
    wax.position.set(x, 0.57 + h / 2, 0);
    candelabrum.add(wax);
    const flame = makeFlame(glowTex, P.flame, 1.05);
    flame.position.set(x, 0.6 + h, 0);
    candelabrum.add(flame);
    flames[key] = flame;
    return flame;
  };
  candleAt(-0.34, 0.34, 'left');
  candleAt(0, 0.5, 'mid');
  candleAt(0.34, 0.68, 'tall');
  onDiff(reg, 'tall-candle-out', (on) => {
    flames.tall.userData.flame.visible = !on;
    flames.tall.userData.glow.visible = !on;
  });
  mark(reg, 'tall-candle-out', candelabrum, 0.34, 1.42, 0);
  onDiff(reg, 'flame-lean', (on) => { flames.mid.rotation.z = on ? 0.55 : 0; });
  mark(reg, 'flame-lean', candelabrum, 0, 1.22, 0);

  // ——— The scrolls: one rolled and sealed, one beneath it ———
  const scrolls = new THREE.Group();
  scrolls.position.set(2.72, TOP + 0.07, CZ + 0.18);
  scrolls.rotation.y = -0.35;
  group.add(scrolls);
  const parchMat = std(P.parchment, { roughness: 0.92 });
  const roll = cyl(0.075, 0.075, 0.95, parchMat, 14);
  roll.rotation.z = Math.PI / 2;
  scrolls.add(roll);
  const rollUnder = cyl(0.07, 0.07, 0.9, parchMat, 14);
  rollUnder.rotation.z = Math.PI / 2;
  rollUnder.position.set(0.02, -0.11, 0.09);
  scrolls.add(rollUnder);
  const endMat = new THREE.MeshStandardMaterial({ map: scrollEndTexture(4), roughness: 0.9 });
  const endCap = new THREE.Mesh(new THREE.CircleGeometry(0.072, 16), endMat);
  endCap.rotation.y = Math.PI / 2;
  endCap.position.x = 0.48;
  scrolls.add(endCap);
  const endTexB = scrollEndTexture(9);
  const endTexA = endMat.map;
  onDiff(reg, 'scroll-end-rune', (on) => { endMat.map = on ? endTexB : endTexA; endMat.needsUpdate = true; });
  mark(reg, 'scroll-end-rune', scrolls, 0.5, 0, 0);
  // the wax seal rides on top of the roll
  const sealMat = new THREE.MeshStandardMaterial({ map: sealTexture('W', FIXED.waxCrimson), transparent: true, roughness: 0.5 });
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.085, 18), sealMat);
  seal.rotation.x = -Math.PI / 2 + 0.25;
  seal.position.set(-0.12, 0.078, 0.01);
  scrolls.add(seal);
  const sealTeal = sealTexture('W', FIXED.waxTeal);
  const sealOther = sealTexture('M', FIXED.waxCrimson);
  const sealHome = sealMat.map;
  onDiff(reg, 'scroll-seal', (on) => { sealMat.map = on ? sealTeal : sealHome; sealMat.needsUpdate = true; });
  onDiff(reg, 'seal-letter', (on) => { sealMat.map = on ? sealOther : sealHome; sealMat.needsUpdate = true; });
  mark(reg, 'scroll-seal', scrolls, -0.12, 0.1, 0.02);
  mark(reg, 'seal-letter', scrolls, -0.12, 0.1, 0.02);

  // ——— The balance: beam, pans, weights, and a little dial ———
  const scale = new THREE.Group();
  scale.position.set(-3.2, TOP, CZ - 0.02);
  group.add(scale);
  const post = cyl(0.045, 0.07, 0.85, brass, 10);
  post.position.y = 0.43;
  scale.add(post);
  const beamBar = box(1.15, 0.05, 0.05, brass);
  beamBar.position.y = 0.86;
  scale.add(beamBar);
  for (const px of [-0.52, 0.52]) {
    const chain = cyl(0.008, 0.008, 0.3, brass, 6);
    chain.position.set(px, 0.7, 0);
    scale.add(chain);
    const pan = cyl(0.19, 0.1, 0.05, brass, 16);
    pan.position.set(px, 0.53, 0);
    scale.add(pan);
  }
  const weightGeo = new THREE.CylinderGeometry(0.05, 0.07, 0.12, 12);
  const w1 = new THREE.Mesh(weightGeo, brass); w1.position.set(0.46, 0.62, 0); w1.castShadow = true; scale.add(w1);
  const w2 = new THREE.Mesh(weightGeo, brass); w2.position.set(0.6, 0.62, 0.05); w2.castShadow = true; scale.add(w2);
  onDiff(reg, 'weight-small', (on) => { w2.scale.setScalar(on ? 0.68 : 1); });
  mark(reg, 'weight-small', scale, 0.6, 0.64, 0.05);
  // the dial on the post, and its needle
  const dial = cyl(0.11, 0.11, 0.03, std(0xe9d9ae, { roughness: 0.6 }), 20);
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, 0.5, 0.06);
  scale.add(dial);
  const needle = box(0.016, 0.085, 0.012, std(0x7d1f24, { roughness: 0.5 }));
  needle.geometry.translate(0, 0.036, 0);
  needle.position.set(0, 0.5, 0.085);
  needle.rotation.z = -0.5;
  scale.add(needle);
  onDiff(reg, 'scale-needle', (on) => { needle.rotation.z = on ? 0.65 : -0.5; });
  mark(reg, 'scale-needle', scale, 0, 0.5, 0.1);

  // ——— The open book ———
  const bookOpen = new THREE.Group();
  bookOpen.position.set(0.98, TOP + 0.02, CZ + 0.28);
  bookOpen.rotation.y = 0.3;
  group.add(bookOpen);
  const cover = box(0.86, 0.035, 0.6, std(0x5e2b26, { roughness: 0.8 }));
  bookOpen.add(cover);
  const pageMat = std(0xe9dcc0, { roughness: 0.95 });
  for (const s of [-1, 1]) {
    const page = box(0.4, 0.02, 0.56, pageMat);
    page.position.set(s * 0.2, 0.035, 0);
    page.rotation.z = s * -0.07;
    bookOpen.add(page);
  }
  onDiff(reg, 'page-edges', (on) => { pageMat.color.set(on ? 0xb9c0c4 : 0xe9dcc0); });
  mark(reg, 'page-edges', bookOpen, 0.15, 0.08, 0.1);

  // ——— The cat, sitting at the counter's right end ———
  const cat = new THREE.Group();
  cat.position.set(3.18, TOP, CZ + 0.02);
  cat.rotation.y = -0.5;
  cat.scale.setScalar(1.18);
  group.add(cat);
  const cushion = cyl(0.3, 0.34, 0.07, std(P.rugRed, { roughness: 0.95 }), 18);
  cushion.position.y = 0.035;
  cat.add(cushion);
  const fur = std(FIXED.catFur, { roughness: 0.95 });
  const bodyC = ball(0.21, fur, 18, 14);
  bodyC.scale.set(1, 1.15, 0.9);
  bodyC.position.y = 0.22;
  cat.add(bodyC);
  const head = ball(0.145, fur, 18, 14);
  head.position.set(0, 0.52, 0.05);
  cat.add(head);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.11, 8), fur);
    ear.position.set(s * 0.085, 0.65, 0.04);
    ear.rotation.z = s * -0.15;
    ear.castShadow = true;
    cat.add(ear);
  }
  const eyeMat = std(FIXED.catEye, { roughness: 0.25, emissive: FIXED.catEye, emissiveIntensity: 0.8 });
  for (const s of [-1, 1]) {
    const eye = ball(0.021, eyeMat, 8, 8);
    eye.position.set(s * 0.055, 0.55, 0.175);
    cat.add(eye);
  }
  onDiff(reg, 'cat-eyes', (on) => {
    eyeMat.color.set(on ? 0x53c24a : FIXED.catEye);
    eyeMat.emissive.set(on ? 0x53c24a : FIXED.catEye);
  });
  mark(reg, 'cat-eyes', cat, 0, 0.55, 0.2);
  // tail, curled around the base
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0.05, -0.12),
    new THREE.Vector3(-0.3, 0.04, 0.05),
    new THREE.Vector3(-0.18, 0.05, 0.24),
    new THREE.Vector3(0.05, 0.06, 0.28),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.035, 8), fur);
  tail.castShadow = true;
  cat.add(tail);
  // front paws: two small feet at the counter's edge; one can slip back
  const pawL = ball(0.055, fur, 10, 8);
  pawL.scale.set(1, 0.6, 1.4);
  pawL.position.set(-0.09, 0.03, 0.2);
  cat.add(pawL);
  const pawR = ball(0.055, fur, 10, 8);
  pawR.scale.set(1, 0.6, 1.4);
  pawR.position.set(0.09, 0.03, 0.22);
  cat.add(pawR);
  onDiff(reg, 'cat-paw', (on) => { pawR.position.z = on ? 0.08 : 0.22; });
  mark(reg, 'cat-paw', cat, 0.09, 0.05, 0.26);
  // collar and bell
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.02, 8, 20), std(0x7d1f24, { roughness: 0.6 }));
  collar.rotation.x = Math.PI / 2 - 0.25;
  collar.position.set(0, 0.42, 0.05);
  cat.add(collar);
  const bellMat = std(P.brass, { roughness: 0.25, metalness: 0.85 });
  const bell = ball(0.04, bellMat, 12, 10);
  bell.position.set(0, 0.33, 0.16);
  cat.add(bell);
  onDiff(reg, 'cat-bell', (on) => {
    bellMat.color.set(on ? 0xc8ccd4 : P.brass);
    bellMat.metalness = on ? 0.95 : 0.85;
  });
  mark(reg, 'cat-bell', cat, 0, 0.33, 0.2);

  // ——— Herb bundles on the beam, and the key on its hook ———
  const leafMat = std(FIXED.herbLeaf, { roughness: 0.95 });
  const dryMat = std(FIXED.herbDry, { roughness: 0.95 });
  const bundleAt = (x, key) => {
    const bundle = new THREE.Group();
    bundle.position.set(x, 6.8, -3.2);
    group.add(bundle);
    const string = cyl(0.012, 0.012, 0.5, std(0x9a7d4f), 6);
    string.position.y = 0.22;
    bundle.add(string);
    const bunch = new THREE.Group();
    bunch.position.y = -0.05;
    bundle.add(bunch);
    const leaves = [];
    for (let i = 0; i < 7; i++) {
      const leaf = ball(0.09, i % 2 ? leafMat : dryMat, 8, 6);
      leaf.scale.set(0.55, 2.2, 0.55);
      const a = (i / 7) * Math.PI * 2;
      leaf.position.set(Math.cos(a) * 0.07, -0.32, Math.sin(a) * 0.07);
      leaf.rotation.set(Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25);
      bunch.add(leaf);
      leaves.push(leaf);
    }
    const twineMat = std(0xc2a165, { roughness: 0.9 });
    const twine = cyl(0.085, 0.095, 0.09, twineMat, 10);
    twine.position.y = -0.12;
    bunch.add(twine);
    return { bundle, bunch, twine, twineMat, leaves };
  };
  const b1 = bundleAt(-3.4);
  const b2 = bundleAt(-1.15);
  const b3 = bundleAt(1.35);
  const b4 = bundleAt(3.6);
  onDiff(reg, 'herb-untied', (on) => {
    b2.twine.visible = !on;
    b2.bunch.rotation.z = on ? 0.3 : 0;
    b2.bunch.rotation.x = on ? 0.12 : 0;
  });
  mark(reg, 'herb-untied', b2.bundle, 0, -0.35, 0);
  onDiff(reg, 'herb-knot', (on) => { b4.twineMat.color.set(on ? 0x4c3a1e : 0xc2a165); });
  mark(reg, 'herb-knot', b4.bundle, 0, -0.15, 0);
  onDiff(reg, 'herb-leaf', (on) => { b1.leaves[2].visible = !on; });
  mark(reg, 'herb-leaf', b1.bundle, 0.05, -0.4, 0);

  // the key on its hook, on the right-hand post
  const keyGroup = new THREE.Group();
  keyGroup.position.set(6.4, 5.6, -3.0);
  group.add(keyGroup);
  const hook = cyl(0.02, 0.02, 0.22, brass, 8);
  hook.rotation.x = Math.PI / 2;
  keyGroup.add(hook);
  const key = new THREE.Group();
  key.position.y = -0.06;
  keyGroup.add(key);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 18), brass);
  bow.position.y = -0.1;
  key.add(bow);
  const shaft = box(0.035, 0.22, 0.02, brass);
  shaft.position.y = -0.28;
  key.add(shaft);
  const tooth = box(0.07, 0.035, 0.02, brass);
  tooth.position.set(0.04, -0.36, 0);
  key.add(tooth);
  onDiff(reg, 'key-turned', (on) => { key.rotation.z = on ? 0.7 : 0; });
  mark(reg, 'key-turned', keyGroup, 0, -0.25, 0.05);

  return { group };
}
