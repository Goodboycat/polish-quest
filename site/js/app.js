(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var screens = {};
  var state = { scan: null, done: {}, core: null };
  var busy = false, toastT = 0, cur = { name: 'home', param: '' };
  var TOTAL = PQ.STEP_COUNT || 26;

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag), k, e;
    attrs = attrs || {};
    for (k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = String(v);
      else if (k === 'class') n.className = v;
      else if (k === 'on') { for (e in v) n.addEventListener(e, v[e]); }
      else if (k === 'data') { for (e in v) n.setAttribute('data-' + e, v[e]); }
      else n.setAttribute(k, v === true ? '' : String(v));
    }
    if (kids != null) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
        if (c == null || c === false) return;
        n.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c)));
      });
    }
    return n;
  }

  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  function load() {
    try {
      var s = PQ.store.load() || {};
      state.scan = s.scan || null;
      state.done = s.done || {};
      state.core = s.core || null;
    } catch (e) { /* fresh start */ }
  }
  function save() { try { PQ.store.save(state); } catch (e) { /* storage off */ } }
  function ctx() { return PQ.makeCtx(state.scan); }

  function doneCount() {
    var c = 0;
    for (var i = 1; i <= TOTAL; i++) if (state.done[i]) c++;
    return c;
  }
  function firstOpen() {
    for (var i = 1; i <= TOTAL; i++) if (!state.done[i]) return i;
    return TOTAL;
  }

  function toast(text) {
    var t = $('toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }

  function copyOld(text) {
    try {
      var ta = el('textarea', { readonly: true, 'aria-hidden': 'true', tabindex: '-1' });
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  }
  function copy(text) {
    text = String(text);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return true; },
          function () { return copyOld(text); });
      }
    } catch (e) { /* fall through */ }
    return Promise.resolve(copyOld(text));
  }

  function frame(root, o) {
    o = o || {};
    if (o.kicker) root.appendChild(el('p', { class: 'kicker', text: o.kicker }));
    if (o.title) root.appendChild(el('h1', { text: o.title }));
    if (o.lead) root.appendChild(el('p', { class: 'lead', text: o.lead }));
    var body = el('div', { class: 'stack' }), actions = el('div', { class: 'actions' });
    root.appendChild(body);
    root.appendChild(actions);
    return { body: body, actions: actions };
  }

  function parse() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var i = h.indexOf('/');
    var name = i < 0 ? h : h.slice(0, i);
    return { name: name || 'home', param: i < 0 ? '' : h.slice(i + 1) };
  }

  function nextOf(r) {
    if (r.name === 'home') return state.scan ? '#scan' : '#home';
    if (r.name === 'scan') return '#step/0';
    if (r.name === 'step') {
      var n = parseInt(r.param, 10) || 0;
      return n >= TOTAL ? '#done' : '#step/' + (n + 1);
    }
    return state.scan ? '#step/' + firstOpen() : '#home';
  }

  function sync3d(name) {
    var d = doneCount();
    var f = $('progress-fill');
    if (f) f.style.width = (d / TOTAL * 100) + '%';
    var mood = { home: 1, scan: 1, step: 1, done: 1 }[name] ? name : 'quiet';
    try {
      if (window.PQ3D) {
        if (PQ3D.setMood) PQ3D.setMood(mood);
        if (typeof PQ3D.setProgress === 'function') PQ3D.setProgress(d / TOTAL);
      }
    } catch (e) { /* 3D is optional */ }
  }

  function render() {
    var r = parse(), host = $('screen');
    if (!host) return;
    if ({ scan: 1, step: 1, done: 1 }[r.name] && !state.scan) {
      if (location.hash !== '#home') { location.hash = '#home'; return; }
      r = { name: 'home', param: '' };
    }
    cur = r;
    clear(host);
    var root = el('div', { class: 'frame' });
    host.appendChild(root);
    var fn = screens[r.name];
    if (fn) {
      try { fn(root, r.param); } catch (e) {
        clear(root);
        var fe = frame(root, { title: 'Something went wrong', lead: 'Go back to the start and try again.' });
        fe.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', text: 'Back to start', on: { click: function () { go('#home'); } } }));
        if (window.console) console.warn(e);
      }
    } else {
      var f = frame(root, { title: 'Coming up' });
      f.actions.appendChild(el('button', {
        class: 'btn btn-primary', type: 'button', text: 'Next', data: { t: 'next' },
        on: { click: function () { go(nextOf(r)); } }
      }));
    }
    var links = document.querySelectorAll('.bar nav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === '#' + r.name) links[i].setAttribute('aria-current', 'page');
      else links[i].removeAttribute('aria-current');
    }
    host.scrollTop = 0;
    try { host.focus({ preventScroll: true }); } catch (e) { host.focus(); }
    sync3d(r.name);
    document.dispatchEvent(new CustomEvent('pq:route', { detail: { name: r.name, param: r.param } }));
  }

  function go(hash) {
    hash = String(hash || '#home');
    if (hash.charAt(0) !== '#') hash = '#' + hash;
    if (location.hash === hash || (hash === '#home' && !location.hash && cur.name === 'home')) render();
    else location.hash = hash;
  }

  function screen(name, fn) {
    screens[name] = fn;
    if (booted && parse().name === name) render();
  }

  /* ---------- home ---------- */
  var STAGES = { list: 'Listing files', manifests: 'Finding the engine', read: 'Reading the code', think: 'Working out the plan', done: 'Ready' };
  var ORDER = ['list', 'manifests', 'read', 'think', 'done'];
  var homeUI = null;

  function startScan(file) {
    if (!file || busy) return;
    if (cur.name !== 'home') { go('#home'); }
    var ui = homeUI;
    if (!ui || !ui.actions.isConnected) return;
    busy = true;
    ui.err.classList.add('hidden');
    ui.actions.classList.add('hidden');
    ui.prog.classList.remove('hidden');
    ui.fill.style.width = '2%';
    ui.status.textContent = STAGES.list;
    try { if (window.PQ3D && PQ3D.setMood) PQ3D.setMood('scan'); } catch (e) { /* optional */ }
    var p;
    try {
      p = PQ.detect.scan(file, {
        onProgress: function (stage, frac) {
          var i = ORDER.indexOf(stage);
          if (i < 0) return;
          ui.status.textContent = STAGES[stage];
          var fr = typeof frac === 'number' && frac >= 0 && frac <= 1 ? frac : 0;
          ui.fill.style.width = Math.min(100, (i + fr) / (ORDER.length - 1) * 100) + '%';
        }
      });
    } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(function (scan) {
      busy = false;
      state.scan = scan;
      state.done = {};
      state.core = null;
      save();
      go('#scan');
    }, function (err) {
      busy = false;
      ui.prog.classList.add('hidden');
      ui.actions.classList.remove('hidden');
      ui.errText.textContent = (err && err.message) || 'Could not read that file. Try a .zip of your game folder.';
      ui.err.classList.remove('hidden');
      try { if (window.PQ3D && PQ3D.setMood) PQ3D.setMood('home'); } catch (e) { /* optional */ }
    });
  }

  screens.home = function (root) {
    var f = frame(root, {
      kicker: 'For indie game developers',
      title: 'Make your game feel finished.',
      lead: "Drop your game's zip. Get 26 copy-paste prompts for your AI coding tool, in the right order."
    });
    var fill = el('i');
    var status = el('p', { class: 'muted', text: '', 'aria-live': 'polite' });
    var prog = el('div', { class: 'stack hidden' }, [el('div', { class: 'meter' }, fill), status]);
    var errText = el('p', { class: 'muted' });
    var err = el('div', { class: 'card is-err stack hidden', role: 'alert' }, [el('h2', { text: 'That did not work' }), errText]);
    f.body.appendChild(prog);
    f.body.appendChild(err);
    var pick = function () { var i = $('file'); if (i) i.click(); };
    if (state.scan) {
      var n = firstOpen();
      f.actions.appendChild(el('button', {
        class: 'btn btn-primary', type: 'button', data: { t: 'continue' },
        text: 'Continue ' + (state.scan.name || 'your game') + ', step ' + n,
        on: { click: function () { go('#step/' + n); } }
      }));
      f.actions.appendChild(el('button', {
        class: 'btn btn-ghost', type: 'button', text: 'Start over',
        on: { click: function () {
          try { PQ.store.clear(); } catch (e) { /* ignore */ }
          state.scan = null; state.done = {}; state.core = null;
          render();
        } }
      }));
    } else {
      f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'pick' }, text: 'Choose your game .zip', on: { click: pick } }));
    }
    f.actions.appendChild(el('button', {
      class: 'btn btn-ghost', type: 'button', data: { t: 'sample' }, text: 'Try the example game',
      on: { click: function () {
        state.scan = PQ.detect.sample();
        state.done = {};
        state.core = null;
        save();
        go('#scan');
      } }
    }));
    f.body.appendChild(el('p', { class: 'muted small', text: 'Your zip never leaves your device.' }));
    homeUI = { actions: f.actions, prog: prog, fill: fill, status: status, err: err, errText: errText };
  };

  /* ---------- scan ---------- */
  function byId(list, id) {
    list = list || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function altId(a) { return a && typeof a === 'object' ? a.id : a; }

  function pickRow(card, o) {
    var val = el('span', { class: 'v' });
    var chips = el('div', { class: 'chips' });
    var sub = el('div', { class: 'sub' + (o.open ? '' : ' hidden') });
    var btn = el('button', {
      class: 'link', type: 'button', text: 'Change', 'aria-expanded': o.open ? 'true' : 'false',
      'aria-label': 'Change ' + o.label.toLowerCase(),
      on: { click: function () {
        var hid = sub.classList.toggle('hidden');
        btn.setAttribute('aria-expanded', hid ? 'false' : 'true');
      } }
    });
    var note = el('p', { class: 'muted small' + (o.open ? '' : ' hidden'), text: 'I am not sure. Pick the closest.' });
    sub.appendChild(note);
    sub.appendChild(chips);
    var list = [], seen = {};
    (o.alts || []).forEach(function (a) {
      var it = byId(o.list, altId(a));
      if (it && !seen[it.id]) { seen[it.id] = 1; list.push(it); }
    });
    (o.list || []).forEach(function (it) { if (!seen[it.id]) { seen[it.id] = 1; list.push(it); } });
    function draw() {
      var id = o.get(), it = byId(o.list, id);
      val.textContent = it ? it.label : 'Not sure yet';
      clear(chips);
      list.forEach(function (x) {
        chips.appendChild(el('button', {
          class: 'chip', type: 'button', text: x.label, 'aria-pressed': x.id === id ? 'true' : 'false',
          on: { click: function () {
            o.set(x.id);
            save();
            note.classList.add('hidden');
            draw();
          } }
        }));
      });
    }
    draw();
    card.appendChild(el('div', { class: 'row' }, [el('span', { class: 'k', text: o.label }), val, btn]));
    card.appendChild(sub);
  }

  screens.scan = function (root) {
    var s = state.scan;
    var f = frame(root, { kicker: 'Check', title: 'Is this your game?' });
    var card = el('div', { class: 'card card-scan' });
    var name = el('input', {
      class: 'field', type: 'text', maxlength: '60', id: 'scan-name', autocomplete: 'off', spellcheck: 'false',
      on: {
        input: function () { s.name = name.value; },
        change: function () { s.name = name.value.trim() || 'My game'; s.nameSure = true; save(); }
      }
    });
    name.value = s.name || '';
    card.appendChild(el('div', { class: 'row' }, [el('label', { class: 'k', for: 'scan-name', text: 'Name' }), name]));
    pickRow(card, {
      label: 'Engine', list: PQ.ENGINES, alts: s.engineAlts, open: !s.engineSure,
      get: function () { return s.engineId; },
      set: function (id) { s.engineId = id; s.engineSure = true; }
    });
    pickRow(card, {
      label: 'Type', list: PQ.GENRES, alts: s.genreAlts, open: !s.genreSure,
      get: function () { return s.genreId; },
      set: function (id) { s.genreId = id; s.genreSure = true; }
    });
    var dd = PQ.DEFAULT_DEVICE;
    var defDev = dd && typeof dd === 'object' ? dd.id : dd;
    pickRow(card, {
      label: 'Weakest device', list: PQ.DEVICES, open: false,
      get: function () { return s.deviceId || defDev; },
      set: function (id) { s.deviceId = id; }
    });
    f.body.appendChild(card);
    if (s.isSample) f.body.appendChild(el('p', { class: 'muted small', text: 'This is a made-up example game.' }));
    f.actions.appendChild(el('button', {
      class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Yes, start',
      on: { click: function () {
        s.name = (name.value || '').trim() || s.name || 'My game';
        s.engineSure = true;
        s.genreSure = true;
        if (!s.deviceId && defDev) s.deviceId = defDev;
        save();
        try { if (window.PQ3D && PQ3D.pulse) PQ3D.pulse(); } catch (e) { /* optional */ }
        go('#step/0');
      } }
    }));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Use another zip', on: { click: function () { go('#home'); } } }));
  };

  /* ---------- boot ---------- */
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    load();
    var ok = false;
    try { ok = !!window.PQ3D && PQ3D.start($('bg')) !== false; } catch (e) { ok = false; }
    if (!ok) document.body.classList.add('no3d');
    var file = $('file');
    if (file) file.addEventListener('change', function () {
      var fl = file.files && file.files[0];
      file.value = '';
      startScan(fl);
    });
    window.addEventListener('dragover', function (e) { e.preventDefault(); document.body.classList.add('is-drop'); });
    window.addEventListener('dragleave', function () { document.body.classList.remove('is-drop'); });
    window.addEventListener('drop', function (e) {
      e.preventDefault();
      document.body.classList.remove('is-drop');
      var fl = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!fl) return;
      if (cur.name !== 'home') {
        if (location.hash !== '#home') {
          var once = function () { document.removeEventListener('pq:route', once); startScan(fl); };
          document.addEventListener('pq:route', once);
          location.hash = '#home';
          return;
        }
        render();
      }
      startScan(fl);
    });
    window.addEventListener('hashchange', render);
    render();
  }

  PQ.app = {
    el: el, screen: screen, go: go, state: state, save: save, ctx: ctx,
    toast: toast, copy: copy, frame: frame, render: render,
    doneCount: doneCount, firstOpen: firstOpen
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
