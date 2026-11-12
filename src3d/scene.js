import * as THREE from 'three';

const ACC = 0xffc53d;
const MOODS = {
  home: { spin: 0.18, pull: 1 },
  scan: { spin: 1.1, pull: 0.55 },
  step: { spin: 0.1, pull: 1 },
  done: { spin: 0.3, pull: 1.15 },
  quiet: { spin: 0.05, pull: 1 }
};
const N = 180;
let R, scene, cam, grp, gem, mat, edges, dust, seeds, canvas;
let raf = 0, mood = 'home', prog = 0, pop = 0, burst = 0, t0 = 0, spin = 0, pin = 1, base = 1, ok = false, reduce = false;

function layout() {
  if (!ok) return;
  const w = window.innerWidth || 1, h = window.innerHeight || 1;
  R.setSize(w, h, false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
  const vh = 2 * 6 * Math.tan((20 * Math.PI) / 180), vw = vh * cam.aspect;
  const phone = w < 640;
  if (phone) { grp.position.set(0, vh / 2 - 0.7, 0); base = 0.6; }
  else { grp.position.set(vw * 0.24, 0, 0); base = 1; }
  canvas.style.opacity = phone ? '0.22' : (mood === 'quiet' ? '0.5' : '1');
  kick();
}

const DULL = new THREE.Color(0x1c2230), GOLD = new THREE.Color(0xd9a02f);
function apply() {
  if (!ok) return;
  mat.color.copy(DULL).lerp(GOLD, Math.min(1, prog * 1.15));
  mat.roughness = 0.9 - 0.7 * prog;
  mat.metalness = 0.2 + 0.7 * prog;
  mat.emissiveIntensity = prog * 0.08 + (mood === 'done' ? 0.18 : 0);
  edges.material.opacity = 0.55 + 0.45 * prog;
  dust.material.opacity = 0.45 + 0.4 * prog;
}

function frame(ts) {
  raf = 0;
  if (!ok) return;
  const t = ts / 1000;
  const dt = reduce ? 0 : Math.min(0.05, Math.max(0, t - t0));
  t0 = t;
  const m = MOODS[mood] || MOODS.step;
  spin += dt * m.spin * (1 + prog * 0.5);
  gem.rotation.y = spin;
  gem.rotation.x = 0.35 + (reduce ? 0 : Math.sin(t * 0.4) * 0.08);
  pop = Math.max(0, pop - dt * 2.5);
  burst = Math.max(0, burst - dt * 0.8);
  grp.scale.setScalar(base * (1 + Math.sin(pop * Math.PI) * 0.12));
  pin += (m.pull - pin) * (reduce ? 1 : Math.min(1, dt * 3));
  const p = dust.geometry.attributes.position.array;
  const tt = reduce ? 0 : t;
  for (let i = 0; i < N; i++) {
    const a = seeds[i * 4] + tt * (0.06 + prog * 0.22) * seeds[i * 4 + 3];
    const r = seeds[i * 4 + 1] * pin * (1 + burst * 1.4);
    p[i * 3] = Math.cos(a) * r;
    p[i * 3 + 1] = seeds[i * 4 + 2] * pin;
    p[i * 3 + 2] = Math.sin(a) * r;
  }
  dust.geometry.attributes.position.needsUpdate = true;
  R.render(scene, cam);
  if (!reduce && !document.hidden) raf = requestAnimationFrame(frame);
}

function kick() {
  if (ok && !raf && !document.hidden) raf = requestAnimationFrame(frame);
}

function start(c) {
  if (ok) return true;
  try {
    if (!c || !window.WebGLRenderingContext) throw new Error('no webgl');
    R = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (e) {
    document.body.classList.add('no3d');
    return false;
  }
  canvas = c;
  R.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  R.setClearColor(0x000000, 0);
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  cam.position.z = 6;
  grp = new THREE.Group();
  scene.add(grp);
  const geo = new THREE.IcosahedronGeometry(1, 0);
  mat = new THREE.MeshStandardMaterial({ color: 0x1c2230, flatShading: true, emissive: ACC, emissiveIntensity: 0 });
  gem = new THREE.Mesh(geo, mat);
  edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: ACC, transparent: true, opacity: 0.55 }));
  edges.scale.setScalar(1.002);
  gem.add(edges);
  grp.add(gem);
  seeds = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    seeds[i * 4] = Math.random() * Math.PI * 2;
    seeds[i * 4 + 1] = 1.5 + Math.random() * 1.3;
    seeds[i * 4 + 2] = (Math.random() - 0.5) * 2.4;
    seeds[i * 4 + 3] = 0.5 + Math.random();
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: ACC, size: 0.028, transparent: true, opacity: 0.45, depthWrite: false }));
  grp.add(dust);
  scene.add(new THREE.HemisphereLight(0xf2f4f8, 0x0b0d12, 0.9));
  const d = new THREE.DirectionalLight(0xf2f4f8, 1.6);
  d.position.set(-2, 3, 4);
  scene.add(d);
  const pl = new THREE.PointLight(ACC, 6, 12);
  pl.position.set(3, -1, 3);
  scene.add(pl);
  ok = true;
  const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  reduce = !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches; kick(); });
  window.addEventListener('resize', layout);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; } else { t0 = performance.now() / 1000; kick(); }
  });
  c.addEventListener('webglcontextlost', function (e) { e.preventDefault(); });
  apply();
  layout();
  return true;
}

function setMood(name) {
  if (!MOODS[name]) name = 'step';
  if (name === 'done' && mood !== 'done') burst = 1;
  mood = name;
  apply();
  layout();
}

function setProgress(v) {
  prog = Math.max(0, Math.min(1, +v || 0));
  apply();
  kick();
}

function pulse() {
  if (!reduce) pop = 1;
  kick();
}

window.PQ3D = { start: start, setMood: setMood, setProgress: setProgress, pulse: pulse };
