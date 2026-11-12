// Polish Quest 3D gem. Bundled by `npm run build:3d` into site/js/scene.bundle.js.
// NOTE for the planner: the task asked to load Three.js from jsdelivr/unpkg.
// That breaks the hard rules (CSP script-src 'self', no external CDN), so Three
// is bundled from the installed 'three' package instead. No /js/vendor/ request
// is made anywhere. Pixel ratio is capped at 1.5 per the hard rules (not 2).
import * as THREE from 'three';

(function () {
  var W = window, D = document;
  var S = { mood: 'home', p: 0, pulseAt: -1, burst: 1, ready: false, started: false };
  var SPIN = { home: 0.15, scan: 1.2, step: 0.1, done: 0.4, quiet: 0.05 };
  var R, scene, cam, gem, edges, dust, group, mat, emat, cv;
  var raf = 0, last = 0, firstFrame = false, dustR = 1, spinNow = 0.15, rough = 0.85, eop = 0.55;
  var reduce = false;

  function body(fn) { try { if (D.body) fn(D.body); } catch (e) {} }
  function no3d(on) { body(function (b) { b.classList[on ? 'add' : 'remove']('no3d'); }); }
  function clamp(v) { v = +v; return v !== v ? 0 : Math.max(0, Math.min(1, v)); }
  function phone() { return W.innerWidth < 800; }

  function targets() {
    var p = S.p, m = S.mood;
    return {
      rough: 0.85 - 0.7 * p,
      eop: m === 'done' ? 1 : 0.55 + 0.45 * p,
      spin: SPIN[m] != null ? SPIN[m] : 0.05,
      dustR: m === 'scan' ? 0.6 : 1,
      op: Math.min(phone() ? 0.35 : 1, m === 'quiet' ? 0.4 : 1)
    };
  }

  function layout() {
    if (!R) return;
    var w = W.innerWidth || 1, h = W.innerHeight || 1;
    R.setPixelRatio(Math.min(W.devicePixelRatio || 1, 1.5));
    R.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    if (phone()) { group.position.set(0, 1.5, 0); group.userData.s = 0.7; }
    else { group.position.set(1.9, 0, 0); group.userData.s = 1; }
  }

  function draw(now, dt, snap) {
    var t = targets(), k = snap ? 1 : Math.min(1, dt * 3);
    rough += (t.rough - rough) * k;
    eop += (t.eop - eop) * k;
    spinNow += (t.spin - spinNow) * k;
    dustR += (t.dustR - dustR) * k;
    S.burst += (1 - S.burst) * (snap ? 1 : Math.min(1, dt * 2));
    mat.roughness = rough;
    emat.opacity = eop;
    cv.style.opacity = String(t.op);
    if (!snap) {
      gem.rotation.y += spinNow * dt;
      gem.rotation.x += spinNow * 0.35 * dt;
      dust.rotation.y -= 0.08 * (1 + 2 * S.p) * dt;
      dust.rotation.z += 0.03 * (1 + 2 * S.p) * dt;
    }
    var pop = 1;
    if (S.pulseAt >= 0 && !snap) {
      var u = (now - S.pulseAt) / 350;
      if (u >= 1) S.pulseAt = -1; else pop = 1 + 0.12 * Math.sin(Math.PI * u);
    }
    var s = (group.userData.s || 1) * pop;
    gem.scale.setScalar(s);
    dust.scale.setScalar((group.userData.s || 1) * dustR * S.burst);
    R.render(scene, cam);
    if (!firstFrame) { firstFrame = true; no3d(false); }
  }

  function tick(now) {
    raf = 0;
    if (!S.ready || D.hidden || reduce) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    try { draw(now, dt, false); } catch (e) { fail(); return; }
    raf = W.requestAnimationFrame(tick);
  }

  function run() {
    if (!S.ready) return;
    if (reduce) { try { draw(0, 0, true); } catch (e) { fail(); } return; }
    if (!raf && !D.hidden) { last = W.performance.now(); raf = W.requestAnimationFrame(tick); }
  }

  function fail() {
    S.ready = false;
    if (raf) { W.cancelAnimationFrame(raf); raf = 0; }
    no3d(true);
    try { if (cv) cv.style.display = 'none'; } catch (e) {}
  }

  function init(canvas) {
    if (S.started) return;
    cv = canvas || D.querySelector('canvas[data-3d]') || D.querySelector('canvas');
    if (!cv) return;
    S.started = true;
    no3d(true);
    try {
      var st = cv.style;
      st.position = 'fixed'; st.top = '0'; st.left = '0'; st.right = '0'; st.bottom = '0';
      st.width = '100vw'; st.height = '100dvh'; st.zIndex = '0'; st.pointerEvents = 'none';
      st.transition = 'opacity .6s ease';
      cv.setAttribute('aria-hidden', 'true');
      var mq = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null;
      reduce = !!(mq && mq.matches);
      if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches; run(); });

      R = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true });
      R.setClearColor(0x000000, 0);
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
      cam.position.z = 6;

      group = new THREE.Group();
      scene.add(group);
      var geo = new THREE.IcosahedronGeometry(1.25, 0);
      mat = new THREE.MeshStandardMaterial({ color: 0x1C2230, flatShading: true, metalness: 0.6, roughness: 0.85 });
      gem = new THREE.Mesh(geo, mat);
      emat = new THREE.LineBasicMaterial({ color: 0xFFC53D, transparent: true, opacity: 0.55 });
      edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), emat);
      edges.scale.setScalar(1.002);
      gem.add(edges);
      group.add(gem);

      var n = 180, pos = new Float32Array(n * 3);
      for (var i = 0; i < n; i++) {
        var r = 1.9 + Math.random() * 1.3, a = Math.random() * Math.PI * 2, z = Math.random() * 2 - 1;
        var q = Math.sqrt(1 - z * z);
        pos[i * 3] = r * q * Math.cos(a);
        pos[i * 3 + 1] = r * z * 0.7;
        pos[i * 3 + 2] = r * q * Math.sin(a);
      }
      var dg = new THREE.BufferGeometry();
      dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xFFC53D, size: 0.03, transparent: true, opacity: 0.5, depthWrite: false }));
      group.add(dust);

      var dl = new THREE.DirectionalLight(0xffffff, 1.2);
      dl.position.set(2, 3, 4);
      scene.add(dl);
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));

      gem.rotation.set(0.4, 0.6, 0);
      layout();
      var t = targets();
      rough = t.rough; eop = t.eop; spinNow = t.spin; dustR = t.dustR;
      S.ready = true;
      draw(0, 0, true);

      W.addEventListener('resize', function () { try { layout(); if (reduce || D.hidden) draw(0, 0, true); } catch (e) {} });
      D.addEventListener('visibilitychange', function () {
        if (D.hidden) { if (raf) { W.cancelAnimationFrame(raf); raf = 0; } } else run();
      });
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fail(); });
      run();
    } catch (e) { fail(); }
  }

  W.PQ3D = {
    start: function (c) { try { init(c); } catch (e) { fail(); } },
    setProgress: function (p) { try { S.p = clamp(p); if (reduce) run(); } catch (e) {} },
    setMood: function (m) {
      try {
        m = SPIN[m] != null ? m : 'quiet';
        if (m === S.mood) return;
        S.mood = m;
        if (m === 'done') S.burst = 1.8;
        if (reduce) run();
      } catch (e) {}
    },
    pulse: function () { try { if (!reduce) S.pulseAt = W.performance.now(); } catch (e) {} }
  };

  // Idempotent: harmless if the app also calls setMood itself.
  D.addEventListener('pq:route', function (e) {
    var n = e && e.detail && e.detail.name;
    W.PQ3D.setMood(n === 'home' || n === 'scan' || n === 'step' || n === 'done' ? n : 'quiet');
  });

  function auto() { no3d(true); if (!S.started) W.PQ3D.start(); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto);
  else auto();
})();
