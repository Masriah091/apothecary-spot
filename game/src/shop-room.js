// shop-room.js — the apothecary's shell: plank floor, plaster walls, the
// round window with its painted sky and moon, the two shelf units, the
// long counter, the beam the herbs hang from, and the rug.
//
// The window hosts three of the catalogue's differences: the moon can
// swell from crescent to full, its halo can thin, and the bright star at
// its left can go out. The sky and moon are paintings on canvas textures,
// so each change is a swap of one painting for its meddled twin.

const THREE = window.THREE;

import { std, box, cyl, ball, place, mark, onDiff } from './builder-kit.js';
import {
  woodTexture, plasterTexture, skyTexture, moonTexture, glowTexture, rugTexture, chartTexture,
} from './textures.js';

export function buildRoom(P, phaseName, reg) {
  const group = new THREE.Group();
  const woodTex = woodTexture(P.woodMid, P.woodDark, 7);
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.9 });
  const darkWood = std(P.woodDark, { roughness: 0.92 });
  const midWood = std(P.woodMid, { roughness: 0.9 });

  // ——— Floor and walls ———
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(19, 14),
    new THREE.MeshStandardMaterial({ map: woodTexture(P.woodMid, P.woodDark, 9), roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -0.5);
  floor.receiveShadow = true;
  group.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ map: plasterTexture(P.wall), roughness: 0.96 });
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(19, 12), wallMat);
  backWall.position.set(0, 5.4, -6);
  backWall.receiveShadow = true;
  group.add(backWall);

  const shadeMat = std(P.wallShade, { roughness: 0.97 });
  for (const side of [-1, 1]) {
    const sideWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), shadeMat);
    sideWall.rotation.y = side * Math.PI / 2;
    sideWall.position.set(side * 9.5, 5.4, -0.5);
    sideWall.receiveShadow = true;
    group.add(sideWall);
  }
  // wainscot along the back wall
  const wainscot = box(19, 1.05, 0.09, woodMat);
  place(wainscot, 0, 0.52, -5.95);
  group.add(wainscot);

  // ——— The round window: sky, moon, halo, frame ———
  const winGroup = new THREE.Group();
  winGroup.position.set(0, 5.0, -5.94);
  group.add(winGroup);

  const skyWithStar = skyTexture(P.sky, P.skyLow, 11, true);
  const skyPlain = skyTexture(P.sky, P.skyLow, 11, false);
  const skyMat = new THREE.MeshBasicMaterial({ map: skyWithStar });
  const sky = new THREE.Mesh(new THREE.CircleGeometry(2.02, 40), skyMat);
  winGroup.add(sky);
  onDiff(reg, 'bright-star', (on) => { skyMat.map = on ? skyPlain : skyWithStar; skyMat.needsUpdate = true; });
  // the bright star sits at texture (150,128) of 512 — disc-local (-0.84, +0.99)
  mark(reg, 'bright-star', winGroup, -0.84, 0.99, 0.05);

  const moonKind = phaseName === 'midnight' ? 'full' : 'crescent';
  const moonMat = new THREE.MeshBasicMaterial({
    map: moonTexture(moonKind, P.moon), transparent: true, depthWrite: false,
  });
  const moon = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.35), moonMat);
  moon.position.set(0.52, 0.42, 0.03);
  winGroup.add(moon);
  const moonFull = moonTexture('full', P.moon);
  onDiff(reg, 'moon-waxing', (on) => { moonMat.map = on ? moonFull : moonTexture(moonKind, P.moon); moonMat.needsUpdate = true; });
  mark(reg, 'moon-waxing', winGroup, 0.52, 0.42, 0.06);

  const haloMat = new THREE.SpriteMaterial({
    map: glowTexture(), color: P.moonGlow, transparent: true, opacity: 0.55, depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(3.6, 3.6, 1);
  halo.position.set(0.52, 0.42, 0.02);
  winGroup.add(halo);
  onDiff(reg, 'moon-halo', (on) => { haloMat.opacity = on ? 0.1 : 0.55; });
  mark(reg, 'moon-halo', winGroup, 0.52, 0.42, 0.06);

  const frameMat = std(P.woodDark, { roughness: 0.8 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.1, 12, 44), frameMat);
  ring.castShadow = true;
  winGroup.add(ring);
  const barV = box(0.07, 4.05, 0.05, frameMat); winGroup.add(barV);
  const barH = box(4.05, 0.07, 0.05, frameMat); winGroup.add(barH);
  // sill and a pair of wall sconces flanking the window
  const sill = box(4.7, 0.14, 0.3, midWood);
  place(sill, 0, 2.86, -5.85);
  group.add(sill);

  // ——— Shelf units, left and right ———
  for (const side of [-1, 1]) {
    const unit = new THREE.Group();
    unit.position.set(side * 4.5, 0, -5.3);
    group.add(unit);
    for (const ux of [-2.25, 2.25]) {
      const upright = box(0.16, 5.1, 0.9, woodMat);
      place(upright, ux, 3.6, 0);
      unit.add(upright);
    }
    for (const by of [1.15, 2.35, 3.55, 4.75, 5.95]) {
      const board = box(4.66, 0.13, 0.95, woodMat);
      place(board, 0, by, 0);
      unit.add(board);
    }
    const crown = box(4.8, 0.22, 1.0, darkWood);
    place(crown, 0, 6.22, 0);
    unit.add(crown);
  }

  // ——— The counter ———
  const counter = new THREE.Group();
  counter.position.set(0, 0, -1.55);
  group.add(counter);
  const top = box(7.6, 0.14, 1.5, std(P.counterTop, { roughness: 0.72 }));
  place(top, 0, 1.1, 0);
  counter.add(top);
  const front = box(7.3, 1.0, 0.1, woodMat);
  place(front, 0, 0.55, 0.68);
  counter.add(front);
  for (const sx of [-3.6, 3.6]) {
    const sidePanel = box(0.12, 1.0, 1.4, woodMat);
    place(sidePanel, sx, 0.55, 0);
    counter.add(sidePanel);
  }
  for (const px of [-2.4, 0, 2.4]) { // panel mouldings on the counter front
    const mould = box(1.7, 0.68, 0.05, darkWood);
    place(mould, px, 0.55, 0.74);
    counter.add(mould);
    const knob = ball(0.045, std(P.brass, { roughness: 0.3, metalness: 0.8 }), 10, 8);
    place(knob, px, 0.55, 0.79);
    counter.add(knob);
  }

  // ——— Beam, rug, chart, and floor dressing ———
  const beam = box(13.5, 0.3, 0.36, darkWood);
  place(beam, 0, 6.95, -3.2);
  group.add(beam);
  for (const bx of [-6.4, 6.4]) {
    const post = box(0.32, 6.95, 0.36, darkWood);
    place(post, bx, 3.47, -3.2);
    group.add(post);
  }

  const rug = new THREE.Mesh(
    new THREE.PlaneGeometry(4.8, 3.4),
    new THREE.MeshStandardMaterial({ map: rugTexture(P.rugRed, P.rugGold), roughness: 0.98 }),
  );
  rug.rotation.x = -Math.PI / 2;
  rug.rotation.z = Math.PI / 2;
  rug.position.set(0, 0.012, 0.9);
  rug.receiveShadow = true;
  group.add(rug);

  const chart = new THREE.Group();
  chart.position.set(0, 2.0, -5.93);
  group.add(chart);
  const chartFrame = box(1.5, 1.86, 0.06, darkWood);
  chart.add(chartFrame);
  const chartFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.32, 1.68),
    new THREE.MeshStandardMaterial({ map: chartTexture(P.parchment), roughness: 0.94 }),
  );
  chartFace.position.z = 0.04;
  chart.add(chartFace);

  // crates and a basket on the floor, for depth at the edges
  const crate1 = box(1.1, 1.1, 1.1, midWood); place(crate1, -6.9, 0.55, -2.6, 0, 0.3); group.add(crate1);
  const crate2 = box(0.85, 0.85, 0.85, midWood); place(crate2, -6.75, 1.5, -2.55, 0, -0.15); group.add(crate2);
  const basket = cyl(0.55, 0.4, 0.7, std(P.woodLight, { roughness: 0.95 }), 14);
  place(basket, 6.8, 0.35, -2.4);
  group.add(basket);
  const stool = cyl(0.42, 0.42, 0.09, midWood, 18);
  place(stool, 5.6, 0.78, 0.6);
  group.add(stool);
  const stoolLeg = cyl(0.07, 0.09, 0.75, darkWood, 10);
  place(stoolLeg, 5.6, 0.38, 0.6);
  group.add(stoolLeg);

  return { group };
}
