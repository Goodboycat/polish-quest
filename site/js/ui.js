/* Polish Quest - UI helpers: DOM builder, router, corner log, copy, download.
   No innerHTML anywhere (game names come from the zip, so only textContent is used). No network. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {}, doc = g.document;
  var UI = PQ.ui = { views: {}, state: { scan: null, done: {}, core: false }, cur: '', arg: '' };

  function add(n, kids) {
    if (kids == null || kids === false) return n;
    if (!Array.isArray(kids)) kids = [kids];
    kids.forEach(function (k) {
      if (k == null || k === false) return;
      n.appendChild((typeof k === 'string' || typeof k === 'number') ? doc.createTextNode(String(k)) : k);
    });
    return n;
  }
  function el(tag, cls, kids) { var n = doc.createElement(tag); if (cls) n.className = cls; return add(n, kids); }
  UI.el = el; UI.add = add;
  UI.$ = function (id) { return doc.getElementById(id); };
  UI.img = function (path, cls) { var i = el('img', cls); i.src = path; i.alt = ''; i.decoding = 'async'; return i; };
  UI.icon = function (name, cls) { return UI.img('assets/icons/' + name + '.png', cls); };
  UI.art = function (name, cls) { return UI.img('assets/art/' + name + '.png', cls); };
  UI.clear = function (n) { while (n.firstChild) n.removeChild(n.firstChild); return n; };
  UI.slug = function (s) { return String(s || 'game').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'game'; };

  UI.btn = function (label, cls, icon, onTap) {
    var b = el('button', 'btn ' + (cls || ''));
    b.type = 'button';
    if (icon) b.appendChild(UI.icon(icon));
    b.appendChild(el('span', '', label));
    if (onTap) b.addEventListener('click', onTap);
    return b;
  };
  /* A tappable chip. opts: label, sub, icon, pressed, onTap */
  UI.chip = function (o) {
    var b = el('button', 'chip'); b.type = 'button';
    if (o.icon) b.appendChild(UI.icon(o.icon));
    var t = el('span', '', [o.label]);
    if (o.sub) t.appendChild(el('small', '', o.sub));
    b.appendChild(t);
    b.setAttribute('aria-pressed', o.pressed ? 'true' : 'false');
    if (o.onTap) b.addEventListener('click', o.onTap);
    return b;
  };

  /* ---------- state ---------- */
  UI.save = function () { return PQ.store.save(UI.state); };
  UI.ctx = function () { return PQ.makeCtx(UI.state.scan || PQ.detect.sample()); };

  /* ---------- corner log (collapsible, never in the middle of the screen) ---------- */
  var items = [], logEl, listEl, toastEl, countEl, toastT = 0;
  UI.initLog = function () {
    logEl = UI.$('log'); if (!logEl) return;
    toastEl = el('div', 'log-toast'); toastEl.setAttribute('role', 'status');
    listEl = el('ul', 'log-list'); listEl.id = 'log-list';
    countEl = el('span', '', 'Log');
    var btn = el('button', 'log-btn', [UI.icon('p_notify'), countEl]); btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'log-list');
    btn.addEventListener('click', function () {
      var open = !logEl.classList.contains('open');
      logEl.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    UI.add(logEl, [toastEl, listEl, btn]);
    renderLog();
  };
  function renderLog() {
    if (!listEl) return;
    UI.clear(listEl);
    if (!items.length) listEl.appendChild(el('li', 'empty', 'Nothing yet. Messages show up here, never in the middle of the screen.'));
    items.forEach(function (it) { listEl.appendChild(el('li', '', [UI.icon(it.icon), el('span', '', it.msg)])); });
    countEl.textContent = items.length ? 'Log ' + items.length : 'Log';
  }
  UI.log = function (msg, icon) {
    items.unshift({ msg: msg, icon: icon || 'info' }); if (items.length > 30) items.pop();
    renderLog();
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add('on');
    g.clearTimeout(toastT); toastT = g.setTimeout(function () { toastEl.classList.remove('on'); }, 2800);
  };

  /* ---------- copy / download ---------- */
  UI.copy = function (text) {
    return new Promise(function (res) {
      function fallback() {
        try {
          var t = el('textarea', 'offscreen'); t.value = text; t.setAttribute('readonly', ''); doc.body.appendChild(t);
          t.focus(); t.select(); try { t.setSelectionRange(0, text.length); } catch (e) { /* ignore */ }
          var ok = doc.execCommand('copy'); doc.body.removeChild(t); res(!!ok);
        } catch (e) { res(false); }
      }
      if (g.navigator.clipboard && g.isSecureContext) g.navigator.clipboard.writeText(text).then(function () { res(true); }, fallback);
      else fallback();
    });
  };
  UI.download = function (name, text) {
    var b = new g.Blob([text], { type: 'text/plain;charset=utf-8' }), u = g.URL.createObjectURL(b);
    var a = el('a', 'offscreen'); a.href = u; a.download = name; doc.body.appendChild(a); a.click();
    g.setTimeout(function () { doc.body.removeChild(a); g.URL.revokeObjectURL(u); }, 1500);
  };

  /* ---------- router ---------- */
  var VIEWS = ['home', 'scan', 'quest', 'trust', 'review'];
  UI.parse = function () {
    var h = (g.location.hash || '').replace(/^#/, ''), p = h.split('/');
    return { view: VIEWS.indexOf(p[0]) >= 0 ? p[0] : 'home', arg: p[1] || '' };
  };
  UI.go = function (hash) {
    if (g.location.hash === hash) UI.route(); else g.location.hash = hash;
  };
  UI.route = function () {
    var r = UI.parse(), v = r.view;
    if ((v === 'scan' || v === 'quest') && !UI.state.scan) {
      if (UI.cur !== 'home') UI.log('Drop a game zip first, or try the sample.', 'info');
      v = 'home'; r.arg = ''; if (g.location.hash !== '#home') g.history.replaceState(null, '', '#home');
    }
    var changed = v !== UI.cur;
    VIEWS.forEach(function (n) {
      var s = UI.$('v-' + n); if (s) s.classList.toggle('on', n === v);
      var a = doc.querySelector('.nav-i[data-view="' + n + '"]');
      if (a) { a.classList.toggle('on', n === v); if (n === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }
    });
    UI.cur = v; UI.arg = r.arg;
    var impl = UI.views[v]; if (impl && impl.enter) impl.enter(r.arg, changed);
    if (UI.views.quest && UI.views.quest.sheetRoute) UI.views.quest.sheetRoute(v === 'quest' ? r.arg : '');
    if (changed) { var st = UI.$('stage'); if (st) st.scrollTop = 0; }
    var has = !!UI.state.scan;
    ['scan', 'quest'].forEach(function (n) { var a = doc.querySelector('.nav-i[data-view="' + n + '"]'); if (a) a.classList.toggle('has', has); });
    doc.title = ({ home: 'Polish Quest', scan: 'What I found - Polish Quest', quest: 'Your quests - Polish Quest', trust: 'Is it safe? - Polish Quest', review: 'Custom review - Polish Quest' })[v] || 'Polish Quest';
  };

  UI.forget = function () {
    PQ.store.clear(); UI.state.scan = null; UI.state.done = {};
    UI.log('Forgot everything on this device.', 'check');
    UI.go('#home');
  };

  UI.boot = function () {
    var loaded = PQ.store.load();
    UI.state.scan = loaded.scan || null; UI.state.done = loaded.done || {}; UI.state.core = false;
    UI.initLog();
    Object.keys(UI.views).forEach(function (k) { if (UI.views[k].init) UI.views[k].init(); });
    g.addEventListener('hashchange', UI.route);
    g.addEventListener('popstate', UI.route);
    UI.route();
  };
})(typeof window !== 'undefined' ? window : globalThis);
