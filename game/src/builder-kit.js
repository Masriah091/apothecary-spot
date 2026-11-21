// builder-kit.js — the small shared tools every scene builder uses:
// materials, primitive meshes with their shadows set, placement, and the
// registry by which a builder tells the game "this detail can change,
// here is where it sits, and this is how the change is made".
//
// A registry is { anchors: Map<id, Object3D>, handlers: Map<id, fn> }.
// The anchor is projected into panel pixels for markers and clicks; the
// handler is called with true to apply the difference, false to undo it.

const THREE = window.THREE;

export function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0, ...opts });
}

export function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, mat, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function ball(r, mat, w = 18, h = 14) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function place(mesh, x, y, z, rx = 0, ry = 0, rz = 0) {
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  return mesh;
}

// Register the clickable heart of a difference: an empty point in space
// parented to the scene, at the detail itself.
export function mark(reg, id, parent, x, y, z) {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  parent.add(o);
  reg.anchors.set(id, o);
  return o;
}

// Register how a difference is made and unmade.
export function onDiff(reg, id, fn) {
  reg.handlers.set(id, fn);
}

// A flame: a small teardrop of emissive stuff inside a soft glow sprite.
// Returned as a group whose `flame` child can be hidden, leaned or lit.
export function makeFlame(glowTex, flameColor, scale = 1) {
  const group = new THREE.Group();
  const flameMat = new THREE.MeshBasicMaterial({ color: flameColor });
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.055 * scale, 10, 12), flameMat);
  flame.scale.set(1, 1.9, 1);
  flame.position.y = 0.1 * scale;
  group.add(flame);
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex, color: flameColor, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(0.55 * scale, 0.55 * scale, 1);
  glow.position.y = 0.12 * scale;
  group.add(glow);
  group.userData.flame = flame;
  group.userData.glow = glow;
  return group;
}
