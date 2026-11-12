// Procedural, physically based 3D icons. Each subject is built from code (no images, no models) and drawn with
// Three.js using real metal/glass materials and an image-based light. Three style variants are drawn side by side.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const GOLD = 0xf3b43a;
function mats(v) {
  const gold = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.2 });
  const goldSoft = new THREE.MeshPhysicalMaterial({ color: 0xe0a02c, metalness: 1, roughness: 0.38 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x15181f, metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12 });
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xcfd4de, metalness: 1, roughness: 0.3 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x1b2233, metalness: 0.1, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 });
  const ivory = new THREE.MeshPhysicalMaterial({ color: 0xf1ede2, metalness: 0, roughness: 0.45, clearcoat: 0.3 });
  if (v === 0) return { main: gold, acc: goldSoft, base: graphite, face: graphite, ink: ivory };
  if (v === 1) return { main: steel, acc: gold, base: graphite, face: graphite, ink: gold };
  return { main: glass, acc: gold, base: graphite, face: glass, ink: gold };       // v2: dark glass with gold trim
}
const bevel = { depth: 0.12, bevelEnabled: true, bevelSegments: 5, bevelSize: 0.03, bevelThickness: 0.035, curveSegments: 24 };
function mesh(g, m) { const o = new THREE.Mesh(g, m); return o; }
function starShape(R, r, n = 5) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const a = Math.PI / n * i - Math.PI / 2, d = i % 2 ? r : R; const x = Math.cos(a) * d, y = Math.sin(a) * d; i ? s.lineTo(x, y) : s.moveTo(x, y); } s.closePath(); return s; }

// ---------- 1. Flagship trophy (big budget, polished game) ----------
function trophy(M) {
  const g = new THREE.Group();
  const pts = new THREE.SplineCurve([[0.01, 0.0], [0.5, 0.0], [0.52, 0.06], [0.3, 0.1], [0.14, 0.2], [0.11, 0.5], [0.2, 0.62], [0.14, 0.7], [0.12, 0.82], [0.4, 0.95], [0.6, 1.3], [0.66, 1.78], [0.62, 1.8], [0.55, 1.5], [0.3, 1.12], [0.01, 1.05]].map(a => new THREE.Vector2(a[0], a[1]))).getPoints(90);
  const cup = mesh(new THREE.LatheGeometry(pts, 72), M.main); cup.material = M.main.clone(); cup.material.side = THREE.DoubleSide; cup.position.y = 0.3; g.add(cup);
  [-1, 1].forEach(s => { const h = mesh(new THREE.TorusGeometry(0.34, 0.065, 20, 56, Math.PI), M.acc); h.rotation.z = s * -Math.PI / 2; h.position.set(s * 0.6, 1.62, 0); g.add(h); });
  const base = mesh(new RoundedBoxGeometry(1.4, 0.3, 1.0, 6, 0.06), M.base); base.position.y = 0.15; g.add(base);
  const plate = mesh(new RoundedBoxGeometry(0.62, 0.12, 0.04, 4, 0.015), M.acc); plate.position.set(0, 0.14, 0.51); g.add(plate);
  const star = mesh(new THREE.ExtrudeGeometry(starShape(0.22, 0.09), { ...bevel, depth: 0.04, bevelSize: 0.012, bevelThickness: 0.015, bevelSegments: 3 }), M.acc); star.position.set(0, 1.55, 0.54); g.add(star);
  g.position.y = -0.95; g.scale.setScalar(0.98); g.rotation.y = -0.38; return g;
}

// ---------- 2. Coin stack with a play mark (free game: ads and optional purchases) ----------
function coinGeo() {
  const p = [[0, 0], [0.6, 0], [0.64, 0.015], [0.65, 0.05], [0.64, 0.1], [0.6, 0.12], [0.52, 0.12], [0.5, 0.1], [0.0, 0.1]].map(a => new THREE.Vector2(a[0], a[1]));
  return new THREE.LatheGeometry(p, 96);
}
function coins(M) {
  const g = new THREE.Group(), geo = coinGeo();
  for (let i = 0; i < 6; i++) { const c = mesh(geo, i % 2 ? M.acc : M.main); c.position.set(Math.sin(i * 2.1) * 0.025, i * 0.125 - 0.78, Math.cos(i * 1.7) * 0.025); c.rotation.y = i * 0.7; g.add(c); }
  const front = new THREE.Group();
  const c = mesh(geo, M.main); c.rotation.x = Math.PI / 2; c.position.z = -0.05; front.add(c);
  const tri = new THREE.Shape(); tri.moveTo(-0.15, -0.22); tri.lineTo(0.28, 0); tri.lineTo(-0.15, 0.22); tri.closePath();
  const t = mesh(new THREE.ExtrudeGeometry(tri, { ...bevel, depth: 0.03, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3 }), M.base); t.position.set(0, 0, 0.1); front.add(t);
  front.position.set(0.55, -0.1, 0.62); front.rotation.set(-0.12, -0.5, 0.0); front.scale.setScalar(1.05); g.add(front);
  g.position.y = -0.12; g.rotation.y = 0.25; g.scale.setScalar(1.05); return g;
}

