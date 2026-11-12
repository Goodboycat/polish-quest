(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var NS = 'http://www.w3.org/2000/svg';
  var hand = null, label = null;
  var items = [], idx = -1, active = false;
  var target = null, tries = 0;
  var tRetry = 0, tAdv = 0, tPoll = 0, tRoute = 0;

  function build() {
    if (hand) return;
    hand = document.createElement('div');
    hand.id = 'pq-hand';
    hand.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');
    svg.setAttribute('class', 'bob');
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('transform', 'translate(-5.5 0)');
    p.setAttribute('d', 'M9 3.5a1.5 1.5 0 0 1 3 0V10l5.2 1.1a2 2 0 0 1 1.6 2.2l-.6 5A3 3 0 0 1 15.2 21H11a3 3 0 0 1-2.4-1.2l-3.4-4.6a1.5 1.5 0 0 1 2.3-1.9L9 14.5z');
    svg.appendChild(p);
    hand.appendChild(svg);
    label = document.createElement('div');
    label.id = 'pq-hand-label';
    label.setAttribute('aria-hidden', 'true');
    document.body.appendChild(hand);
    document.body.appendChild(label);
  }

  function hide() {
    if (hand) hand.classList.remove('on');
    if (label) label.classList.remove('on');
  }

  function onClick() { next(); }

  function dropTarget() {
    if (target) {
      target.classList.remove('pq-target');
      target.removeEventListener('click', onClick);
      target = null;
    }
  }

  function clearRings() {
    dropTarget();
    var all = document.querySelectorAll('.pq-target');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('pq-target');
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
          if (tries >= 15) next(); else place();
        }, 200);
      }
      return;
    }
    tries = 0;
    if (t !== target) {
      dropTarget();
      target = t;
      t.classList.add('pq-target');
      t.addEventListener('click', onClick);
    }
    if (!tAdv) tAdv = setTimeout(next, it.ms || 4000);
    var cx = r.left + r.width / 2;
    var x = cx - 8, y = r.bottom + 6, flip = false;
    if (y + 40 > window.innerHeight - 8) {
      flip = true;
      y = r.top - 46;
      x = cx - 32;
    }
    hand.classList.toggle('flip', flip);
    hand.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    label.textContent = it.text || '';
    var w = label.offsetWidth;
    var lx = Math.max(8, Math.min(cx - w / 2, window.innerWidth - w - 8));
    var ly = flip ? y - 38 : y + 46;
    label.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
    hand.classList.add('on');
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
    clearRings();
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
    try { localStorage.setItem('pq_tour', JSON.stringify(s)); } catch (e) {}
  }

  function homeSel() {
    var c = ['[data-t=zip]', '[data-t=choose]', '[data-t=continue]', '.actions .btn-primary', '.btn-primary'];
    for (var i = 0; i < c.length; i++) {
      if (document.querySelector(c[i])) return c[i];
    }
    return c[0];
  }

  function tour(name) {
    if (name === 'home') {
      return [
        { sel: homeSel(), text: 'Drop your zip here' },
        { sel: '[data-t=sample]', text: 'Or try an example' }
      ];
    }
    if (name === 'scan') return [{ sel: '[data-t=next]', text: 'Looks right? Go' }];
    if (name === 'step') {
      return [
        { sel: '[data-t=copy]', text: '1. Copy this' },
        { sel: '[data-t=next]', text: '2. Done? Tap here' },
        { sel: '[data-t=mascot]', text: 'Stuck? Ask me' }
      ];
    }
    return null;
  }

  document.addEventListener('pq:route', function (e) {
    stop();
    clearTimeout(tRoute);
    var name = e && e.detail ? e.detail.name : '';
    if (name !== 'home' && name !== 'scan' && name !== 'step') return;
    tRoute = setTimeout(function () {
      tRoute = 0;
      if (seen()[name]) return;
      var t = tour(name);
      if (!t) return;
      mark(name);
      sequence(t);
    }, 500);
  });

  PQ.guide = { point: point, sequence: sequence, stop: stop };
})();
