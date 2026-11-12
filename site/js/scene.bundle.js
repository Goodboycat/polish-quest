(function () {
  'use strict';
  var S = { p: 0, mood: 'home', pt: -1e9, burst: 1 };
  var base = document.currentScript && document.currentScript.src || location.href;
  window.PQ3D = {
    setProgress: function (p) { S.p = Math.max(0, Math.min(1, +p || 0)); },
    setMood: function (m) { if (m === 'done' && S.mood !== 'done') S.burst = 1.8; S.mood = m || 'quiet'; },
    pulse: function () { S.pt = performance.now(); },
    start: function () {}
  };
  function count(d) {
    if (!d) return 0;
    if (Array.isArray(d)) return d.filter(Boolean).length;
    return Object.keys(d).filter(function (k) { return d[k]; }).length;
  }
  var MAP = { home: 'home', scan: 'scan', step: 'step', done: 'done' };
  document.addEventListener('pq:route', function (e) {
    var n = e.detail && e.detail.name;
    PQ3D.setMood(MAP[n] || 'quiet');
    try { PQ3D.setProgress(count(window.PQ.app.state.done) / 26); } catch (x) {}
  });
  function no3d() { if (document.body) document.body.classList.add('no3d'); }
  function init(T) {
    var c = document.querySelector('canvas');
    if (!c) { c = document.createElement('canvas'); c.id = 'pq3d'; document.body.insertBefore(c, document.body.firstChild); }
    c.setAttribute('aria-hidden', 'true');
    var cs = c.style;
    cs.position = 'fixed'; cs.left = '0'; cs.top = '0'; cs.width = '100vw'; cs.height = '100vh';
    cs.zIndex = '0'; cs.pointerEvents = 'none';
    var r;
    try { r = new T.WebGLRenderer({ canvas: c, alpha: true, antialias: true }); } catch (e) { no3d(); return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, .1, 50);
    cam.position.z = 7;
    var g = new T.Group(); scene.add(g);
    var geo = new T.IcosahedronGeometry(1.25, 0);
    var mat = new T.MeshStandardMaterial({ color: 0x1C2230, flatShading: true, roughness: .9, metalness: .2 });
    var gem = new T.Mesh(geo, mat); g.add(gem);
    var em = new T.LineBasicMaterial({ color: 0xFFC53D, transparent: true, opacity: .35 });
    gem.add(new T.LineSegments(new T.EdgesGeometry(geo), em));
    var N = 180, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var u = Math.random() * 2 - 1, a = Math.random() * 6.283, rad = 1.9 + Math.random() * 1.3, q = Math.sqrt(1 - u * u);
      pos[i * 3] = rad * q * Math.cos(a); pos[i * 3 + 1] = rad * u; pos[i * 3 + 2] = rad * q * Math.sin(a);
    }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    var pts = new T.Points(pg, new T.PointsMaterial({ color: 0xFFC53D, size: .03, transparent: true, opacity: .6 }));
    g.add(pts);
    scene.add(new T.AmbientLight(0xffffff, .5));
    var dl = new T.DirectionalLight(0xFFC53D, 1.2); dl.position.set(3, 4, 5); scene.add(dl);
    var phone = false, bs = 1;
    function size() {
      var w = window.innerWidth, h = window.innerHeight || 1;
      r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
      phone = w < 720; bs = phone ? .7 : 1;
      g.position.set(phone ? 0 : 2.1, phone ? 1.6 : 0, 0);
    }
    size(); window.addEventListener('resize', size);
    var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var SP = { home: .15, scan: 1.2, step: .25, done: .6, quiet: .08 };
    var spin = .15, dsp = .05, ds = 1, op = phone ? .35 : 1, last = 0, raf = 0;
    function frame(t) {
      raf = 0;
      if (document.hidden) return;
      var dt = Math.min(.05, (t - last) / 1000 || 0); last = t;
      var k = 1 - Math.exp(-dt * 4), m = S.mood, p = S.p, rm = mq.matches ? .1 : 1;
      spin += ((SP[m] || .08) - spin) * k;
      mat.roughness += (.9 - .75 * p - mat.roughness) * k;
      mat.metalness += (.2 + .6 * p - mat.metalness) * k;
      em.opacity += ((m === 'done' ? 1 : .35 + .55 * p) - em.opacity) * k;
      dsp += (.05 + .25 * p - dsp) * k;
      S.burst += (1 - S.burst) * k * .4;
      ds += ((m === 'scan' ? .6 : 1) * S.burst - ds) * k;
      op += ((m === 'quiet' ? (phone ? .2 : .25) : (phone ? .35 : 1)) - op) * k;
      cs.opacity = op.toFixed(3);
      gem.rotation.y += spin * dt * rm; gem.rotation.x += spin * .3 * dt * rm;
      pts.rotation.y += dsp * dt * rm; pts.scale.setScalar(ds);
      var e = (t - S.pt) / 350;
      g.scale.setScalar(bs * (e >= 0 && e < 1 ? 1 + .12 * Math.sin(Math.PI * e) : 1));
      r.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    function go() { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    document.addEventListener('visibilitychange', go);
    go();
  }
  function boot() {
    var u;
    try { u = new URL('vendor/three.module.min.js', base).href; } catch (e) { no3d(); return; }
    import(u).then(function (m) {
      window.THREE = m;
      try { init(m); } catch (e) { no3d(); }
    }).catch(no3d);
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