// ---------- 3. Price tag with a dollar mark (paid, fixed price) ----------
function tag(M) {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-0.55, 0.9); s.lineTo(0.55, 0.9); s.quadraticCurveTo(0.7, 0.9, 0.7, 0.75); s.lineTo(0.7, -0.62); s.lineTo(0, -1.25); s.lineTo(-0.7, -0.62); s.lineTo(-0.7, 0.75); s.quadraticCurveTo(-0.7, 0.9, -0.55, 0.9);
  const hole = new THREE.Path(); hole.absarc(0, 0.58, 0.14, 0, Math.PI * 2, true); s.holes.push(hole);
  const body = mesh(new THREE.ExtrudeGeometry(s, { ...bevel, depth: 0.14, bevelSize: 0.05, bevelThickness: 0.05 }), M.main); body.position.z = -0.07; g.add(body);
  const eye = mesh(new THREE.TorusGeometry(0.18, 0.05, 20, 48), M.acc); eye.position.set(0, 0.58, 0.07); g.add(eye);
  const cord = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.58, 0.07), new THREE.Vector3(0.2, 0.95, 0.2), new THREE.Vector3(0.5, 1.15, 0.25), new THREE.Vector3(0.9, 1.0, 0.1)]);
  g.add(mesh(new THREE.TubeGeometry(cord, 40, 0.028, 10), M.base));
  // dollar mark: an S made of two arcs, plus a vertical bar
  const S = [], r0 = 0.17, rad = a => a * Math.PI / 180;
  for (let d = 35; d <= 270; d += 6) S.push(new THREE.Vector3(Math.cos(rad(d)) * r0, 0.17 + Math.sin(rad(d)) * r0 - 0.12, 0.1));
  for (let d = 90; d >= -145; d -= 6) S.push(new THREE.Vector3(Math.cos(rad(d)) * r0, -0.17 + Math.sin(rad(d)) * r0 - 0.12, 0.1));
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(S), 120, 0.045, 14), M.acc));
  const bar = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 14), M.acc); bar.position.set(0, -0.12, 0.1); g.add(bar);
  g.position.y = -0.05; g.rotation.set(0.05, -0.35, -0.12); g.scale.setScalar(0.9); return g;
}

// ---------- 4. Stopwatch (game jam, deadline, portfolio) ----------
function watch(M) {
  const g = new THREE.Group();
  const bez = mesh(new THREE.TorusGeometry(0.82, 0.11, 28, 96), M.main); g.add(bez);
  const face = mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.12, 96), M.face); face.rotation.x = Math.PI / 2; face.position.z = -0.02; g.add(face);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, big = i % 3 === 0; const t = mesh(new RoundedBoxGeometry(big ? 0.07 : 0.04, big ? 0.17 : 0.1, 0.03, 3, 0.012), big ? M.ink : M.acc); t.position.set(Math.sin(a) * 0.6, Math.cos(a) * 0.6, 0.05); t.rotation.z = -a; g.add(t); }
  const hand = mesh(new RoundedBoxGeometry(0.06, 0.52, 0.03, 3, 0.012), M.acc); hand.position.set(0.17, 0.2, 0.08); hand.rotation.z = -0.62; g.add(hand);
  const hand2 = mesh(new RoundedBoxGeometry(0.07, 0.34, 0.03, 3, 0.012), M.ink); hand2.position.set(-0.14, -0.04, 0.07); hand2.rotation.z = 1.15; g.add(hand2);
  const cap = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 32), M.main); cap.rotation.x = Math.PI / 2; cap.position.z = 0.1; g.add(cap);
  const stem = mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.22, 36), M.main); stem.position.y = 1.0; g.add(stem);
  const crown = mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.12, 48), M.acc); crown.position.y = 1.18; g.add(crown);
  const side = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 24), M.main); side.position.set(0.66, 0.66, 0); side.rotation.z = -Math.PI / 4; g.add(side);
  g.position.y = -0.12; g.rotation.set(0.1, -0.3, 0); g.scale.setScalar(0.94); return g;
}

