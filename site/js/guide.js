(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var NS = 'http://www.w3.org/2000/svg';
  var KEY = 'pq_tour';
  var hand, label, target = null, queue = [], cur = null;
  var tAdv = 0, tRetry = 0, tTick = 0, tTour = 0, onShow = null, run = 0;

  function build() {
    if (hand) return;
    hand = document.createElement('div');
    hand.id = 'pq-guide';
    hand.className = 'pq-guide-hand hidden-guide';
    hand.setAttribute('aria-hidden', 'true');
    var inner = document.createElement('div');
    inner.className = 'pq-guide-bob';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M12 1.5c-1.9 0-3.4 1.5-3.4 3.4v15.3l-2.2-2.1c-1.4-1.3-3.5-1.3-4.7.1-1.1 1.3-1 3.200.1 4.500l8 9.900c1.800 2.200 4.500 3.500 7.400 3.500h6.300c5 0 9-4 9-9v-7.600c0-1.800-1.400-3.200-3.200-3.200-.700 0-1.300.200-1.800.500-.400-1.400-1.700-2.400-3.200-2.400-.800 0-1.500.300-2.100.700-.500-1.200-1.700-2.100-3.100-2.100-.600 0-1.200.200-1.700.400V4.900c0-1.900-1.500-3.400-3.400-3.400z'.replace(/(\.\d)00/g, '$1'));
    p.setAttribute('fill', '#F2F4F8');
    p.setAttribute('stroke', '#0B0D12');
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    inner.appendChild(svg);
    hand.appendChild(inner);
    label = document.createElement('div');
    label.className = 'pq-guide-label hidden-guide';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hand);
    document.body.appendChild(label);
  }

  function find(sel) {
    var list = String(sel).split('||');
    for (var i = 0; i < list.length; i++) {
      var e = null;
      try { e = document.querySelector(list[i].trim()); } catch (x) { e = null; }
      if (e) {
        var r = e.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return e;
      }
    }
    return null;
  }

  function place() {
    if (!target || !hand) return;
    if (!document.body.contains(target)) { advance(); return; }
    var r = target.getBoundingClientRect();
    if (!r.width || !r.height) return;
    var W = window.innerWidth, H = window.innerHeight;
    var left = r.left + r.width / 2 - 12;
    var top = r.bottom - 6;
    var flip = top + 40 > H - 8;
    if (flip) { top = r.top - 34; left = r.left + r.width / 2 - 28; }
    hand.classList.toggle('flip', flip);
    hand.style.left = Math.round(left) + 'px';
    hand.style.top = Math.round(top) + 'px';
    if (!cur || !cur.text) { label.classList.add('hidden-guide'); return; }
    label.classList.remove('hidden-guide');
    var lw = label.offsetWidth, lh = label.offsetHeight;
    var lx = r.left + r.width / 2 - lw / 2;
    var ly = r.top - 10 - lh - (flip ? 36 : 0);
    if (ly < 64) {
      lx = r.right + 12;
      ly = r.top + r.height / 2 - lh / 2;
      if (lx + lw > W - 8) {
        lx = r.left + r.width / 2 - lw / 2;
        ly = flip ? r.bottom + 10 : top + 50;
      }
    }
    lx = Math.max(8, Math.min(lx, W - lw - 8));
    ly = Math.max(8, Math.min(ly, H - lh - 8));
    label.style.left = Math.round(lx) + 'px';
    label.style.top = Math.round(ly) + 'px';
  }

  function onClick() { advance(); }

  function clearTarget() {
    clearTimeout(tAdv); clearTimeout(tRetry); clearInterval(tTick);
    if (target) {
      target.classList.remove('pq-guide-target');
      target.removeEventListener('click', onClick);
      target = null;
    }
  }

  function hide() {
    if (hand) hand.classList.add('hidden-guide');
    if (label) label.classList.add('hidden-guide');
  }

  function advance() {
    clearTarget();
    next();
  }

  function next() {
    var item = queue.shift();
    if (!item) { cur = null; hide(); return; }
    cur = item;
    var id = run, tries = 0;
    (function look() {
      if (id !== run) return;
      var e = find(item.sel);
      if (!e) {
        if (++tries > 15) { next(); return; }
        tRetry = setTimeout(look, 200);
        return;
      }
      show(e, item);
    })();
  }

  function show(e, item) {
    build();
    var wasHidden = hand.classList.contains('hidden-guide');
    target = e;
    e.classList.add('pq-guide-target');
    e.addEventListener('click', onClick);
    label.textContent = item.text || '';
    if (wasHidden) hand.classList.add('nomove');
    hand.classList.remove('hidden-guide');
    place();
    if (wasHidden) { void hand.offsetWidth; hand.classList.remove('nomove'); }
    tTick = setInterval(place, 300);
    tAdv = setTimeout(advance, item.ms || 4000);
    if (onShow) { var f = onShow; onShow = null; f(); }
  }

  function stop() {
    run++;
    clearTimeout(tTour);
    queue = []; cur = null; onShow = null;
    clearTarget();
    hide();
  }

  function sequence(items) {
    stop();
    build();
    queue = (items || []).slice();
    next();
  }

  function point(sel, o) {
    o = o || {};
    sequence([{ sel: sel, text: o.text, ms: o.ms }]);
  }

  function seen() {
    try { var o = JSON.parse(localStorage.getItem(KEY) || '{}'); return o && typeof o === 'object' ? o : {}; }
    catch (x) { return {}; }
  }
  function mark(name) {
    try { var o = seen(); o[name] = 1; localStorage.setItem(KEY, JSON.stringify(o)); } catch (x) {}
  }

  var TOURS = {
    home: [
      { sel: '[data-t=zip] || .actions .btn-primary', text: 'Drop your zip here' },
      { sel: '[data-t=sample]', text: 'Or try an example' }
    ],
    scan: [{ sel: '[data-t=next]', text: 'Looks right? Go' }],
    step: [
      { sel: '[data-t=copy]', text: '1. Copy this' },
      { sel: '[data-t=next]', text: '2. Done? Tap here' },
      { sel: '[data-t=mascot]', text: 'Stuck? Ask me' }
    ]
  };

  function onRoute(ev) {
    stop();
    var d = (ev && ev.detail) || {};
    var name = d.name || 'home';
    var tour = TOURS[name];
    if (!tour || seen()[name]) return;
    if (name === 'step' && !(Number(d.param) === 0 || Number(d.param) === 1)) return;
    tTour = setTimeout(function () {
      sequence(tour);
      onShow = function () { mark(name); };
    }, 500);
  }

  function init() {
    build();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('pq:route', onRoute);
  }

  PQ.guide = { point: point, sequence: sequence, stop: stop };

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
