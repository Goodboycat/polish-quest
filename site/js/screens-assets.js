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
    var q = el('input', { class: 'field', type: 'search', maxlength: '30', placeholder: 'Search CC0 models, e.g. tree', 'aria-label': 'Search CC0 models on Poly Haven' });
    var res = el('p', { class: 'muted small', 'aria-live': 'polite' });
    var go = el('button', { class: 'btn btn-ghost', type: 'button', text: 'Search Poly Haven' });
    go.addEventListener('click', function () {
      res.textContent = 'Searching...';
      fetch('/api/assets?type=models&q=' + encodeURIComponent(q.value)).then(function (r) { return r.json(); }).then(function (d) {
        res.textContent = '';
        if (!d.items || !d.items.length) { res.textContent = d.offline ? 'Search is not reachable now. Use the links above.' : 'Nothing found.'; return; }
        d.items.forEach(function (it) { res.appendChild(el('a', { href: it.url, target: '_blank', rel: 'noopener noreferrer', text: it.name + ' (CC0)' })); res.appendChild(document.createTextNode('  ')); });
      }).catch(function () { res.textContent = 'Search is not reachable now. Use the links above.'; });
    });
    f.body.appendChild(el('div', { class: 'src-search' }, [q, go])); f.body.appendChild(res);
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Copy the asset prompt', on: { click: function () {
      A.copy(PQ.assetPrompt(s)).then(function (ok) { A.toast(ok ? 'Prompt copied. Paste it into your AI tool.' : 'Could not copy'); });
    } } }));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { if (history.length > 1) history.back(); else A.go('#home'); } } }));
    show();
  });
})();