// ---------- 5. Pip the mascot: a faceted gem with eyes (2 frames: mouth closed, mouth open) ----------
function pip(M, open) {
  const g = new THREE.Group();
  const body = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.17, clearcoat: 0.5, flatShading: true });
  const pts = [[0.0, -1.05], [0.46, -0.5], [0.92, 0.12], [0.62, 0.56], [0.0, 0.64]].map(a => new THREE.Vector2(a[0], a[1]));
  const gem = mesh(new THREE.LatheGeometry(pts, 8), body); gem.rotation.y = Math.PI / 8; g.add(gem);
  const crownPts = [[0.62, 0.5], [0.4, 0.62], [0.0, 0.82]]; void crownPts;
  const eyeM = new THREE.MeshPhysicalMaterial({ color: 0xf6f3ea, roughness: 0.25, clearcoat: 1 });
  const pupM = new THREE.MeshPhysicalMaterial({ color: 0x0c0e13, roughness: 0.15, clearcoat: 1 });
  [-1, 1].forEach(s => { const e = mesh(new THREE.SphereGeometry(0.2, 40, 28), eyeM); e.position.set(s * 0.3, 0.2, 0.84); e.scale.set(1, 1.15, 0.55); e.rotation.x = -0.12; g.add(e); const p = mesh(new THREE.SphereGeometry(0.1, 28, 20), pupM); p.position.set(s * 0.3 + 0.02, 0.18, 0.93); p.scale.set(1, 1, 0.55); g.add(p); const hl = mesh(new THREE.SphereGeometry(0.025, 12, 10), eyeM); hl.position.set(s * 0.3 + 0.05, 0.23, 0.97); g.add(hl); });
  if (open) { const m = mesh(new THREE.SphereGeometry(0.14, 36, 24), pupM); m.position.set(0, -0.2, 0.78); m.scale.set(1.2, 0.95, 0.5); g.add(m); }
  else { const m = mesh(new THREE.TorusGeometry(0.16, 0.026, 12, 36, Math.PI), pupM); m.rotation.z = Math.PI; m.position.set(0, -0.12, 0.8); g.add(m); }
  g.position.y = -0.05; g.rotation.set(0.0, -0.28, 0.03); g.scale.setScalar(1.12); return g;
}


// ---------- 6. Pointing hand (tutorial pointer): fingertip is the highest point ----------
function hand(M) {
  const g = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({ color: 0xf4efe6, metalness: 0, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: new THREE.Color(0xffffff) });
  const cap = (r, len, m) => new THREE.CapsuleGeometry(r, len, 12, 28);
  const palm = mesh(new RoundedBoxGeometry(0.74, 0.62, 0.46, 8, 0.2), skin); palm.position.set(0, -0.28, 0); g.add(palm);
  const idx = mesh(cap(0.125, 0.8), skin); idx.position.set(-0.2, 0.42, 0.02); g.add(idx);
  [[-0.0, 0.09], [0.2, 0.07], [0.37, 0.02]].forEach((a, i) => { const f = mesh(cap(0.105 - i * 0.008, 0.2), skin); f.rotation.x = Math.PI / 2 - 0.3; f.position.set(a[0], a[1], 0.27); g.add(f); });
  const th = mesh(cap(0.11, 0.22), skin); th.rotation.z = -1.15; th.position.set(0.47, -0.2, 0.14); g.add(th);
  const cuff = mesh(new THREE.CylinderGeometry(0.4, 0.43, 0.26, 56), M.main); cuff.position.set(0, -0.72, 0); g.add(cuff);
  const rim = mesh(new THREE.TorusGeometry(0.42, 0.035, 14, 56), M.acc); rim.rotation.x = Math.PI / 2; rim.position.set(0, -0.6, 0); g.add(rim);
  g.position.set(0.0, -0.05, 0); g.rotation.set(-0.08, -0.35, 0.1); g.scale.setScalar(1.2); return g;
}

export const SUBJECTS = [
  { id: 'goal-aaa', label: 'Flagship', build: trophy },
  { id: 'goal-free', label: 'Free to play', build: coins },
  { id: 'goal-paid', label: 'Paid', build: tag },
  { id: 'goal-jam', label: 'Jam', build: watch },
  { id: 'pip-closed', label: 'Pip', build: M => pip(M, false) },
  { id: 'pip-open', label: 'Pip talking', build: M => pip(M, true) },
  { id: 'hand', label: 'Pointer', build: hand }
];

export function start(glCanvas, size) {
  const r = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(size, size, false); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
  const env = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.03).texture;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0.0, 0.25, 6.2); cam.lookAt(0, 0, 0);
  return function draw(subject, variant, target) {
    const sc = new THREE.Scene(); sc.environment = env; sc.environmentIntensity = 0.95;
    const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(-2.5, 4, 5); sc.add(key);
    const rim = new THREE.DirectionalLight(0x9db4ff, 1.1); rim.position.set(3.5, 1.5, -3); sc.add(rim);
    sc.add(new THREE.AmbientLight(0xffffff, 0.12));
    const obj = subject.build(mats(variant)); sc.add(obj);
    r.setClearColor(0x000000, 0); r.clear(); r.render(sc, cam);
    const c = target.getContext('2d'); c.clearRect(0, 0, size, size); c.drawImage(glCanvas, 0, 0);
    sc.traverse(o => { if (o.geometry) o.geometry.dispose(); });
  };
}
