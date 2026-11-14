/* Hand pointer. A hand image, a ring around the target and a short label.
   API: PQ.guide.point(sel, {text, ms}), PQ.guide.sequence([{sel, text, ms}]), PQ.guide.replay(), PQ.guide.stop() */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var HAND_W = 44, HAND_H = 76, TIP_X = 5;    /* hand.png is 98x169 with the fingertip 12px from the left edge: 44px wide shows it at 5px */
  var PAD = 6, GAP = 12;                       /* the hand stays 12px clear of the target */
  var hand, img, ring, label, ripple;
  var items = [], idx = -1, active = false, target = null, tries = 0;
  var tRetry = 0, tAdv = 0, tPoll = 0, tRoute = 0;
  var lastTour = null;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { reduce = e.matches; });

  /* motion state: cur = where the hand is drawn, goal = where it should end up */
  var cur = { x: 0, y: 0, rot: 0, has: false }, goal = { x: 0, y: 0, flip: false };
  var mv = null, tapT0 = 0, tapNext = 0, pressed = false, raf = 0, lastTs = 0, lastSpark = 0;
  var lblRel = { dx: HAND_W + 8, dy: 0, w: 60, h: 32 };
  var sparks = [], MAXS = 44;

  function easeBack(t) {                        /* wind-up, fast move, overshoot, settle: the cartoon feel */
    var c1 = 1.9, c2 = c1 * 1.525;
    return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }
  function elastic(t) { return t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function build() {
    if (hand) return;
    hand = document.createElement('div');
    hand.className = 'pq-hand';
    hand.setAttribute('aria-hidden', 'true');
    img = document.createElement('img');
    img.className = 'pq-hand-img';
    img.src = 'assets/art/hand.png?v=3d';
    img.alt = '';
    img.width = HAND_W;
    img.height = HAND_H;
    hand.appendChild(img);
    ring = document.createElement('div');
    ring.className = 'pq-ring';
    ring.setAttribute('aria-hidden', 'true');
    label = document.createElement('div');
    label.className = 'pq-label';
    label.setAttribute('aria-hidden', 'true');
    ripple = document.createElement('div');
    ripple.className = 'pq-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    document.body.appendChild(ripple);
    for (var i = 0; i < MAXS; i++) {
      var d = document.createElement('i');
      d.className = 'pq-spark';
      d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d);
      sparks.push({ el: d, life: 0, max: 1, x: 0, y: 0, vx: 0, vy: 0, g: 0, r: 0, vr: 0, s: 1 });
    }
    document.body.appendChild(hand);
    document.body.appendChild(label);
  }

  function emit(x, y, vx, vy, g, size, life) {
    var best = null, i;
    for (i = 0; i < sparks.length; i++) { if (sparks[i].life <= 0) { best = sparks[i]; break; } }
    if (!best) best = sparks[0];
    best.x = x; best.y = y; best.vx = vx; best.vy = vy; best.g = g; best.s = size; best.max = best.life = life;
    best.r = Math.random() * 90; best.vr = (Math.random() - 0.5) * 360;
    best.el.classList.toggle('pale', Math.random() < 0.45);
  }
  function tip(x, y) { return { x: x + (goal.flip ? HAND_W - TIP_X : TIP_X), y: y + (goal.flip ? HAND_H : 0) }; }

  function burst() {
    if (reduce) return;
    var t = tip(cur.x, cur.y), n = 11, i;
    for (i = 0; i < n; i++) {
      var a = (Math.PI * 2 * i) / n + Math.random() * 0.4, sp = 30 + Math.random() * 30;
      emit(t.x, t.y, Math.cos(a) * sp, Math.sin(a) * sp - 10, 120, 6 + Math.random() * 4, 0.35 + Math.random() * 0.2);
    }
  }

  function press(on) {
    if (!target) return;
    var r = target.getBoundingClientRect();
    if (r.width > 520) return;                   /* a wide group is not a button */
    target.classList.toggle('pq-press', on);
  }

  function startTap(ts) {
    tapT0 = ts; pressed = false;
    if (!reduce) { var t = tip(cur.x, cur.y); ripple.style.transform = 'translate(' + (t.x - 18) + 'px,' + (t.y - 18) + 'px)'; }
  }

  function frame(ts) {
    raf = 0;
    if (!active || !hand) return;
    var dt = Math.min(0.05, Math.max(0.001, (ts - (lastTs || ts)) / 1000)); lastTs = ts;
    var x = cur.x, y = cur.y, sx = 1, sy = 1, rotT = 0, i;
    if (mv) {
      var p = clamp((ts - mv.t0) / mv.dur, 0, 1), e = reduce ? p : easeBack(p), arcv = reduce ? 0 : Math.sin(Math.PI * p) * mv.arc;
      x = mv.x0 + (mv.x1 - mv.x0) * e + mv.nx * arcv;
      y = mv.y0 + (mv.y1 - mv.y0) * e + mv.ny * arcv;
      var vx = (x - cur.x) / dt, vy = (y - cur.y) / dt, sp = Math.sqrt(vx * vx + vy * vy);
      rotT = clamp(vx * 0.025, -22, 22);
      var st = clamp(sp / 3200, 0, 0.22);
      sy = 1 + st; sx = 1 - st * 0.5;
      if (!reduce && ts - lastSpark > 26 && sp > 120 && !(items[idx] && items[idx].noring)) {
        lastSpark = ts;
        var t0 = tip(x, y);
        emit(t0.x + (Math.random() - 0.5) * 6, t0.y + (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 30 - vx * 0.01, 5 + Math.random() * 15, 150, 6 + Math.random() * 4, 0.25 + Math.random() * 0.2);
      }
      if (p >= 1) { mv = null; tapNext = ts + 380; }
    } else if (!reduce) {
      /* resting: a small float, then a tap every 1.5 seconds */
      y += Math.sin(ts / 280) * 2.5;
      if (!tapT0 && ts >= tapNext) startTap(ts);
      if (tapT0) {
        var u = ts - tapT0, dir = goal.flip ? 1 : -1;
        if (u < 140) { var k = 1 - Math.pow(1 - u / 140, 3); y += dir * 11 * k; sy = 1 - 0.1 * k; sx = 1 + 0.06 * k; }
        else {
          if (!pressed) { pressed = true; press(true); burst(); ripple.classList.remove('go'); void ripple.offsetWidth; ripple.classList.add('go'); setTimeout(function () { press(false); }, 230); }
          var k2 = elastic((u - 140) / 420);
          y += dir * 11 * (1 - k2); sy = 1 - 0.1 * (1 - k2); sx = 1 + 0.06 * (1 - k2);
          if (u > 560) { tapT0 = 0; tapNext = ts + 1000; }
        }
      }
    } else if (!tapT0 && ts >= tapNext) { tapT0 = ts; pressed = false; }
    else if (tapT0 && ts - tapT0 > 140 && !pressed) { pressed = true; press(true); setTimeout(function () { press(false); }, 230); tapT0 = 0; tapNext = ts + 1500; }

    cur.rot += (rotT - cur.rot) * Math.min(1, dt * 14);
    var posX = mv ? x : cur.x, posY = mv ? y : cur.y;
    if (mv) { cur.x = x; cur.y = y; } else { cur.x = goal.x; cur.y = goal.y; posX = cur.x; posY = cur.y + (y - cur.y); }
    var ox = goal.flip ? HAND_W - TIP_X : TIP_X, oy = goal.flip ? HAND_H : 0;
    hand.style.transformOrigin = ox + 'px ' + oy + 'px';
    hand.style.transform = 'translate(' + posX + 'px,' + posY + 'px) rotate(' + cur.rot + 'deg) scale(' + sx + ',' + sy + ')';

    /* the label rides beside the hand with a short lag (CSS), kept inside the screen */
    var vw = window.innerWidth, vh = window.innerHeight, maxR = vw - 8 - (vw <= 640 ? 76 : 0);
    var lx = clamp(posX + lblRel.dx, 8, Math.max(8, maxR - lblRel.w)), ly = clamp(posY + lblRel.dy, 64, Math.max(64, vh - lblRel.h - 8));
    label.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';

    var any = false;
    for (i = 0; i < sparks.length; i++) {
      var q = sparks[i];
      if (q.life <= 0) continue;
      q.life -= dt;
      if (q.life <= 0) { q.el.style.opacity = '0'; continue; }
      any = true;
      q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt;
      var f = q.life / q.max;
      q.el.style.opacity = String(Math.min(1, f * 1.6));
      q.el.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px) rotate(' + q.r + 'deg) scale(' + (q.s / 10) * (0.4 + f * 0.6) + ')';
    }
    raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && active) { lastTs = 0; raf = requestAnimationFrame(frame); } }

  function moveTo(nx, ny, flip) {
    var first = !cur.has;
    goal.flip = flip;
    if (first) { cur.x = nx + 90; cur.y = ny + 140; cur.has = true; cur.rot = 0; }
    var dx = nx - cur.x, dy = ny - cur.y, dist = Math.sqrt(dx * dx + dy * dy);
    goal.x = nx; goal.y = ny;
    if (dist < 2) return;
    hand.classList.toggle('flip', flip);
    if (dist < 40 && !first) { cur.x = nx; cur.y = ny; return; }  /* a scroll nudge: just follow */
    var nxn = dist ? -dy / dist : 0, nyn = dist ? dx / dist : 0;
    var side = (dx >= 0 ? 1 : -1);
    mv = { x0: cur.x, y0: cur.y, x1: nx, y1: ny, t0: performance.now(), dur: reduce ? 1 : clamp(420 + dist * 0.8, 420, 1050), arc: Math.min(70, dist * 0.2) * side, nx: nxn, ny: nyn };
    tapT0 = 0; pressed = false; press(false);
    kick();
  }

  function hide() {
    document.body.classList.remove('pq-guiding');
    if (hand) hand.classList.remove('on');
    if (ring) ring.classList.remove('on');
    if (label) label.classList.remove('on');
  }

  function onClick() { next(); }

  function dropTarget() {
    if (target) { target.removeEventListener('click', onClick); target.classList.remove('pq-press'); target = null; }
  }

  function place() {
    if (!active || idx < 0 || !items[idx]) return;
    var it = items[idx], t = null;
    try { t = document.querySelector(it.sel); } catch (e) { t = null; }
    var r = t ? t.getBoundingClientRect() : null;
    if (!t || !r.width || !r.height) {
      hide();
      dropTarget();
      if (!tRetry) {
        tRetry = setTimeout(function () {
          tRetry = 0;
          if (!active) return;
          tries++;
          if (tries >= 10) next(); else place();
        }, 200);
      }
      return;
    }
    tries = 0;
    if (t !== target) {
      dropTarget();
      target = t;
      t.addEventListener('click', onClick);
      /* a target that is off screen would give a misleading hand, so bring it into view first */
      if (r.bottom > window.innerHeight - 8 || r.top < 64) {
        try { t.scrollIntoView({ block: 'nearest' }); } catch (e) { /* old browser */ }
        r = t.getBoundingClientRect();
      }
    }
    if (!tAdv) tAdv = setTimeout(next, it.ms || 4500);

    var vw = window.innerWidth, vh = window.innerHeight;
    var rl = r.left - PAD, rt = r.top - PAD, rw = r.width + PAD * 2, rh = r.height + PAD * 2;
    ring.style.transform = 'translate(' + rl + 'px,' + rt + 'px)';
    ring.style.width = rw + 'px';
    ring.style.height = rh + 'px';

    var cx = r.left + r.width / 2;
    var flip = r.bottom + GAP + HAND_H > vh - 8;      /* no room below: hand sits above, 12px clear, and points down */
    var hx, hy;
    if (!flip) { hx = cx - TIP_X; hy = r.bottom + GAP; }
    else { hx = cx - (HAND_W - TIP_X); hy = r.top - GAP - HAND_H; }
    hx = Math.max(4, Math.min(hx, vw - HAND_W - 4));

    label.textContent = it.text || '';
    var lw = label.offsetWidth, lh = label.offsetHeight;
    var rightFits = hx + HAND_W + 8 + lw <= vw - 8 - (vw <= 640 ? 76 : 0);
    lblRel = { dx: rightFits ? HAND_W + 8 : -(lw + 8), dy: (HAND_H - lh) / 2, w: lw, h: lh };

    if (r.width > 520 || it.noring) ring.classList.remove('on'); else ring.classList.add('on');
    hand.classList.add('on');
    document.body.classList.add('pq-guiding');
    if (it.text) label.classList.add('on'); else label.classList.remove('on');
    moveTo(hx, hy, flip);
  }

  function clearStepTimers() {
    clearTimeout(tRetry); tRetry = 0;
    clearTimeout(tAdv); tAdv = 0;
  }

  function next() {
    if (!active) return;
    clearStepTimers();
    dropTarget();
    idx++;
    tries = 0;
    if (idx >= items.length) { stop(); return; }
    place();                                       /* the hand glides to the next target, it does not blink out */
  }

  function stop() {
    active = false;
    clearStepTimers();
    clearInterval(tPoll); tPoll = 0;
    window.removeEventListener('resize', place);
    document.removeEventListener('scroll', place, true);
    dropTarget();
    hide();
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    mv = null; tapT0 = 0; cur.has = false; pressed = false;
    sparks.forEach(function (q) { q.life = 0; q.el.style.opacity = '0'; });
    items = []; idx = -1;
  }

  function sequence(list) {
    stop();
    if (!list || !list.length) return;
    build();
    items = list.slice();
    idx = -1;
    active = true;
    window.addEventListener('resize', place);
    document.addEventListener('scroll', place, { capture: true, passive: true });
    tPoll = setInterval(place, 500);
    tapNext = performance.now() + 900;
    next();
  }

  function point(sel, o) {
    o = o || {};
    sequence([{ sel: sel, text: o.text, ms: o.ms }]);
  }

  function seen() {
    try {
      var v = JSON.parse(localStorage.getItem('pq_tour') || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  }
  function mark(k) {
    var s = seen();
    s[k] = 1;
    try { localStorage.setItem('pq_tour', JSON.stringify(s)); } catch (e) { /* storage off */ }
  }

  function homeSel() {
    var c = ['[data-t=zip]', '[data-t=continue]', '[data-t=pick]'];
    for (var i = 0; i < c.length; i++) if (document.querySelector(c[i])) return c[i];
    return c[0];
  }

  function tour(name, param) {
    if (name === 'home') {
      return [
        { sel: homeSel(), text: 'Start here' },
        { sel: '[data-t=sample]', text: 'Or try an example' }
      ];
    }
    if (name === 'scan') return [{ sel: '[data-t=next]', text: 'Looks right? Go' }];
    if (name === 'kind') return [{ sel: '.kind-card', text: 'Tap one', noring: true }];
    if (name === 'goal') return [{ sel: '[data-t=goals]', text: 'Tap one that fits' }];
    if (name === 'ads') return [{ sel: '[data-t=copy]', text: 'Copy this first' }, { sel: '[data-t=next]', text: 'Then continue' }];
    if (name === 'step') {
      if (String(param) === '0') {
        return [
          { sel: '[data-t=copy]', text: '1. Copy this' },
          { sel: '[data-t=next]', text: '2. Then tap here' },
          { sel: '[data-t=coach-open]', text: 'Stuck? Ask me' }
        ];
      }
      return [
        { sel: '[data-t=copy]', text: '1. Copy this' },
        { sel: '[data-t=next]', text: '2. Done? Tap here' },
        { sel: '[data-t=coach-open]', text: 'Stuck? Ask me' }
      ];
    }
    return null;
  }

  var route = { name: '', param: '' };

  function start(name, param, force) {
    var t = tour(name, param);
    if (!t) return false;
    lastTour = t;
    if (!force) mark(name);
    sequence(t);
    return true;
  }

  document.addEventListener('pq:route', function (e) {
    stop();                                           /* always stop the old tour first */
    clearTimeout(tRoute); tRoute = 0;
    var d = (e && e.detail) || {};
    route = { name: d.name || '', param: d.param == null ? '' : d.param };
    if (['home', 'scan', 'kind', 'goal', 'ads', 'step'].indexOf(route.name) < 0) return;
    var mine = route.name;
    tRoute = setTimeout(function () {
      tRoute = 0;
      if (route.name !== mine || seen()[mine]) return;
      start(mine, route.param, false);
    }, 500);
  });

  function bootRoute() {
    var h = (location.hash || '').replace(/^#\/?/, ''), i = h.indexOf('/');
    var name = (i < 0 ? h : h.slice(0, i)) || 'home';
    document.dispatchEvent(new CustomEvent('pq:route', { detail: { name: name, param: i < 0 ? '' : h.slice(i + 1) } }));
  }

  PQ.guide = {
    point: point, sequence: sequence, stop: stop,
    replay: function () { return start(route.name, route.param, true); }
  };

  /* app.js renders before this file loads (all scripts are deferred), so replay the current route once */
  if (!route.name) bootRoute();
})();
