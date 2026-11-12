import * as THREE from 'three';

const ACC = 0xFFC53D;
const MOODS = {
  home: { spin: 0.15, pull: 1, dim: 1 },
  scan: { spin: 1.3, pull: 0.55, dim: 1.1 },
  step: { spin: 0.1, pull: 1, dim: 1 },
  done: { spin: 0.35, pull: 1.15, dim: 1.35 },
  quiet: { spin: 0.06, pull: 1, dim: 0.5 }
};
const N = 180;

let started = false, ok = false, reduce = false;
let renderer, scene, camera, root, tilt, gem, mat, edges, glow, dust, dustPos, seeds;
let hemi, dir, acc;
let mood = 'home', progress = 0;
const c = { spin: 0.15, pull: 1, dim: 1 };
let pop = 0, burst = 0, raf = 0, last = 0, t = 0, ang = 0;
let px = 0, py = 0, baseY = 0, baseS = 1;

function layout() {
  const w = window.innerWidth || 1, h = window.innerHeight || 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const hh = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z, hw = hh * camera.aspect;
  if (w <= 640) { root.position.x = 0; baseY = hh * 0.45; baseS = 0.7; }
  else { root.position.x = 0.44 * hw; baseY = 0; baseS = Math.min(1.15, Math.max(0.7, hw * 0.3)); }
}

function applyLook() {
  const p = progress;
  mat.roughness = 0.75 - 0.6 * p;
  mat.metalness = 0.35 + 0.5 * p;
  edges.material.opacity = 0.55 + 0.45 * p;
  glow.material.opacity = Math.min(1, (0.15 + 0.5 * p) * Math.min(c.dim, 1.2));
  hemi.intensity = 0.9 * c.dim;
  dir.intensity = 1.4 * c.dim;
  acc.intensity = (0.8 + 2.2 * p) * c.dim;
  dust.material.opacity = Math.min(1, (0.45 + 0.4 * p) * c.dim);
}

function frame(dt) {
  const m = MOODS[mood] || MOODS.step;
  const k = reduce ? 1 : Math.min(1, dt * 3);
  c.spin += (m.spin - c.spin) * k;
  c.pull += (m.pull - c.pull) * k;
  c.dim += (m.dim - c.dim) * k;
  applyLook();
  if (!reduce) {
    t += dt;
    ang += dt * c.spin;
    pop *= Math.pow(0.02, dt);
    burst *= Math.pow(0.15, dt);
    tilt.rotation.x += (py * 0.15 - tilt.rotation.x) * 0.05;
    tilt.rotation.y += (px * 0.15 - tilt.rotation.y) * 0.05;
    root.position.y = baseY + Math.sin(t * 0.8) * 0.06;
  } else {
    pop = 0; burst = 0;
    root.position.y = baseY;
  }
  gem.rotation.y = ang;
  gem.rotation.x = 0.35 + Math.sin(ang * 0.5) * 0.15;
  root.scale.setScalar(baseS * (1 + 0.12 * pop));
  const sp = 1 + 1.5 * progress, rr = c.pull * (1 + 1.4 * burst);
  for (let i = 0; i < N; i++) {
    const s = seeds[i];
    const a = s.a + t * s.v * sp * (0.6 + c.spin);
    const r = s.r * rr;
    dustPos[i * 3] = Math.cos(a) * r;
    dustPos[i * 3 + 1] = s.y * rr + Math.sin(t * 0.5 + s.a) * 0.08;
    dustPos[i * 3 + 2] = Math.sin(a) * r;
  }
  dust.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

function loop(now) {
  raf = requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  frame(dt);
}
function run() {
  if (!ok) return;
  cancelAnimationFrame(raf);
  if (reduce) { frame(0); return; }
  if (document.hidden) return;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

function fail() {
  ok = false;
  if (document.body) document.body.classList.add('no3d');
  return false;
}

function start(canvas) {
  if (started) return ok;
  started = true;
  try {
    canvas = canvas || document.querySelector('canvas');
    if (!canvas || !window.WebGLRenderingContext) return fail();
    reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 6);
    root = new THREE.Group();
    tilt = new THREE.Group();
    scene.add(root);
    root.add(tilt);

    const geo = new THREE.IcosahedronGeometry(1.25, 0);
    mat = new THREE.MeshStandardMaterial({ color: 0x2A3244, flatShading: true, metalness: 0.35, roughness: 0.75 });
    gem = new THREE.Mesh(geo, mat);
    const eg = new THREE.EdgesGeometry(geo);
    edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: ACC, transparent: true, opacity: 0.55 }));
    glow = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({
      color: ACC, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glow.scale.setScalar(1.015);
    gem.add(edges);
    gem.add(glow);
    tilt.add(gem);

    hemi = new THREE.HemisphereLight(0xffffff, 0x0B0D12, 0.9);
    dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(3, 4, 5);
    acc = new THREE.PointLight(ACC, 0.8, 0, 1);
    acc.position.set(-3, -2, 3);
    scene.add(hemi);
    scene.add(dir);
    root.add(acc);

    seeds = [];
    dustPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      seeds.push({
        a: Math.random() * Math.PI * 2,
        r: 1.7 + Math.random() * 1.3,
        y: (Math.random() - 0.5) * 2.4,
        v: 0.08 + Math.random() * 0.22
      });
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dust = new THREE.Points(dg, new THREE.PointsMaterial({
      color: ACC, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false
    }));
    root.add(dust);

    ok = true;
    layout();
    window.addEventListener('resize', () => { if (ok) { layout(); if (reduce) frame(0); } });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else run();
    });
    if (!reduce) {
      window.addEventListener('pointermove', (e) => {
        px = (e.clientX / (window.innerWidth || 1)) * 2 - 1;
        py = (e.clientY / (window.innerHeight || 1)) * 2 - 1;
      }, { passive: true });
    }
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      fail();
    });
    run();
    return true;
  } catch (e) {
    cancelAnimationFrame(raf);
    return fail();
  }
}

function setMood(name) {
  if (!MOODS[name]) name = 'step';
  if (name === 'done' && mood !== 'done') { burst = 1; pop = 1; }
  mood = name;
  if (ok && reduce) frame(0);
}
function setProgress(p) {
  p = Number(p);
  progress = Math.max(0, Math.min(1, isFinite(p) ? p : 0));
  if (ok && reduce) frame(0);
}
function pulse() {
  pop = 1;
}

function fromState() {
  try {
    const s = window.PQ && window.PQ.app && window.PQ.app.state;
    if (!s) return;
    const d = s.done || {};
    let n = 0;
    for (const k in d) if (d[k]) n++;
    let p = n / 26;
    if (s.scan) p = Math.max(0.08, p);
    setProgress(p);
  } catch (e) { /* ignore */ }
}

document.addEventListener('pq:route', (e) => {
  const n = (e.detail && e.detail.name) || 'home';
  setMood(n === 'home' || n === 'scan' || n === 'step' || n === 'done' ? n : 'quiet');
  fromState();
});

function auto() {
  setTimeout(() => {
    if (!started) start(document.querySelector('canvas'));
    fromState();
  }, 0);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto);
else auto();

window.PQ3D = { start, setMood, setProgress, pulse };
