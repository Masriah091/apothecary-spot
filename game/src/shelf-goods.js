// shelf-goods.js — everything that stands on the two shelf units:
// bottles with runed labels, jars, book rows, tiny vials, a great spotted
// mushroom, and one shelf candle. Density is the point — a shelf worth
// studying — and twelve of the catalogue's differences hide here, in
// labels, liquid levels, lids, ribbons, spots and corks.

const THREE = window.THREE;

import { std, box, cyl, ball, place, mark, onDiff } from './builder-kit.js';
import { FIXED } from './palette.js';
import { labelTexture, mushroomTexture, mulberry } from './textures.js';

// ——— Factories ———

// A potion bottle: glass body, the liquid inside it, a cork, and — when
// labelled — a paper label wrapped on its front. The liquid mesh is
// returned so a difference can lower it.
function bottle({ h = 0.8, r = 0.21, glass = FIXED.glassGreen, liquid = FIXED.liquidGold, level = 0.75, label = null }) {
  const g = new THREE.Group();
  const glassMat = std(glass, { roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.82 });
  const bodyH = h * 0.68;
  const body = cyl(r * 0.92, r, bodyH, glassMat, 18);
  body.position.y = bodyH / 2;
  g.add(body);
  const shoulder = ball(r * 0.92, glassMat);
  shoulder.scale.set(1, 0.55, 1);
  shoulder.position.y = bodyH;
  g.add(shoulder);
  const neck = cyl(r * 0.38, r * 0.5, h * 0.24, glassMat, 12);
  neck.position.y = bodyH + h * 0.14;
  g.add(neck);
  const corkMat = std(0xd8bd8a, { roughness: 0.95 });
  const cork = cyl(r * 0.34, r * 0.38, h * 0.13, corkMat, 10);
  cork.position.y = bodyH + h * 0.3;
  g.add(cork);
  let liquidMesh = null;
  if (liquid !== null) {
    const lh = Math.max(0.05, bodyH * level);
    liquidMesh = cyl(r * 0.8, r * 0.86, lh, std(liquid, { roughness: 0.3, emissive: liquid, emissiveIntensity: 0.12 }), 14);
    liquidMesh.position.y = lh / 2 + 0.02;
    g.add(liquidMesh);
  }
  let labelMat = null;
  if (label) {
    labelMat = new THREE.MeshStandardMaterial({ map: labelTexture(label.rune, label.tint), roughness: 0.9 });
    const wrap = new THREE.Mesh(
      new THREE.CylinderGeometry(r + 0.006, r + 0.006, bodyH * 0.52, 14, 1, true, -0.95, 1.9),
      labelMat,
    );
    wrap.position.y = bodyH * 0.48;
    g.add(wrap);
  }
  return { group: g, liquidMesh, labelMat, glassMat, corkMat, bodyH, r };
}

function jar({ r = 0.26, h = 0.5, fill = FIXED.liquidTeal }) {
  const g = new THREE.Group();
  const glassMat = std(FIXED.glassClear, { roughness: 0.2, transparent: true, opacity: 0.55 });
  const body = cyl(r, r * 1.05, h, glassMat, 16);
  body.position.y = h / 2;
  g.add(body);
  const inside = cyl(r * 0.85, r * 0.85, h * 0.7, std(fill, { roughness: 0.5 }), 12);
  inside.position.y = h * 0.35;
  g.add(inside);
  const lidMat = std(0x6d4c2a, { roughness: 0.85 });
  const lid = cyl(r * 1.06, r * 1.06, 0.09, lidMat, 16);
  lid.position.y = h + 0.045;
  g.add(lid);
  return { group: g, lidMat };
}

// A standing book with a spine band; one book in a row may carry a ribbon.
function book(w, h, d, coverHex, bandHex) {
  const g = new THREE.Group();
  const cover = box(w, h, d, std(coverHex, { roughness: 0.8 }));
  cover.position.y = h / 2;
  g.add(cover);
  const pages = box(w * 0.86, h * 0.94, d * 1.01, std(0xe6d7b0, { roughness: 0.95 }));
  pages.position.set(w * 0.09, h / 2, 0);
  g.add(pages);
  const bandMat = std(bandHex, { roughness: 0.45, metalness: 0.5 });
  const band = box(w * 1.02, h * 0.1, d * 1.02, bandMat);
  band.position.y = h * 0.72;
  g.add(band);
  return { group: g, bandMat };
}

