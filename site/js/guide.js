(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var CSS = '#pq-hand{position:fixed;left:0;top:0;width:44px;height:44px;z-index:60;pointer-events:none;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .2s}' +
    '#pq-hand svg{display:block;width:44px;height:44px;animation:pqbob .9s ease-in-out infinite alternate}' +
    '#pq-ring{position:fixed;z-index:59;border:2px solid #FFC53D;border-radius:14px;pointer-events:none;animation:pqring 1.2s ease-in-out infinite alternate;transition:opacity .2s}' +
    '#pq-label{position:fixed;z-index:60;background:#FFC53D;color:#0B0D12;font:650 14px/20px Inter,system-ui,sans-serif;padding:6px 10px;border-radius:8px;pointer-events:none;white-space:nowrap;transition:opacity .2s}' +
    '.pq-g-off{opacity:0;visibility:hidden}' +
    '@keyframes pqbob{from{transform:translateY(0)}to{transform:translateY(-8px)}}' +
    '@keyframes pqring{from{box-shadow:0 0 0 0 #FFC53D}to{box-shadow:0 0 0 6px #2A3040}}' +
    '@media (prefers-reduced-motion:reduce){#pq-hand{transition:none}#pq-hand svg,#pq-ring{animation:none}}';
  function addCss(t) {
    try { var s = new CSSStyleSheet(); s.replaceSync(t); document.adoptedStyleSheets = document.adoptedStyleSheets.concat([s]); }
    catch (e) { var st = document.createElement('style'); st.textContent = t; document.head.appendChild(st); }
  }
  var hand, ring, label, cur = null, timer = 0, tick = 0;
  function make() {
    if (hand) return;
    addCss(CSS);
    var NS = 'http://www.w3.org/2000/svg';
    hand = document.createElement('div'); hand.id = 'pq-hand';
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M9 2.8a1.8 1.8 0 0 1 3.6 0V10l5.2 1.1a2.5 2.5 0 0 1 2 2.7l-.7 5.2a3 3 0 0 1-3 2.5h-5a3 3 0 0 1-2.5-1.3L4.3 14a1.7 1.7 0 0 1 2.6-2.1L9 13.5z');
    p.setAttribute('fill', '#F2F4F8'); p.setAttribute('stroke', '#0B0D12'); p.setAttribute('stroke-width', '1.1'); p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p); hand.appendChild(svg);
    ring = document.createElement('div'); ring.id = 'pq-ring';
    label = document.createElement('div'); label.id = 'pq-label';
    [hand, ring, label].forEach(function (e) { e.classList.add('pq-g-off'); e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); });
  }
  function find(sel) {
    var l;
    try { l = document.querySelectorAll(sel); } catch (e) { return null; }
    for (var i = 0; i < l.length; i++) {
      var r = l[i].getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && l[i].getClientRects().length) return l[i];
    }
    return null;
  }
  function place() {
    if (!cur) return;
    if (!cur.el.isConnected) { finish(); return; }
    var r = cur.el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
    if (!r.width) { finish(); return; }
    ring.style.left = (r.left - 6) + 'px'; ring.style.top = (r.top - 6) + 'px';
    ring.style.width = (r.width + 12) + 'px'; ring.style.height = (r.height + 12) + 'px';
    var hx = Math.max(4, Math.min(W - 48, r.left + r.width / 2 - 20));
    var hy = Math.min(H - 48, r.bottom - 8);
    hand.style.transform = 'translate(' + hx + 'px,' + hy + 'px)';
    var lw = label.offsetWidth || 120;
    var lx = Math.max(8, Math.min(W - lw - 8, r.left + r.width / 2 - lw / 2));
    var ly = r.top - 46;
    if (ly < 8) ly = Math.min(H - 40, r.bottom + 50);
    label.style.left = lx + 'px'; label.style.top = ly + 'px';
  }
  function show(on, hasText) {
    hand.classList.toggle('pq-g-off', !on); ring.classList.toggle('pq-g-off', !on);
    label.classList.toggle('pq-g-off', !on || !hasText);
  }
  function finish(stopped) {
    var c = cur; cur = null;
    clearTimeout(timer); clearInterval(tick);
    if (hand) show(false);
    if (c) { c.el.removeEventListener('click', c.fn, true); c.res(!stopped); }
  }
  var seq = 0;
  function point(sel, o) {
    o = o || {};
    make(); finish(true);
    return new Promise(function (res) {
      var el = find(sel);
      if (!el) { res(false); return; }
      var c = { el: el, res: res, fn: function () { if (cur === c) finish(); } };
      cur = c;
      label.textContent = String(o.text || '').split(/\s+/).slice(0, 5).join(' ');
      show(true, !!o.text); place();
      el.addEventListener('click', c.fn, true);
      timer = setTimeout(c.fn, o.ms || 4000);
      tick = setInterval(place, 250);
    });
  }
  function sequence(list) {
    var id = ++seq, i = 0;
    function next() {
      if (id !== seq || i >= list.length) return Promise.resolve();
      var s = list[i++];
      return point(s.sel, { text: s.text, ms: s.ms }).then(next);
    }
    return next();
  }
  function stop() { seq++; finish(true); }
  PQ.guide = { point: point, sequence: sequence, stop: stop };
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, true);

  var TOURS = {
    home: [{ sel: '[data-t=zip],[data-t=choose],.actions .btn-primary', text: 'Drop your zip here' }, { sel: '[data-t=sample]', text: 'Or try an example' }],
    scan: [{ sel: '[data-t=next]', text: 'Looks right? Go' }],
    step: [{ sel: '[data-t=copy]', text: '1. Copy this' }, { sel: '[data-t=next]', text: '2. Done? Tap here' }, { sel: '[data-t=mascot]', text: 'Stuck? Ask me' }]
  };
  function seen() { try { return JSON.parse(localStorage.getItem('pq_tour')) || {}; } catch (e) { return {}; } }
  var wait = 0;
  document.addEventListener('pq:route', function (e) {
    stop(); clearTimeout(wait);
    var n = e.detail && e.detail.name, t = TOURS[n];
    if (!t) return;
    var s = seen();
    if (s[n]) return;
    wait = setTimeout(function () {
      if (!find(t[0].sel)) return;
      s[n] = 1;
      try { localStorage.setItem('pq_tour', JSON.stringify(s)); } catch (x) {}
      sequence(t);
    }, 700);
  });
})();
