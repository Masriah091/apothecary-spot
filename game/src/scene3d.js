// scene3d.js — assembles the whole apothecary for one round: the room,
// the stocked shelves and the counter craft, under the round's light,
// with a camera that frames the shop for the panel. It merges the three
// builders' difference registries into one, so the panel painter can say
// "apply these twelve differences" without knowing where they live.

const THREE = window.THREE;

import { buildRoom } from './shop-room.js';
import { buildShelfGoods } from './shelf-goods.js';
import { buildCounterCraft } from './counter-craft.js';
import { glowTexture } from './textures.js';

// Metals need something to reflect. A tiny painted room — warm below,
// cool above, one bright window card — is pushed through the PMREM
// generator once and shared by every round.
let environmentTexture = null;

function environmentFor(renderer) {
  if (environmentTexture || !renderer) return environmentTexture;
  try {
    const envScene = new THREE.Scene();
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(20, 12, 20),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: 0x4a4238 }),
    );
    room.position.y = 4;
    envScene.add(room);
    const windowCard = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 6),
      new THREE.MeshBasicMaterial({ color: 0xfff2cf }),
    );
    windowCard.position.set(0, 6, -9.8);
    envScene.add(windowCard);
    const pmrem = new THREE.PMREMGenerator(renderer);
    environmentTexture = pmrem.fromScene(envScene, 0.06).texture;
    pmrem.dispose();
  } catch {
    environmentTexture = null;
  }
  return environmentTexture;
}

export function buildApothecary(P, phaseName, renderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(P.fog);
  scene.fog = new THREE.Fog(P.fog, 26, 60);

  const env = environmentFor(renderer);
  if (env) {
    scene.environment = env;
    if ('environmentIntensity' in scene) scene.environmentIntensity = 0.4;
  }

  const reg = { anchors: new Map(), handlers: new Map() };
  const room = buildRoom(P, phaseName, reg);
  const goods = buildShelfGoods(P, reg);
  const craft = buildCounterCraft(P, reg, glowTexture());
  scene.add(room.group, goods.group, craft.group);

  // ——— The light of the hour ———
  scene.add(new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemiIntensity));

  // Moonlight / dawn through the round window: it does the shadowing.
  const windowLight = new THREE.DirectionalLight(P.windowLight, P.windowIntensity);
  windowLight.position.set(1.5, 7.5, -2.5);
  windowLight.target.position.set(0, 0.6, 3.5);
  windowLight.castShadow = true;
  windowLight.shadow.mapSize.set(1024, 1024);
  windowLight.shadow.camera.left = -11;
  windowLight.shadow.camera.right = 11;
  windowLight.shadow.camera.top = 12;
  windowLight.shadow.camera.bottom = -4;
  windowLight.shadow.camera.near = 1;
  windowLight.shadow.camera.far = 40;
  windowLight.shadow.bias = -0.0006;
  scene.add(windowLight, windowLight.target);

  // Candlelight over the counter, warm and close.
  const candleLight = new THREE.PointLight(0xffb066, P.candleIntensity * 30, 12, 1.8);
  candleLight.position.set(1.4, 3.1, -1.2);
  scene.add(candleLight);

  // The brew's own glow, spilling up out of the pot.
  const brewLight = new THREE.PointLight(P.brewGlow, P.brewIntensity * 14, 6, 1.9);
  brewLight.position.set(-1.5, 2.2, -1.4);
  scene.add(brewLight);

  // A soft frontal fill so the shelves never fall to black.
  const fill = new THREE.DirectionalLight(0xffe6c4, 0.22);
  fill.position.set(-6, 8, 14);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(46, 600 / 640, 0.1, 120);
  camera.position.set(0, 3.9, 13.4);
  camera.lookAt(0, 2.9, -2.2);

  return {
    scene,
    camera,
    anchors: reg.anchors,
    setDifference(id, on) {
      const handler = reg.handlers.get(id);
      if (handler) handler(on);
    },
    hasDifference(id) {
      return reg.handlers.has(id);
    },
  };
}