// ——— Stocking the units ———

const BOARD_TOPS = [1.215, 2.415, 3.615, 4.815];

export function buildShelfGoods(P, reg) {
  const group = new THREE.Group();
  const rnd = mulberry(1234);
  const glassCycle = [FIXED.glassGreen, FIXED.glassAmber, FIXED.glassBlue, FIXED.glassViolet, FIXED.glassClear];
  const liquidCycle = [FIXED.liquidRuby, FIXED.liquidGold, FIXED.liquidTeal, FIXED.liquidViolet, FIXED.liquidGreen];

  for (const side of [-1, 1]) {
    const unit = new THREE.Group();
    unit.position.set(side * 4.5, 0, -5.28);
    group.add(unit);
    const isLeft = side < 0;

    // Filler bottles on the open boards (the third board belongs to the
    // book rows). Slots the named pieces will take are left empty, so
    // nothing the differences touch is ever buried in the crowd.
    const reserved = isLeft
      ? { 0: [-1.95, 0.9], 1: [-1.35], 3: [-0.7, -0.25] }
      : { 0: [-1.7], 1: [1.95], 3: [0.9] };
    for (let row = 0; row < 4; row++) {
      if (row === 2) continue;
      const top = BOARD_TOPS[row];
      const taken = reserved[row] ?? [];
      let x = -2.0;
      while (x < 1.7) {
        if (taken.some((t) => Math.abs(t - x) < 0.5)) { x += 0.3; continue; }
        const h = 0.52 + rnd() * 0.4;
        const b = bottle({
          h, r: 0.16 + rnd() * 0.07,
          glass: glassCycle[Math.floor(rnd() * glassCycle.length)],
          liquid: liquidCycle[Math.floor(rnd() * liquidCycle.length)],
          level: 0.4 + rnd() * 0.5,
          label: rnd() > 0.45 ? { rune: Math.floor(rnd() * 12) } : null,
        });
        place(b.group, x, top, (rnd() - 0.5) * 0.3);
        unit.add(b.group);
        x += 0.48 + rnd() * 0.3;
      }
      // a jar at the row's end, unless a named piece stands there
      if (rnd() > 0.4 && !taken.some((t) => Math.abs(t - 1.85) < 0.5)) {
        const j = jar({ fill: liquidCycle[Math.floor(rnd() * liquidCycle.length)] });
        place(j.group, 1.85, top, 0);
        unit.add(j.group);
      }
    }

    // Book rows on the third board of each unit.
    const bookRowY = BOARD_TOPS[2];
    let bx = isLeft ? -0.4 : -2.0;
    const bookCols = [0x6e3b2e, 0x2e4a5e, 0x54683a, 0x71552a, 0x4a2e54, 0x7d3d34];
    for (let i = 0; i < 5; i++) {
      const bk = book(0.17, 0.78 + rnd() * 0.2, 0.52, bookCols[i % bookCols.length], 0xb98a45);
      place(bk.group, bx, bookRowY, 0.05, 0, 0, i === 4 ? -0.1 : 0);
      unit.add(bk.group);
      bx += 0.21;
    }
  }

  // ——— The named pieces, and their differences ———
  const left = group.children[0];
  const right = group.children[1];

  // The great amber bottle, left unit, second board: its label's rune.
  const amber = bottle({ h: 0.98, r: 0.26, glass: FIXED.glassAmber, liquid: FIXED.liquidRuby, level: 0.8, label: { rune: 0 } });
  place(amber.group, -1.35, BOARD_TOPS[1], 0.12);
  left.add(amber.group);
  const amberRuneB = labelTexture(2);
  const amberRuneA = amber.labelMat.map;
  onDiff(reg, 'amber-label-rune', (on) => { amber.labelMat.map = on ? amberRuneB : amberRuneA; amber.labelMat.needsUpdate = true; });
  mark(reg, 'amber-label-rune', amber.group, 0, 0.36, 0.3);

  // The smallest bottle in the shop, left unit, front of the low board.
  const tiny = bottle({ h: 0.42, r: 0.13, glass: FIXED.glassViolet, liquid: FIXED.liquidGold, level: 0.7, label: { rune: 11 } });
  place(tiny.group, -1.95, BOARD_TOPS[0], 0.28);
  left.add(tiny.group);
  const tinyRuneB = labelTexture(3);
  const tinyRuneA = tiny.labelMat.map;
  onDiff(reg, 'smallest-rune', (on) => { tiny.labelMat.map = on ? tinyRuneB : tinyRuneA; tiny.labelMat.needsUpdate = true; });
  mark(reg, 'smallest-rune', tiny.group, 0, 0.16, 0.18);

  // A book band on the left unit's row: gold to blue.
  // (Rebuild one book of the row as the named piece, at the row's start.)
  const bandBook = book(0.18, 0.92, 0.54, 0x2e4a5e, 0xc9973f);
  place(bandBook.group, -1.95, BOARD_TOPS[2], 0.05);
  left.add(bandBook.group);
  onDiff(reg, 'book-band', (on) => { bandBook.bandMat.color.set(on ? 0x2e5aa8 : 0xc9973f); });
  mark(reg, 'book-band', bandBook.group, 0, 0.66, 0.3);

  // The great mushroom, left unit, low board: spots that vanish / blush.
  const shroom = new THREE.Group();
  const stem = cyl(0.09, 0.14, 0.3, std(0xe3d3ac, { roughness: 0.9 }), 10);
  stem.position.y = 0.15;
  shroom.add(stem);
  const capMat = new THREE.MeshStandardMaterial({ map: mushroomTexture(5, 0xf3e5c3), roughness: 0.75 });
  const cap = ball(0.3, capMat, 18, 12);
  cap.scale.set(1, 0.55, 1);
  cap.position.y = 0.32;
  shroom.add(cap);
  const shroomSmall = ball(0.17, std(0x8a3b2a, { roughness: 0.75 }), 14, 10);
  shroomSmall.scale.set(1, 0.55, 1);
  shroomSmall.position.set(0.3, 0.2, 0.1);
  shroom.add(shroomSmall);
  place(shroom, 0.9, BOARD_TOPS[0], 0.1);
  left.add(shroom);
  const spotsFive = capMat.map;
  const spotsThree = mushroomTexture(3, 0xf3e5c3);
  const spotsPink = mushroomTexture(5, 0xe89aa8);
  onDiff(reg, 'mushroom-spots', (on) => { capMat.map = on ? spotsThree : spotsFive; capMat.needsUpdate = true; });
  onDiff(reg, 'spot-hue', (on) => { capMat.map = on ? spotsPink : spotsFive; capMat.needsUpdate = true; });
  mark(reg, 'mushroom-spots', shroom, 0, 0.36, 0.2);
  mark(reg, 'spot-hue', shroom, 0.05, 0.36, 0.2);

  // Top-shelf vials, left unit: a rune, a level, side by side.
  const vialA = bottle({ h: 0.5, r: 0.11, glass: FIXED.glassBlue, liquid: FIXED.liquidTeal, level: 0.72, label: { rune: 5 } });
  place(vialA.group, -0.7, BOARD_TOPS[3], 0.1);
  left.add(vialA.group);
  const vialRuneB = labelTexture(8);
  const vialRuneA = vialA.labelMat.map;
  onDiff(reg, 'vial-rune', (on) => { vialA.labelMat.map = on ? vialRuneB : vialRuneA; vialA.labelMat.needsUpdate = true; });
  mark(reg, 'vial-rune', vialA.group, 0, 0.18, 0.15);

  const vialB = bottle({ h: 0.5, r: 0.11, glass: FIXED.glassGreen, liquid: FIXED.liquidViolet, level: 0.72, label: null });
  place(vialB.group, -0.25, BOARD_TOPS[3], 0.1);
  left.add(vialB.group);
  onDiff(reg, 'vial-level', (on) => {
    const lh = vialB.bodyH * (on ? 0.42 : 0.72);
    vialB.liquidMesh.scale.y = (on ? 0.42 : 0.72) / 0.72;
    vialB.liquidMesh.position.y = lh / 2 + 0.02;
  });
  mark(reg, 'vial-level', vialB.group, 0, 0.2, 0.15);

  // The tall green bottle, right unit, third board: half-emptied; and in
  // the last round its glass itself warms to amber.
  const green = bottle({ h: 1.0, r: 0.23, glass: FIXED.glassGreen, liquid: FIXED.liquidGreen, level: 0.8, label: { rune: 7 } });
  place(green.group, 1.3, BOARD_TOPS[2], 0.1);
  right.add(green.group);
  onDiff(reg, 'green-level', (on) => {
    green.liquidMesh.scale.y = (on ? 0.45 : 0.8) / 0.8;
    green.liquidMesh.position.y = (green.bodyH * (on ? 0.45 : 0.8)) / 2 + 0.02;
  });
  mark(reg, 'green-level', green.group, 0, 0.4, 0.26);
  onDiff(reg, 'glass-amber', (on) => { green.glassMat.color.set(on ? FIXED.glassAmber : FIXED.glassGreen); });
  mark(reg, 'glass-amber', green.group, 0.1, 0.55, 0.26);

  // The squat jar, right unit, low board: a grander lid than it should have.
  const squat = jar({ r: 0.3, h: 0.46, fill: FIXED.liquidGold });
  place(squat.group, -1.7, BOARD_TOPS[0], 0.15);
  right.add(squat.group);
  onDiff(reg, 'jar-lid', (on) => {
    squat.lidMat.color.set(on ? P.brass : 0x6d4c2a);
    squat.lidMat.metalness = on ? 0.75 : 0.0;
    squat.lidMat.roughness = on ? 0.35 : 0.85;
  });
  mark(reg, 'jar-lid', squat.group, 0, 0.52, 0.2);

  // A ribboned book, right unit's row.
  const ribbonBook = book(0.18, 0.88, 0.54, 0x54683a, 0xb98a45);
  place(ribbonBook.group, 0.35, BOARD_TOPS[2], 0.05);
  right.add(ribbonBook.group);
  const ribbonMat = std(0x2e4a9e, { roughness: 0.6 });
  const ribbon = box(0.05, 0.5, 0.02, ribbonMat);
  place(ribbon, 0.35, BOARD_TOPS[2] + 0.28, 0.36);
  right.add(ribbon);
  onDiff(reg, 'book-ribbon', (on) => { ribbonMat.color.set(on ? 0xa8232e : 0x2e4a9e); });
  mark(reg, 'book-ribbon', right, 0.35, BOARD_TOPS[2] + 0.3, 0.38);

  // A shelf candle, right unit, second board — it burns shorter in round 2.
  const candleGroup = new THREE.Group();
  const candleMat = std(P.candleWax, { roughness: 0.6 });
  const candleBody = cyl(0.07, 0.085, 0.52, candleMat, 12);
  candleBody.position.y = 0.26;
  candleGroup.add(candleBody);
  const candleTop = new THREE.Group();
  candleTop.position.y = 0.52;
  candleGroup.add(candleTop);
  const wick = cyl(0.012, 0.012, 0.07, std(0x1c1410), 6);
  wick.position.y = 0.03;
  candleTop.add(wick);
  place(candleGroup, 1.95, BOARD_TOPS[1], 0.15);
  right.add(candleGroup);
  onDiff(reg, 'short-candle', (on) => {
    candleBody.scale.y = on ? 0.5 : 1;
    candleBody.position.y = on ? 0.13 : 0.26;
    candleTop.position.y = on ? 0.26 : 0.52;
  });
  mark(reg, 'short-candle', candleGroup, 0, 0.56, 0.1);

  // A vial on the right unit's top board whose cork darkens in round 3.
  const corkVial = bottle({ h: 0.52, r: 0.12, glass: FIXED.glassClear, liquid: FIXED.liquidRuby, level: 0.65, label: null });
  place(corkVial.group, 0.9, BOARD_TOPS[3], 0.1);
  right.add(corkVial.group);
  onDiff(reg, 'cork-tint', (on) => { corkVial.corkMat.color.set(on ? 0x5e4020 : 0xd8bd8a); });
  mark(reg, 'cork-tint', corkVial.group, 0, 0.42, 0.12);

  return { group };
}
