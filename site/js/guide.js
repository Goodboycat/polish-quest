(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var NS = 'http://www.w3.org/2000/svg';
  var ACC = '#FFC53D';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hand, ring, label, bob, built = false;
  var cur = null, token = 0, timers = [], hx = null, hy = null;

  function css(n, o) { for (var k in o) n.style[k] = o[k]; }
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function build() {
    if (built) return;
    built = true;
    hand = document.createElement('div');
    hand.className = 'pqg-hand';
    hand.setAttribute('aria-hidden', 'true');
    css(hand, { position: 'fixed', left: '0', top: '0', width: '40px', height: '40px', zIndex: '90',
      pointerEvents: 'none', opacity: '0', willChange: 'transform',
      transition: reduce ? 'none' : 'transform .4s cubic-bezier(.2,.7,.2,1), opacity .2s' });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M14 3a3 3 0 0 1 3 3v11l9 2a4 4 0 0 1 3 4v6a8 8 0 0 1-8 8h-5a8 8 0 0 1-7-4l-5-9a2.5 2.5 0 0 1 4-3l3 3V6a3 3 0 0 1 3-3z');
    p.setAttribute('fill', '#F2F4F8');
    p.setAttribute('stroke', '#0B0D12');
    p.setAttribute('stroke-width', '2');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    svg.style.pointerEvents = 'none';
    svg.style.display = 'block';
    hand.appendChild(svg);
    if (!reduce && svg.animate) {
      try {
        bob = svg.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(7px)' }, { transform: 'translateY(0)' }],
          { duration: 1100, iterations: Infinity, easing: 'ease-in-out' });
        bob.pause();
      } catch (e) { bob = null; }
    }
    ring = document.createElement('div');
    ring.className = 'pqg-ring';
    ring.setAttribute('aria-hidden', 'true');
    css(ring, { position: 'fixed', left: '0', top: '0', zIndex: '88', pointerEvents: 'none', opacity: '0',
      border: '2px solid ' + ACC, borderRadius: '14px', boxSizing: 'border-box', transition: 'opacity .2s' });
    label = document.createElement('div');
    label.className = 'pqg-label';
    label.setAttribute('aria-hidden', 'true');
    css(label, { position: 'fixed', left: '0', top: '0', zIndex: '89', pointerEvents: 'none', opacity: '0',
      background: ACC, color: '#0B0D12', font: "600 14px/20px 'Inter', system-ui, sans-serif",
      padding: '6px 10px', borderRadius: '8px', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 16px)',
      transition: 'none' });
    document.body.appendChild(ring);
    document.body.appendChild(label);
    document.body.appendChild(hand);
    hand.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') showLabel();
    });
  }

  function hits(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }
  function hitsH1(r) {
    var hs = document.querySelectorAll('h1');
    for (var i = 0; i < hs.length; i++) {
      var h = hs[i].getBoundingClientRect();
      if (h.width && h.height && hits(r, h)) return true;
    }
    return false;
  }

  function placeLabel(rect) {
    var w = label.offsetWidth, h = label.offsetHeight;
    var left = Math.max(8, Math.min(rect.left, innerWidth - w - 8));
    function box(top) { return { left: left, right: left + w, top: top, bottom: top + h }; }
    var below = rect.bottom + 10, above = rect.top - h - 10;
    var top = (below + h > innerHeight - 8) ? above : below;
    if (hitsH1(box(top))) top = (top === below) ? above : below;
    label.style.left = Math.round(left) + 'px';
    label.style.top = Math.round(top) + 'px';
  }

  function place() {
    if (!cur) return;
    var t = cur.target;
    if (!t.isConnected) { stop(); return; }
    var r = t.getBoundingClientRect();
    if (!r.width && !r.height) return;
    var key = [r.left, r.top, r.width, r.height, innerWidth, innerHeight].join(',');
    if (key === cur.key) return;
    cur.key = key;
    css(ring, { left: (r.left - 5) + 'px', top: (r.top - 5) + 'px', width: (r.width + 10) + 'px', height: (r.height + 10) + 'px' });
    var x, y;
    if (innerWidth <= 640) { x = r.left + r.width * 0.5; y = r.bottom - 10; }
    else { x = r.right - 12; y = r.bottom - 6; }
    hx = x - 14; hy = y - 3;
    hand.style.transform = 'translate(' + Math.round(hx) + 'px,' + Math.round(hy) + 'px)';
    placeLabel(r);
  }

  function showLabel() {
    if (!cur || cur.shown) return;
    cur.shown = true;
    if (!cur.text) return;
    cur.key = '';
    place();
    label.style.transition = 'opacity .15s';
    label.style.opacity = '1';
  }

  function hideLabel() {
    if (!label) return;
    label.style.transition = 'none';
    label.style.opacity = '0';
  }

  function clearCur() {
    clearTimers();
    if (cur) {
      clearInterval(cur.iv);
      document.removeEventListener('click', cur.onClick, true);
      cur = null;
    }
    hideLabel();
  }

  function stop() {
    token++;
    clearCur();
    if (!built) return;
    hand.style.opacity = '0';
    ring.style.opacity = '0';
    if (bob) bob.pause();
    hx = hy = null;
  }

  function show(sel, opt, done) {
    opt = opt || {};
    clearCur();
    var t = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!t || !t.getBoundingClientRect || !t.getBoundingClientRect().width) { done(false); return; }
    build();
    var my = token;
    function fin(ok) {
      if (my !== token || !cur || cur.target !== t) return;
      clearCur();
      done(ok);
    }
    cur = { target: t, text: opt.text || '', shown: false, key: '',
      onClick: function (e) { if (t.contains(e.target)) later(function () { fin(true); }, 0); } };
    label.textContent = cur.text;
    if (hx === null) {
      var r = t.getBoundingClientRect();
      hand.style.transition = 'none';
      hand.style.transform = 'translate(' + Math.round(r.left + r.width / 2) + 'px,' + Math.round(Math.min(innerHeight - 40, r.bottom + 90)) + 'px)';
      void hand.offsetWidth;
      hand.style.transition = reduce ? 'none' : 'transform .4s cubic-bezier(.2,.7,.2,1), opacity .2s';
    }
    hand.style.opacity = '1';
    ring.style.opacity = '1';
    if (bob) bob.play();
    place();
    document.addEventListener('click', cur.onClick, true);
    cur.iv = setInterval(place, 300);
    later(showLabel, 450);
    later(function () { fin(true); }, opt.ms || 4000);
  }

  function point(sel, opt) {
    token++;
    var my = token;
    return new Promise(function (res) {
      show(sel, opt, function (ok) {
        if (my === token) stop();
        res(ok);
      });
    });
  }

  function sequence(list, onEnd) {
    token++;
    var my = token, i = 0;
    function next() {
      if (my !== token) return;
      if (i >= list.length) { stop(); if (onEnd) onEnd(); return; }
      var s = list[i++];
      show(s.sel, { text: s.text, ms: s.ms }, next);
    }
    next();
  }

  var TOURS = {
    home: [
      { sel: '[data-t=zip], [data-t=choose], [data-t=pick], .actions .btn-primary', text: 'Drop your zip here' },
      { sel: '[data-t=sample]', text: 'Or try an example' }
    ],
    scan: [{ sel: '[data-t=next]', text: 'Looks right? Go' }],
    step: [
      { sel: '[data-t=copy]', text: '1. Copy this' },
      { sel: '[data-t=next]', text: '2. Done? Tap here' },
      { sel: '[data-t=mascot]', text: 'Stuck? Ask me' }
    ]
  };

  function seen() {
    try {
      var v = JSON.parse(localStorage.getItem('pq_tour') || '{}');
      return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
    } catch (e) { return {}; }
  }
  function mark(n) {
    try { var v = seen(); v[n] = 1; localStorage.setItem('pq_tour', JSON.stringify(v)); } catch (e) {}
  }

  var routeTimer = 0;
  document.addEventListener('pq:route', function (e) {
    stop();
    clearTimeout(routeTimer);
    var d = e.detail || {}, n = d.name || 'home';
    if (n === 'step' && !(Number(d.param) >= 1)) return;
    var tour = TOURS[n];
    if (!tour || seen()[n]) return;
    routeTimer = setTimeout(function () {
      if (!document.querySelector(tour[0].sel)) return;
      mark(n);
      sequence(tour);
    }, 700);
  });
  window.addEventListener('resize', function () { if (cur) { cur.key = ''; place(); } });

  PQ.guide = { point: point, sequence: sequence, stop: stop };
})();
