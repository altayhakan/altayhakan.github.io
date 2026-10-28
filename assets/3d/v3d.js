/* v73 · 360° vitrin: Tuşpa kedisi ve dört sikke. Yalnız tıklanınca yüklenir; tek WebGL bağlamı, pencere kapanınca çizim durur. */
import * as THREE from '../../vendor/three/three.module.min.js';
import { GLTFLoader } from '../../vendor/three/addons/GLTFLoader.js';
import { OrbitControls } from '../../vendor/three/addons/OrbitControls.js';
import { RoomEnvironment } from '../../vendor/three/addons/RoomEnvironment.js';

const BASE = new URL('./', import.meta.url).href;
const RADII = {"pers":[0.819,0.813,0.809,0.806,0.806,0.809,0.809,0.816,0.829,0.836,0.839,0.849,0.856,0.856,0.86,0.86,0.86,0.866,0.873,0.886,0.896,0.913,0.926,0.936,0.946,0.95,0.946,0.94,0.933,0.923,0.916,0.91,0.906,0.9,0.89,0.886,0.876,0.866,0.849,0.836,0.819,0.803,0.789,0.783,0.776,0.773,0.776,0.773,0.779,0.786,0.793,0.799,0.806,0.813,0.816,0.823,0.829,0.836,0.839,0.849,0.86,0.876,0.89,0.906,0.92,0.93,0.936,0.943,0.94,0.93,0.923,0.913,0.91,0.903,0.9,0.903,0.903,0.903,0.896,0.886,0.876,0.863,0.853,0.846,0.839,0.836,0.833,0.836,0.833,0.839,0.836,0.836,0.836,0.836,0.829,0.823],"selcuklu":[0.94,0.933,0.933,0.93,0.93,0.93,0.93,0.93,0.933,0.933,0.93,0.93,0.926,0.923,0.92,0.913,0.913,0.913,0.916,0.92,0.923,0.926,0.93,0.933,0.936,0.936,0.94,0.933,0.936,0.933,0.933,0.93,0.936,0.933,0.933,0.94,0.936,0.94,0.933,0.933,0.933,0.926,0.92,0.92,0.916,0.913,0.916,0.92,0.92,0.926,0.93,0.93,0.93,0.93,0.93,0.93,0.933,0.93,0.93,0.933,0.933,0.94,0.94,0.94,0.943,0.94,0.94,0.94,0.933,0.93,0.93,0.923,0.92,0.923,0.92,0.92,0.923,0.923,0.923,0.926,0.926,0.923,0.923,0.923,0.92,0.923,0.923,0.926,0.926,0.93,0.936,0.943,0.943,0.946,0.943,0.943],"akce":[0.943,0.936,0.933,0.93,0.93,0.93,0.93,0.926,0.933,0.933,0.93,0.93,0.92,0.916,0.913,0.91,0.91,0.91,0.913,0.913,0.92,0.926,0.933,0.936,0.94,0.946,0.943,0.94,0.94,0.94,0.936,0.933,0.936,0.936,0.94,0.94,0.943,0.94,0.94,0.933,0.933,0.926,0.916,0.913,0.91,0.91,0.91,0.91,0.916,0.923,0.923,0.926,0.933,0.93,0.93,0.93,0.926,0.933,0.93,0.933,0.936,0.94,0.943,0.946,0.95,0.946,0.95,0.943,0.936,0.93,0.923,0.923,0.916,0.913,0.916,0.913,0.92,0.923,0.923,0.923,0.923,0.92,0.92,0.916,0.916,0.916,0.92,0.923,0.926,0.933,0.94,0.946,0.95,0.95,0.953,0.95],"sultani":[0.936,0.933,0.933,0.93,0.93,0.93,0.93,0.93,0.933,0.933,0.93,0.93,0.926,0.93,0.923,0.923,0.923,0.923,0.923,0.923,0.923,0.926,0.93,0.933,0.933,0.933,0.933,0.93,0.933,0.933,0.933,0.93,0.933,0.933,0.933,0.933,0.933,0.933,0.933,0.933,0.933,0.926,0.923,0.923,0.923,0.923,0.92,0.923,0.923,0.926,0.93,0.93,0.93,0.93,0.93,0.93,0.926,0.933,0.93,0.933,0.933,0.933,0.933,0.933,0.936,0.933,0.936,0.933,0.933,0.93,0.93,0.926,0.923,0.926,0.923,0.923,0.93,0.926,0.93,0.926,0.926,0.926,0.923,0.93,0.926,0.93,0.923,0.926,0.933,0.93,0.933,0.933,0.936,0.94,0.936,0.933]};
const COINS = { pers: { metal: '#c9c6c0', r: 1 }, selcuklu: { metal: '#cfcac2', r: 1 }, akce: { metal: '#c4bfb6', r: .86 }, sultani: { metal: '#d9b46a', r: .9 } };

let renderer, scene, camera, controls, env, holder, raf = 0, canvasHost = null, current = null;
const cache = {};
const tl = new THREE.TextureLoader();
function tex(name, color) { const t = tl.load(BASE + name); if (color) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

function setup(w, h, opts = {}) {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.poster });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer);
    env = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environment = env;
    const key = new THREE.DirectionalLight('#fff2e2', 1.6); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight('#f3d2a8', .9); rim.position.set(4, 2, -4); scene.add(rim);
    camera = new THREE.PerspectiveCamera(30, 1, .05, 100);
    holder = new THREE.Group(); scene.add(holder);
  }
  renderer.setPixelRatio(opts.poster ? 1 : Math.min(2, devicePixelRatio || 1));
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}

