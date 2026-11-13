import * as THREE from 'three';

const ACC = 0xffc53d;
const MOODS = {
  home: { spin: 0.18, pull: 1 },
  scan: { spin: 1.1, pull: 0.55 },
  step: { spin: 0.1, pull: 1 },
  done: { spin: 0.3, pull: 1.15 },
  quiet: { spin: 0.05, pull: 1 },
  rating: { spin: 0.22, pull: 0.2 }
};
const N = 180;
let R, scene, cam, grp, gem, mat, edges, dust, seeds, canvas, glow, colAttr, glowAttr;
const NF = 20, NA = 7;
let areaT = null, areaC = new Float32Array(NF), focusA = -1, focusV = 0;
let raf = 0, mood = 'home', prog = 0, pop = 0, burst = 0, t0 = 0, spin = 0, pin = 1, base = 1, ok = false, reduce = false;

function layout() {
  if (!ok) return;
  const w = window.innerWidth || 1, h = window.innerHeight || 1;
  R.setSize(w, h, false);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();
  const vh = 2 * 6 * Math.tan((20 * Math.PI) / 180), vw = vh * cam.aspect;
  const phone = w < 640;
  const fe = mood === 'rating' ? document.querySelector('#screen > .frame') : null;
  if (mood === 'rating') {
    const gut = fe ? w - fe.getBoundingClientRect().right : 0, ppu = h / vh;
    if (phone || gut < 170) { canvas.style.opacity = '0'; base = 0.0001; }
    else {
      const rad = Math.min(gut * 0.34, 120), cx = w - gut / 2, cy = h * 0.46;
      grp.position.set((cx / w - 0.5) * vw, (0.5 - cy / h) * vh, 0); base = rad / ppu; canvas.style.opacity = '1';
    }
    kick(); return;
  }
  if (phone) { grp.position.set(0, vh / 2 - 0.7, 0); base = 0.6; }
  else { grp.position.set(vw * 0.24, 0, 0); base = 1; }
  canvas.style.opacity = phone ? '0.22' : (mood === 'quiet' ? '0.5' : '1');
  kick();
}

const DULL = new THREE.Color(0x1c2230), GOLD = new THREE.Color(0xd9a02f);
function apply() {
  if (!ok) return;
  if (areaT) { mat.color.set(0xffffff); mat.roughness = 0.45; mat.metalness = 0.35; mat.emissiveIntensity = 0; }
  else {
    mat.color.copy(DULL).lerp(GOLD, Math.min(1, prog * 1.15));
    mat.roughness = 0.9 - 0.7 * prog;
    mat.metalness = 0.2 + 0.7 * prog;
    mat.emissiveIntensity = prog * 0.08 + (mood === 'done' ? 0.18 : 0);
  }
  if (glow) glow.visible = !!areaT;
  if (dust) dust.visible = mood !== 'rating';
  edges.material.opacity = areaT ? 0.9 : 0.55 + 0.45 * prog;
  dust.material.opacity = 0.45 + 0.4 * prog;
}

const SLATE = new THREE.Color(0x2c3550), LIT = new THREE.Color(0xffc53d), TMP = new THREE.Color();
function paintFaces(dt) {
  if (!colAttr) return false;
  let moving = false;
  focusV = Math.max(0, focusV - dt * 1.6);
  for (let f = 0; f < NF; f++) {
    const a = f % NA, tgt = areaT ? Math.max(0, Math.min(1, areaT[a] / 10)) : 0;
    areaC[f] += (tgt - areaC[f]) * (reduce ? 1 : Math.min(1, dt * 2.2));
    if (Math.abs(tgt - areaC[f]) > 0.004) moving = true; else areaC[f] = tgt;
    const fl = a === focusA ? focusV : 0;
    if (areaT) {
      TMP.copy(SLATE).lerp(LIT, Math.min(1, areaC[f] * 0.95 + fl * 0.3));
      TMP.multiplyScalar(1 + fl * 0.5);
    } else TMP.set(0xffffff);
    for (let v = 0; v < 3; v++) colAttr.setXYZ(f * 3 + v, TMP.r, TMP.g, TMP.b);
    const g = areaT ? Math.min(1, Math.pow(areaC[f], 1.15) * 1.0 + fl * 0.6) : 0;
    for (let v = 0; v < 3; v++) glowAttr.setXYZ(f * 3 + v, 1.0 * g, 0.72 * g, 0.18 * g);
  }
  colAttr.needsUpdate = true; glowAttr.needsUpdate = true;
  return moving || focusV > 0;
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
  const busy = paintFaces(dt);
  R.render(scene, cam);
  if ((!reduce || busy) && !document.hidden) raf = requestAnimationFrame(frame);
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
  const ca = new Float32Array(NF * 9).fill(1);
  colAttr = new THREE.BufferAttribute(ca, 3); geo.setAttribute('color', colAttr);
  mat = new THREE.MeshStandardMaterial({ color: 0x1c2230, flatShading: true, emissive: ACC, emissiveIntensity: 0, vertexColors: true });
  gem = new THREE.Mesh(geo, mat);
  edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: ACC, transparent: true, opacity: 0.55 }));
  edges.scale.setScalar(1.002);
  gem.add(edges);
  const ggeo = geo.clone(); glowAttr = new THREE.BufferAttribute(new Float32Array(NF * 9), 3); ggeo.setAttribute('color', glowAttr);
  glow = new THREE.Mesh(ggeo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(1.004); glow.visible = false; gem.add(glow);
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
  const pl = new THREE.PointLight(ACC, 5, 12);
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

function setAreas(a) {
  areaT = Array.isArray(a) && a.length >= NA ? a.slice(0, NA).map(function (x) { return +x || 0; }) : null;
  if (!areaT) areaC.fill(0);
  apply();
  kick();
}

function focusArea(i) {
  if (!areaT || reduce) return;
  focusA = i; focusV = 1;
  kick();
}

function pulse() {
  if (!reduce) pop = 1;
  kick();
}

window.PQ3D = { start: start, setMood: setMood, setProgress: setProgress, pulse: pulse, setAreas: setAreas, focusArea: focusArea };
