(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var NS = 'http://www.w3.org/2000/svg';
  var PRIV = 'Your zip never leaves your device. Only the short question you type here is sent to an AI service (Coarena).';
  var route = { name: 'home', param: '' };
  var root, pip, bubble, panel, reply, input, timers = [], offerSaid = false;

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function s(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  function art() {
    var w = h('span', 'pp-art');
    ['pip-closed', 'pip-open'].forEach(function (n, i) {
      var im = document.createElement('img');
      im.src = 'assets/art/' + n + '.png';
      im.alt = ''; im.width = 72; im.height = 72;
      im.className = i ? 'pp-img pp-img-open' : 'pp-img pp-img-closed';
      w.appendChild(im);
    });
    return w;
  }

  function stepN() { var n = parseInt(route.param, 10); return isNaN(n) ? 0 : n; }

  function lines() {
    var n = stepN(), c = window.PQ_CONFIG || {};
    switch (route.name) {
      case 'home': return ['Hi, I am Pip.', 'Drop your game zip to begin.', 'Tap me if you get stuck.'];
      case 'scan': return ['This is what I found.', 'Fix anything wrong, then go.'];
      case 'goal': return ['What is your game for?', 'The rating changes with your answer.'];
      case 'rating':
        try {
          var sc = PQ.app.state.scan, rr = PQ.rate(sc, sc.goalId, PQ.app.state.done);
          var w = rr.order[0];
          return [rr.overall.toFixed(1) + ' out of 10. ' + rr.tier + '.', w && w.score < 9.5 ? 'Biggest gap: ' + w.label.toLowerCase() + '.' : 'No big gaps found.', 'I read your code. I did not play it.'];
        } catch (e) { return ['This rating is from your code.', 'I did not play your game.']; }
      case 'step':
        if (n === 0) return ['Paste this first in every chat.', 'It keeps your game safe.'];
        if (n === 5 && !offerSaid && PQ.offerOn && PQ.offerOn()) {
          offerSaid = true;
          return ['Nice, step 5 already.', 'Want a human to check it? See All steps.'];
        }
        if (n === 1) return ['Copy, paste, play.', 'Then come back for the next one.'];
        return ['One step at a time.', 'Stuck? Tap me.'];
      case 'overview': return ['Tap any step to jump to it.'];
      case 'fix': return ['Pick what went wrong.', 'I will give you a fix prompt.'];
      case 'privacy': return ['Your game stays on your device.'];
      case 'done': return ['You did it. Well done.'];
    }
    return [];
  }

  function canned(q) {
    var n = stepN(), t = (q || '').toLowerCase();
    if (t.indexOf('broke') >= 0) return 'Do not keep going. Open the Fix Kit, pick "undo" or "bug", copy the fix prompt and paste it into the same chat.';
    if (t.indexOf('skip') >= 0) return n <= 4 ? 'Please do not skip steps 1 to 4. They keep your game safe for everything after.' : 'Yes. Press "Done, next step" and come back later from All steps.';
    if (route.name === 'goal') return 'Tap the card that fits your game. A flagship game, a free game with ads, a paid game or a small finished game are judged differently.';
    if (route.name === 'ads') return 'Ads are fine when the player chooses them. Copy the ads prompt, paste it into your AI tool, then continue to the steps.';
    if (route.name === 'enough') return 'Finishing the steps does not promise the game is fun. Watch a friend play it. That is the real test.';
    if (route.name === 'rating') return 'The score is a checklist of your code, weighted by your goal. Gold bars matter most. Press Start the steps to fix the biggest gaps.';
    if (route.name === 'scan') return 'Check the four rows. Press "Change" on anything wrong, then press "Yes, start".';
    if (route.name === 'step') return 'Press "Copy prompt". Paste it into your AI coding tool and let it finish. Play your game, then press "Done, next step".';
    if (route.name === 'fix') return 'Pick the button that matches your problem, choose the options, then copy the fix prompt.';
    return 'Choose your game zip, or try the example game. Then follow one step at a time.';
  }

  function clearT() { timers.forEach(clearTimeout); timers = []; }
  function say(list) {
    if (!root) return;
    clearT();
    if (typeof list === 'string') list = [list];
    list = (list || []).slice(0, 3);
    bubble.classList.remove('pp-on'); root.classList.remove('pp-talking');
    if (!list.length) return;
    list.forEach(function (tx, i) {
      timers.push(setTimeout(function () {
        bubble.textContent = tx;
        bubble.classList.add('pp-on'); root.classList.add('pp-talking');
        timers.push(setTimeout(function () { root.classList.remove('pp-talking'); }, 1400));
      }, i * 4500 + 200));
    });
    timers.push(setTimeout(function () { bubble.classList.remove('pp-on'); }, list.length * 4500 + 200));
  }

  function place() {
    if (!root) return;
    var a = null, all = document.querySelectorAll('.actions');
    for (var i = 0; i < all.length; i++) {
      var r = all[i].getBoundingClientRect();
      if (r.height > 0 && r.width > 0) { a = r; break; }
    }
    if (window.innerWidth <= 640) {
      var b = a ? Math.max(12, window.innerHeight - a.top + 12) : 24;
      root.style.bottom = b + 'px';
      panel.style.bottom = (b + 64) + 'px';
    } else {
      root.style.bottom = '';
      panel.style.bottom = '';
    }
  }

  function setSmall(v) {
    root.classList.toggle('pp-small', v);
    pip.setAttribute('aria-label', v ? 'Show Pip, your helper' : 'Ask Pip, your helper');
    ls('pq_pip_hidden', v ? '1' : '0');
    if (v) { clearT(); close(); }
  }
  function open() {
    if (root.classList.contains('pp-small')) setSmall(false);
    root.classList.add('pp-open');
    pip.setAttribute('aria-expanded', 'true');
    place();
  }
  function close() {
    root.classList.remove('pp-open');
    pip.setAttribute('aria-expanded', 'false');
  }

  function ask(q) {
    q = String(q || '').trim().slice(0, 200);
    if (!q) return;
    reply.textContent = 'Thinking...';
    root.classList.add('pp-talking');
    var c = {};
    try { if (PQ.app && PQ.app.state && PQ.app.state.scan) c = PQ.app.ctx() || {}; } catch (e) { c = {}; }
    var body = {
      question: q,
      step: route.name === 'step' ? stepN() : route.name,
      gameName: String(c.name || '').slice(0, 60),
      engine: String((c.engine && c.engine.label) || '').slice(0, 40),
      genre: String((c.genre && c.genre.label) || '').slice(0, 40)
    };
    var fin = function (tx) { reply.textContent = tx; root.classList.remove('pp-talking'); };
    var ctl = null, tm = 0;
    try { ctl = new AbortController(); tm = setTimeout(function () { ctl.abort(); }, 8000); } catch (e) { ctl = null; }
    try {
      fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error('x'); return r.json(); })
        .then(function (d) { clearTimeout(tm); fin(d && d.reply ? String(d.reply).slice(0, 1200) : canned(q)); })
        .catch(function () { clearTimeout(tm); fin(canned(q)); });
    } catch (e) { clearTimeout(tm); fin(canned(q)); }
  }

  function build() {
    root = h('div', 'pp-root');
    root.setAttribute('data-t', 'mascot');
    root.style.visibility = 'hidden';

    bubble = h('div', 'pp-bubble');
    bubble.setAttribute('aria-live', 'polite');

    var hide = h('button', 'pp-hide', 'Hide');
    hide.type = 'button';
    hide.addEventListener('click', function () { setSmall(true); });

    pip = h('button', 'pp-pip');
    pip.type = 'button';
    pip.setAttribute('data-t', 'coach-open');
    pip.setAttribute('aria-expanded', 'false');
    pip.appendChild(art());
    pip.addEventListener('click', function () {
      if (root.classList.contains('pp-open')) close(); else open();
    });

    panel = h('div', 'pp-panel');
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Ask Pip');
    var head = h('div', 'pp-head');
    head.appendChild(h('span', '', 'Ask Pip'));
    var hp = h('button', 'pp-x', 'Hide Pip');
    hp.type = 'button';
    hp.addEventListener('click', function () { setSmall(true); });
    head.appendChild(hp);
    var x = h('button', 'pp-x', 'Close');
    x.type = 'button';
    x.addEventListener('click', close);
    head.appendChild(x);

    var chips = h('div', 'pp-chips');
    ['What do I do here?', 'The AI broke my game', 'Can I skip this?'].forEach(function (q) {
      var b = h('button', 'pp-chip', q);
      b.type = 'button';
      b.addEventListener('click', function () { ask(q); });
      chips.appendChild(b);
    });

    var form = h('div', 'pp-form');
    input = h('input', 'pp-in');
    input.type = 'text';
    input.maxLength = 200;
    input.placeholder = 'Type a short question';
    input.setAttribute('aria-label', 'Your question');
    var go = h('button', 'pp-ask', 'Ask');
    go.type = 'button';
    var send = function () { ask(input.value); input.value = ''; };
    go.addEventListener('click', send);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
    form.appendChild(input); form.appendChild(go);

    reply = h('div', 'pp-reply');
    reply.setAttribute('aria-live', 'polite');

    panel.appendChild(head); panel.appendChild(chips); panel.appendChild(form);
    panel.appendChild(reply); panel.appendChild(h('p', 'pp-note', PRIV));

    root.appendChild(bubble); root.appendChild(panel); root.appendChild(hide); root.appendChild(pip);
    document.body.appendChild(root);
    setSmall(ls('pq_pip_hidden') === '1');

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/pip.css';
    var show = function () { root.style.visibility = ''; place(); };
    link.onload = show; link.onerror = show;
    document.head.appendChild(link);
    setTimeout(show, 1500);
  }

  function onRoute(e) {
    var d = (e && e.detail) || {};
    route = { name: d.name || 'home', param: d.param == null ? '' : d.param };
    reply.textContent = '';
    requestAnimationFrame(place);
    setTimeout(place, 300);
    if (!root.classList.contains('pp-small') && !root.classList.contains('pp-open')) say(lines());
  }

  function init() {
    if (root) return;
    build();
    document.addEventListener('pq:route', onRoute);
    window.addEventListener('resize', place);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    place();
    setTimeout(function () { if (!timers.length && !root.classList.contains('pp-small')) say(lines()); }, 600);
  }

  PQ.mascot = { init: init, say: say, open: open, close: close, place: place, ask: ask,
    hide: function () { if (root) setSmall(true); }, show: function () { if (root) setSmall(false); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
