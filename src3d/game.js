import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.getElementById('game');
const hud = document.getElementById('hud-coins');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start');
const overlayTitle = document.getElementById('overlay-title');
const overlayLine = document.getElementById('overlay-line');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3f2);
scene.fog = new THREE.Fog(0x9fd3f2, 18, 46);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa77, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(6, 12, 8);
scene.add(sun);

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

const loader = new GLTFLoader();
const names = ['character', 'coin', 'platform', 'platform-medium', 'platform-large', 'flag', 'cloud', 'grass'];
const models = {};
const load = (n) => new Promise((res, rej) => loader.load('models/' + n + '.glb', (g) => { models[n] = g.scene; res(); }, undefined, rej));

// Layout: [model, x, y, z]. Platforms run away from the camera (towards -z).
const layout = [
  ['platform-large', 0, 0, 0],
  ['platform-medium', 0, 0.4, -5.5],
  ['platform', 1.5, 0.8, -9],
  ['platform-medium', -0.5, 1.2, -13],
  ['platform', 1.5, 1.2, -17.5],
  ['platform-large', 0, 1.6, -22.5],
];
const coinSpots = [[0, 1, -2], [0, 1.4, -5.5], [1.5, 1.8, -9], [-0.5, 2.2, -13], [1.5, 2.2, -17.5], [-1, 2.6, -21.5], [1, 2.6, -22.5]];

const boxes = [];
const coins = [];
let flagObj = null;
const player = { pos: new THREE.Vector3(0, 1, 0), vel: new THREE.Vector3(), onGround: false, jumps: 0, mesh: null };
let got = 0, state = 'menu', startedAt = 0;

function build() {
  for (const [m, x, y, z] of layout) {
    const o = models[m].clone();
    o.position.set(x, y, z);
    scene.add(o);
    o.updateMatrixWorld(true);
    boxes.push(new THREE.Box3().setFromObject(o));
  }
  for (const [x, y, z] of coinSpots) {
    const c = models.coin.clone();
    c.position.set(x, y, z);
    scene.add(c);
    coins.push({ obj: c, taken: false });
  }
  const last = layout[layout.length - 1];
  flagObj = models.flag.clone();
  flagObj.position.set(last[1], last[2] + 0.55, last[3] - 1.5);
  scene.add(flagObj);
  const cl = [[-6, 5, -8], [7, 6, -16], [-7, 5, -24], [6, 6, 4]];
  for (const [x, y, z] of cl) { const c = models.cloud.clone(); c.position.set(x, y, z); scene.add(c); }
  player.mesh = models.character.clone();
  scene.add(player.mesh);
  reset();
}

function reset() {
  player.pos.set(0, 1.2, 0);
  player.vel.set(0, 0, 0);
  player.jumps = 0;
}

const keys = {};
addEventListener('keydown', (e) => { keys[e.code] = true; if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault(); if (e.code === 'Space') jump(); });
addEventListener('keyup', (e) => { keys[e.code] = false; });
function jump() {
  if (state !== 'play') return;
  if (player.onGround || player.jumps < 2) {
    player.vel.y = 7.2;
    player.jumps = player.onGround ? 1 : player.jumps + 1;
    player.onGround = false;
  }
}
const touch = { l: false, r: false, f: false, b: false };
for (const el of document.querySelectorAll('[data-hold]')) {
  const k = el.dataset.hold;
  const on = (e) => { e.preventDefault(); touch[k] = true; el.classList.add('down'); };
  const off = (e) => { e.preventDefault(); touch[k] = false; el.classList.remove('down'); };
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', off);
  el.addEventListener('pointerleave', off);
  el.addEventListener('pointercancel', off);
}
document.getElementById('jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });

function step(dt) {
  const ax = (keys.ArrowRight || keys.KeyD || touch.r ? 1 : 0) - (keys.ArrowLeft || keys.KeyA || touch.l ? 1 : 0);
  const az = (keys.ArrowDown || keys.KeyS || touch.b ? 1 : 0) - (keys.ArrowUp || keys.KeyW || touch.f ? 1 : 0);
  const speed = 4.2;
  player.vel.x = ax * speed;
  player.vel.z = az * speed;
  player.vel.y -= 20 * dt;
  const prevY = player.pos.y;
  player.pos.addScaledVector(player.vel, dt);
  player.onGround = false;
  for (const b of boxes) {
    const inside = player.pos.x > b.min.x - 0.25 && player.pos.x < b.max.x + 0.25 && player.pos.z > b.min.z - 0.25 && player.pos.z < b.max.z + 0.25;
    if (inside && player.vel.y <= 0 && prevY >= b.max.y - 0.15 && player.pos.y <= b.max.y) {
      player.pos.y = b.max.y;
      player.vel.y = 0;
      player.onGround = true;
      player.jumps = 0;
    }
  }
  if (player.pos.y < -8) reset();
  if (ax || az) {
    const target = Math.atan2(player.vel.x, player.vel.z);
    let d = target - player.mesh.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    player.mesh.rotation.y += d * Math.min(1, dt * 14);
  }
  player.mesh.position.copy(player.pos);
  for (const c of coins) {
    if (c.taken) continue;
    c.obj.rotation.y += dt * 3;
    if (c.obj.position.distanceTo(player.pos.clone().setY(player.pos.y + 0.5)) < 0.75) {
      c.taken = true;
      c.obj.visible = false;
      got++;
      hud.textContent = got + ' / ' + coins.length;
    }
  }
  if (flagObj.position.distanceTo(player.pos) < 1.4) win();
}

function win() {
  state = 'won';
  const secs = ((performance.now() - startedAt) / 1000).toFixed(1);
  overlayTitle.textContent = 'Finished';
  overlayLine.textContent = got + ' of ' + coins.length + ' coins in ' + secs + ' seconds';
  startBtn.textContent = 'Play again';
  overlay.hidden = false;
}

function begin() {
  for (const c of coins) { c.taken = false; c.obj.visible = true; }
  got = 0;
  hud.textContent = '0 / ' + coins.length;
  reset();
  startedAt = performance.now();
  state = 'play';
  overlay.hidden = true;
}
startBtn.addEventListener('click', begin);

let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  if (state === 'play') step(dt);
  else if (player.mesh) { player.mesh.position.copy(player.pos); player.mesh.rotation.y += dt * 0.8; }
  const cx = player.pos.x * 0.6, cy = player.pos.y + 3.2, cz = player.pos.z + 6.5;
  camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 4));
  camera.lookAt(player.pos.x * 0.8, player.pos.y + 0.8, player.pos.z - 3);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

Promise.all(names.map(load)).then(() => {
  build();
  resize();
  window.__game = { player, boxes, coins, get state() { return state; }, begin, models };
  document.body.classList.add('ready');
  requestAnimationFrame(frame);
}).catch((e) => { overlayTitle.textContent = 'Could not load'; overlayLine.textContent = String(e && e.message || e); });