function coinMesh(id) {
  const c = COINS[id], rs = RADII[id], n = rs.length;
  const shape = new THREE.Shape();
  for (let k = 0; k <= n; k++) { const a = (k % n) / n * Math.PI * 2, r = rs[k % n]; const x = Math.cos(a) * r, y = Math.sin(a) * r; k ? shape.lineTo(x, y) : shape.moveTo(x, y); }
  const depth = .09;
  const edgeMat = new THREE.MeshPhysicalMaterial({ color: c.metal, metalness: 1, roughness: .38, envMapIntensity: 1.1 });
  const side = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 3, curveSegments: 1 }), edgeMat);
  side.position.z = -depth / 2;
  const g = new THREE.Group(); g.add(side);
  ['on', 'arka'].forEach((s, i) => {
    const geo = new THREE.ShapeGeometry(shape);
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); uv.setXY(k, i ? .5 - x * .5 : .5 + x * .5, .5 + y * .5); }
    const m = new THREE.MeshPhysicalMaterial({ map: tex(`sikke-${id}-${s}.webp`, true), normalMap: tex(`sikke-${id}-${s}-n.webp`), normalScale: new THREE.Vector2(1.4, 1.4),
      color: c.metal, metalness: .72, roughness: .42, envMapIntensity: 1.5, transparent: false, alphaTest: .5 });
    const face = new THREE.Mesh(geo, m);
    face.position.z = (i ? -1 : 1) * (depth / 2 + .0125); if (i) face.rotation.y = Math.PI;
    g.add(face);
  });
  g.scale.setScalar(c.r);
  return g;
}

async function catMesh() {
  // Bazı barındırmalar .glb sunmaz: o zaman aynı model base64 metin + ayrı dokular olarak okunur (blob/data adresi gerekmez)
  const L = new GLTFLoader();
  let gltf;
  try { gltf = await L.loadAsync(BASE + 'tuspa.glb'); }
  catch (e) {
    const t = await (await fetch(BASE + 'tuspa-glb.txt')).text();
    const bin = Uint8Array.from(atob(t.trim()), (c) => c.charCodeAt(0));
    gltf = await L.parseAsync(bin.buffer, BASE);
  }
  const root = gltf.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (/^Kapak/.test(o.name)) { o.visible = false; return; }   // göz kapakları oyunda kırpışma için; vitrinde gözler açık
    const old = o.material;
    o.material = new THREE.MeshStandardMaterial({ color: old.color, map: old.map || null, normalMap: old.normalMap || null, roughness: .78, metalness: 0, envMapIntensity: .7 });
  });
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const s = 2 / Math.max(size.x, size.y, size.z); root.scale.setScalar(s); root.position.sub(ctr.multiplyScalar(s));
  const g = new THREE.Group(); g.add(root);
  // yumuşak temas gölgesi
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = -size.y * s / 2 + .005; g.add(sh);
  return g;
}

async function build(id) {
  if (!cache[id]) cache[id] = id === 'tuspa' ? catMesh() : Promise.resolve(coinMesh(id));
  return cache[id];
}
function frame(id) {
  if (id === 'tuspa') { camera.position.set(.9, .8, 4.6); }
  else { camera.position.set(0, .2, 4.1); }
  camera.lookAt(0, 0, 0);
}

export async function poster(id, size = 520) {
  setup(size, size, { poster: true });
  const obj = await build(id); holder.clear(); holder.add(obj);
  holder.rotation.set(id === 'tuspa' ? 0 : -.18, id === 'tuspa' ? .2 : .42, 0);
  frame(id);
  await new Promise((r) => setTimeout(r, 400));
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

export async function open(id, host) {
  const w = host.clientWidth || 600, h = host.clientHeight || 600;
  setup(w, h);
  if (renderer.domElement.parentNode !== host) host.appendChild(renderer.domElement);
  canvasHost = host; current = id;
  if (!controls) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .07; controls.enablePan = false;
    controls.minDistance = 2.2; controls.maxDistance = 6; controls.autoRotate = true; controls.autoRotateSpeed = .9;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    new ResizeObserver(() => { if (!canvasHost) return; const W = canvasHost.clientWidth, H = canvasHost.clientHeight; if (W && H) { renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); } }).observe(host);
  }
  holder.clear(); holder.rotation.set(0, 0, 0);
  host.classList.add('is-loading');
  let obj;
  try { obj = await build(id); }
  catch (e) { delete cache[id]; host.classList.remove('is-loading'); throw e; }
  if (current !== id) return;
  holder.add(obj); host.classList.remove('is-loading');
  frame(id); controls.target.set(0, 0, 0); controls.autoRotate = !matchMedia('(prefers-reduced-motion: reduce)').matches; controls.update();
  cancelAnimationFrame(raf);
  const loop = () => { raf = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); };
  loop();
}
export function close() { cancelAnimationFrame(raf); raf = 0; canvasHost = null; current = null; }
