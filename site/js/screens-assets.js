/* Screens: #kind (PC or Mobile, game type, art style: one question at a time) and #assets (free tools, CC0 search, copyable prompt). */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A || !PQ.PLATFORMS) return;
  var el = A.el;

  A.screen('kind', function (root) {
    var s = A.state.scan;
    if (!s) { A.go('#home'); return; }
    root.classList.add('wide');
    var steps = [
      { key: 'platformId', title: 'Where will people play it?', list: PQ.PLATFORMS },
      { key: 'kindId', title: 'What kind of game is it?', list: PQ.KINDS },
      { key: 'styleId', title: 'Which look?', list: PQ.STYLES, skip: function () { return s.kindId === 'ui'; } }
    ];
    var i = 0;
    function draw() {
      root.textContent = '';
      while (i < steps.length && steps[i].skip && steps[i].skip()) i++;
      if (i >= steps.length) { A.go('#goal'); return; }
      var st = steps[i];
      var f = A.frame(root, { kicker: 'Your game, ' + (i + 1) + ' of 3', title: st.title });
      var grid = el('div', { class: 'goals', role: 'group', 'aria-label': st.title });
      st.list.forEach(function (o) {
        var b = el('button', { class: 'goal-card kind-card', type: 'button', data: { t: 'kind-' + o.id }, 'aria-pressed': s[st.key] === o.id ? 'true' : 'false' }, [
          el('img', { class: 'kind-ico', src: 'assets/art/k-' + o.id + '.png', alt: '', width: '56', height: '56' }),
          el('span', { class: 'goal-t', text: o.label }), el('span', { class: 'goal-s', text: o.sub })
        ]);
        b.addEventListener('click', function () {
          s[st.key] = o.id;
          if (st.key === 'platformId') s.deviceId = o.id === 'pc' ? 'pc' : (s.deviceId && s.deviceId !== 'pc' ? s.deviceId : 'cheap');
          A.save();
          Array.prototype.forEach.call(grid.children, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          nx.disabled = false;
        });
        grid.appendChild(b);
      });
      f.body.appendChild(grid);
      var nx = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Next', on: { click: function () { if (!nx.disabled) { i++; draw(); } } } });
      nx.disabled = !s[st.key];
      if (i > 0) f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { i--; draw(); } } }));
      else f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { A.go('#scan'); } } }));
      f.actions.appendChild(nx);
      f.actions.appendChild(el('button', { class: 'link', type: 'button', text: 'Skip this', on: { click: function () { i++; draw(); } } }));
    }
    draw();
  });

  A.screen('assets', function (root) {
    var s = A.state.scan || {};
    root.classList.add('wide');
    var f = A.frame(root, { kicker: 'Free tools', title: 'Free assets and tools' });
    var tabs = el('div', { class: 'chips', role: 'group', 'aria-label': 'Kind' });
    var box = el('ul', { class: 'src-list' });
    var kinds = ['tool', 'assets', 'audio', 'icons'], cur = 'assets';
    function show() {
      box.textContent = '';
      Array.prototype.forEach.call(tabs.children, function (c) { c.setAttribute('aria-pressed', c.dataset.k === cur ? 'true' : 'false'); });
      PQ.FREE_SOURCES.filter(function (x) { return x.k === cur; }).forEach(function (x) {
        var a = el('a', { href: x.url, target: '_blank', rel: 'noopener noreferrer', text: x.n });
        box.appendChild(el('li', {}, [a, el('span', { class: 'src-lic' + (/^CC0|MIT|ISC/.test(x.lic) ? ' lic-ok' : ' lic-warn'), text: x.lic }), el('span', { class: 'muted small', text: x.note })]));
      });
    }
    kinds.forEach(function (k) {
      var c = el('button', { class: 'chip', type: 'button', text: PQ.KIND_LABEL[k], 'aria-pressed': 'false' }); c.dataset.k = k;
      c.addEventListener('click', function () { cur = k; show(); }); tabs.appendChild(c);
    });
    f.body.appendChild(tabs); f.body.appendChild(box);
    var srcSel = el('select', { class: 'field src-select', 'aria-label': 'Where to search', data: { t: 'src-select' } });
    PQ.SEARCH_SOURCES.forEach(function (o) { srcSel.appendChild(el('option', { value: o.id, text: o.label })); });
    var q = el('input', { class: 'field', type: 'search', maxlength: '30', placeholder: 'Search, e.g. tree', 'aria-label': 'Search words' });
    var res = el('p', { class: 'muted small src-res', 'aria-live': 'polite' });
    var go = el('button', { class: 'btn btn-ghost', type: 'button', data: { t: 'search' }, text: 'Search' });
    function curSrc() { var id = srcSel.value, i; for (i = 0; i < PQ.SEARCH_SOURCES.length; i++) if (PQ.SEARCH_SOURCES[i].id === id) return PQ.SEARCH_SOURCES[i]; return PQ.SEARCH_SOURCES[0]; }
    function sync() { var o = curSrc(); go.textContent = o.link ? 'Open site' : 'Search'; }
    srcSel.addEventListener('change', sync);
    function run() {
      var o = curSrc(), word = q.value.trim().slice(0, 30);
      if (o.link) { window.open(o.link(word), '_blank', 'noopener'); res.textContent = 'Opened ' + o.label.replace(/ \(opens site\)/, '') + ' in a new tab. Check the licence on each item.'; return; }
      res.textContent = 'Searching...';
      fetch('/api/assets?source=' + encodeURIComponent(o.id) + '&q=' + encodeURIComponent(word)).then(function (r) { return r.json(); }).then(function (d) {
        res.textContent = '';
        if (!d.items || !d.items.length) { res.textContent = d.offline ? 'Search is not reachable now. Use the links above.' : 'Nothing found. Try another word or site.'; return; }
        d.items.forEach(function (it) { res.appendChild(el('a', { href: it.url, target: '_blank', rel: 'noopener noreferrer', text: it.name + ' (' + it.source + ', ' + it.license + ')' })); res.appendChild(document.createTextNode('  ')); });
      }).catch(function () { res.textContent = 'Search is not reachable now. Use the links above.'; });
    }
    go.addEventListener('click', run);
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); run(); } });
    f.body.appendChild(el('div', { class: 'src-search' }, [srcSel, q, go])); f.body.appendChild(res);
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Copy the asset prompt', on: { click: function () {
      A.copy(PQ.assetPrompt(s)).then(function (ok) { A.toast(ok ? 'Prompt copied. Paste it into your AI tool.' : 'Could not copy'); });
    } } }));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { if (history.length > 1) history.back(); else A.go('#home'); } } }));
    show();
  });
})();
