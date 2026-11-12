(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var NS = 'http://www.w3.org/2000/svg';

  var lk = document.createElement('link');
  lk.rel = 'stylesheet';
  lk.href = 'css/fix.css';
  document.head.appendChild(lk);

  var layer, hand, label, cur = null, queue = [], timer = 0;

  function build() {
    if (layer) return;
    layer = document.createElement('div');
    layer.className = 'pg';
    layer.setAttribute('aria-hidden', 'true');
    hand = document.createElement('div');
    hand.className = 'pg-hand';
    var fl = document.createElement('span');
    fl.className = 'pg-fl';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 36 44');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M10 2c2.5 0 4.5 2 4.5 4.5V18l11 2.5c3 .7 5 3.3 5 6.4V32c0 6-4.5 10.5-10.5 10.5h-4c-3.5 0-6.6-1.8-8.4-4.8L2.5 29c-1-1.8-.3-4 1.5-4.8 1.2-.5 2.5-.2 3.5.7V6.5C5.5 4 7.5 2 10 2z');
    p.setAttribute('fill', '#F2F4F8');
    p.setAttribute('stroke', '#0B0D12');
    p.setAttribute('stroke-width', '2');
    svg.appendChild(p);
    fl.appendChild(svg);
    hand.appendChild(fl);
    label = document.createElement('div');
    label.className = 'pg-label';
    layer.appendChild(hand);
    layer.appendChild(label);
    document.body.appendChild(layer);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function place() {
    if (!cur) return;
    var t = cur.el;
    if (!t.isConnected) { next(); return; }
    var r = t.getBoundingClientRect();
    var W = window.innerWidth, H = window.innerHeight;
    var flip = r.bottom + 44 > H;
    var hx = clamp(r.right - 10, 4, W - 40);
    var hy = clamp(flip ? r.top - 30 : r.bottom - 8, 4, H - 48);
    hand.classList.toggle('pg-flip', flip);
    hand.style.transform = 'translate(' + Math.round(hx) + 'px,' + Math.round(hy) + 'px)';
    var lw = label.offsetWidth, lh = label.offsetHeight;
    var inBar = W <= 640 && !!t.closest('.actions');
    var below = !inBar && r.bottom + 52 <= H;
    var ly = Math.max(4, below ? r.bottom + 12 : r.top - lh - 12);
    var lx = clamp(Math.min(r.left, hx - lw - 8), 12, Math.max(12, W - lw - 12));
    label.style.transform = 'translate(' + Math.round(lx) + 'px,' + Math.round(ly) + 'px)';
  }

  function onClick() { next(); }

  function clearCur() {
    clearTimeout(timer);
    if (cur) {
      cur.el.classList.remove('pg-ring');
      cur.el.removeEventListener('click', onClick);
      cur = null;
    }
  }

  function next() {
    clearCur();
    var s;
    while ((s = queue.shift())) {
      var el = null;
      try { el = document.querySelector(s.sel); } catch (e) {}
      if (el && el.getClientRects().length) {
        build();
        cur = { el: el };
        el.classList.add('pg-ring');
        el.addEventListener('click', onClick);
        label.textContent = s.text || '';
        layer.classList.add('on');
        place();
        timer = setTimeout(next, s.ms || 4000);
        return;
      }
    }
    if (layer) layer.classList.remove('on');
  }

  function stop() {
    queue = [];
    clearCur();
    if (layer) layer.classList.remove('on');
  }

  function sequence(a) { stop(); queue = (a || []).slice(); next(); }
  function point(sel, o) { o = o || {}; sequence([{ sel: sel, text: o.text, ms: o.ms }]); }

  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);

  var TOURS = {
    home: [
      { sel: '[data-t=zip], .actions .btn-primary', text: 'Drop your zip here' },
      { sel: '[data-t=sample]', text: 'Or try an example' }
    ],
    scan: [{ sel: '[data-t=next]', text: 'Looks right? Go' }],
    step: [
      { sel: '[data-t=copy]', text: '1. Copy this' },
      { sel: '[data-t=next]', text: '2. Done? Tap here' },
      { sel: '[data-t=coach-open]', text: 'Stuck? Ask me' }
    ]
  };

  function seen() {
    try {
      var o = JSON.parse(localStorage.getItem('pq_tour') || '{}');
      return o && typeof o === 'object' ? o : {};
    } catch (e) { return {}; }
  }

  function tour(name, force) {
    var t = TOURS[name];
    if (!t) return;
    var s = seen();
    if (s[name] && !force) return;
    if (name === 'home') {
      try { if (PQ.app && PQ.app.state && PQ.app.state.scan) return; } catch (e) {}
    }
    s[name] = 1;
    try { localStorage.setItem('pq_tour', JSON.stringify(s)); } catch (e) {}
    sequence(t);
  }

  var got = false, tt = 0;
  function onRoute(name) {
    got = true;
    stop();
    clearTimeout(tt);
    if (document.body) document.body.setAttribute('data-pqr', name || 'home');
    tt = setTimeout(function () { tour(name); }, 700);
  }

  document.addEventListener('pq:route', function (e) {
    onRoute(e.detail && e.detail.name);
  });

  function fromHash() {
    var h = (location.hash || '').replace(/^#/, '').split('/')[0];
    return h || 'home';
  }
  function init() {
    if (!got) { onRoute(fromHash()); got = false; }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 300); });
  else setTimeout(init, 300);

  PQ.guide = { point: point, sequence: sequence, stop: stop, tour: tour };
})();
