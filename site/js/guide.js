/* Hand pointer. A hand image, a ring around the target and a short label.
   API: PQ.guide.point(sel, {text, ms}), PQ.guide.sequence([{sel, text, ms}]), PQ.guide.replay(), PQ.guide.stop() */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var HAND_W = 44, HAND_H = 76, TIP_X = 5;    /* hand.png is 98x169 with the fingertip 12px from the left edge: 44px wide shows it at 5px */
  var PAD = 6, GAP = 8;
  var hand, img, ring, label;
  var items = [], idx = -1, active = false, target = null, tries = 0;
  var tRetry = 0, tAdv = 0, tPoll = 0, tRoute = 0;
  var lastTour = null;

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
    document.body.appendChild(ring);
    document.body.appendChild(hand);
    document.body.appendChild(label);
  }

  function hide() {
    document.body.classList.remove('pq-guiding');
    if (hand) hand.classList.remove('on');
    if (ring) ring.classList.remove('on');
    if (label) label.classList.remove('on');
  }

  function onClick() { next(); }

  function dropTarget() {
    if (target) { target.removeEventListener('click', onClick); target = null; }
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
    if (!tAdv) tAdv = setTimeout(next, it.ms || 4000);

    var vw = window.innerWidth, vh = window.innerHeight;
    var rl = r.left - PAD, rt = r.top - PAD, rw = r.width + PAD * 2, rh = r.height + PAD * 2;
    ring.style.transform = 'translate(' + rl + 'px,' + rt + 'px)';
    ring.style.width = rw + 'px';
    ring.style.height = rh + 'px';

    var cx = r.left + r.width / 2;
    var flip = rt + rh + HAND_H + 4 > vh - 8;       /* no room below: hand sits above and points down */
    var hx, hy;
    if (!flip) { hx = cx - TIP_X; hy = rt + rh + 2; }
    else { hx = cx - (HAND_W - TIP_X); hy = rt - HAND_H - 2; }
    hx = Math.max(4, Math.min(hx, vw - HAND_W - 4));
    hand.classList.toggle('flip', flip);
    hand.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';

    label.textContent = it.text || '';
    var lw = label.offsetWidth, lh = label.offsetHeight;
    /* label sits beside the hand, so it never covers the target or a neighbouring button */
    var lx = hx + HAND_W + 8;
    var maxR = vw - 8 - (vw <= 640 ? 76 : 0);       /* on phones keep clear of Pip in the bottom-right corner */
    if (lx + lw > maxR) lx = Math.max(8, hx - lw - 8);
    var ly = hy + (HAND_H - lh) / 2;
    ly = Math.max(64, Math.min(ly, vh - lh - 8));
    label.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';

    if (r.width > 520) ring.classList.remove('on'); else ring.classList.add('on');
    hand.classList.add('on');
    document.body.classList.add('pq-guiding');
    if (it.text) label.classList.add('on'); else label.classList.remove('on');
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
    hide();
    place();
  }

  function stop() {
    active = false;
    clearStepTimers();
    clearInterval(tPoll); tPoll = 0;
    window.removeEventListener('resize', place);
    document.removeEventListener('scroll', place, true);
    dropTarget();
    hide();
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
    if (name === 'kind') return [{ sel: '.goals', text: 'Tap one' }];
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
