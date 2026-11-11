/* Polish Quest - Scan screen ("what I found"). Everything is editable with one tap. We ask when we cannot tell. */
(function (g) {
  'use strict';
  var PQ = g.PQ, UI = PQ.ui, el = UI.el;
  var V = UI.views.scan = {};
  var root, detailText = '';

  function fIcon(name) { return name === 'enemy_bug' ? UI.art('enemy_bug', 'fi') : UI.icon(name, 'fi'); }
  function opt(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function touch() { UI.save(); render(); }

  function askPanel(s) {
    var qs = [];
    if (!s.engineSure) qs.push('engineId');
    if (!s.genreSure) qs.push('genreId');
    if (!qs.length) return null;
    var p = el('section', 'panel ask');
    p.appendChild(el('h2', '', 'I NEED YOUR HELP'));
    p.appendChild(el('p', 'fine', 'I will not guess quietly. Tap the answer that fits. You can change it later.'));
    qs.forEach(function (key) {
      var q = el('div', 'q'), isEng = key === 'engineId';
      var alts = (isEng ? s.engineAlts : s.genreAlts) || [];
      var cur = isEng ? s.engineId : s.genreId, list = isEng ? PQ.ENGINES : PQ.GENRES;
      var ids = [];
      if (cur !== 'unknown' && cur !== 'other') ids.push(cur);
      alts.forEach(function (a) { if (ids.indexOf(a) < 0) ids.push(a); });
      ids = ids.slice(0, 4);
      q.appendChild(el('p', '', isEng
        ? (s.engineId === 'unknown' ? 'I could not tell what this game is built with.' : 'I think it is ' + PQ.engineById(s.engineId).label + ', but I am not sure. Is that right?')
        : (s.genreId === 'other' ? 'I could not tell what kind of game it is.' : 'It looks like a ' + PQ.genreById(s.genreId).label.toLowerCase() + ' game, but I am not sure.')));
      var chips = el('div', 'chips');
      ids.forEach(function (id) {
        chips.appendChild(UI.chip({ label: opt(list, id).label, icon: 'check', pressed: false, onTap: function () { s[key] = id; s[isEng ? 'engineSure' : 'genreSure'] = true; touch(); } }));
      });
      var other = isEng ? 'unknown' : 'other';
      chips.appendChild(UI.chip({ label: isEng ? 'Something else' : 'Something else', icon: 'question', pressed: false, onTap: function () { s[key] = other; s[isEng ? 'engineSure' : 'genreSure'] = true; touch(); } }));
      q.appendChild(chips);
      p.appendChild(q);
    });
    return p;
  }

  function basics(s) {
    var p = el('section', 'panel');
    p.appendChild(el('h2', '', 'YOUR GAME'));
    var name = el('input', 'in'); name.type = 'text'; name.maxLength = 60; name.value = s.name || ''; name.autocomplete = 'off'; name.placeholder = 'Type the name of your game';
    name.id = 'f-name'; name.setAttribute('autocapitalize', 'words');
    name.addEventListener('input', function () { s.name = name.value; s.nameSure = true; UI.save(); });
    var l1 = el('label', 'field', [el('span', '', s.nameSure ? 'NAME' : 'NAME (I COULD NOT FIND IT, PLEASE TYPE IT)'), name]);
    l1.setAttribute('for', 'f-name');

    function select(id, label, list, cur, key, sureKey) {
      var sel = el('select', 'in'); sel.id = id;
      list.forEach(function (o) { var op = el('option', '', o.label); op.value = o.id; if (o.id === cur) op.selected = true; sel.appendChild(op); });
      sel.addEventListener('change', function () { s[key] = sel.value; s[sureKey] = true; touch(); });
      var f = el('label', 'field', [el('span', '', label), sel]); f.setAttribute('for', id); return f;
    }
    p.appendChild(l1);
    p.appendChild(select('f-engine', 'BUILT WITH', PQ.ENGINES, s.engineId, 'engineId', 'engineSure'));
    if (s.engineWhy && s.engineId !== 'unknown') p.appendChild(el('p', 'fine', [UI.icon('info', 'inl'), 'Because I saw ' + s.engineWhy + '.']));
    p.appendChild(select('f-genre', 'TYPE OF GAME', PQ.GENRES, s.genreId, 'genreId', 'genreSure'));
    if (s.genreWhy && s.genreId !== 'other') p.appendChild(el('p', 'fine', [UI.icon('info', 'inl'), 'Words I noticed: ' + s.genreWhy + '.']));
    var eng = PQ.engineById(s.engineId);
    if (eng.ed) p.appendChild(el('p', 'fine', [UI.icon('warning', 'inl'), eng.label + ' is mostly edited with clicks in its editor. An AI coding tool can read the code, but cannot click for you. The prompts say this to the AI.']));
    return p;
  }

  function phonePanel(s) {
    var p = el('section', 'panel');
    p.appendChild(el('h2', '', 'WEAKEST PHONE'));
    p.appendChild(el('p', 'fine', 'This is the one thing I cannot know from a zip. Tap the closest one. If you are not sure, keep the cheap Android.'));
    var chips = el('div', 'chips');
    PQ.DEVICES.forEach(function (d) {
      chips.appendChild(UI.chip({ label: d.label, sub: d.sub, icon: d.icon, pressed: s.deviceId === d.id, onTap: function () { s.deviceId = d.id; touch(); } }));
    });
    p.appendChild(chips);
    return p;
  }

  function featPanel(s) {
    var p = el('section', 'panel');
    p.appendChild(el('h2', '', 'WHAT THE GAME ALREADY HAS'));
    p.appendChild(el('p', 'fine', 'The prompts will skip or only check what is already there. Tap a box to change it if I got it wrong.'));
    var grid = el('div', 'feats');
    var detail = el('p', 'detail', detailText); detail.setAttribute('role', 'status');
    PQ.FEATURES.forEach(function (f) {
      var st = (s.features && s.features[f.key]) || 'none';
      var b = el('button', 'feat ' + st); b.type = 'button';
      var label = st === 'found' ? 'FOUND' : (st === 'maybe' ? 'MAYBE' : 'NOT FOUND');
      var ic = st === 'found' ? 'check' : (st === 'maybe' ? 'question' : 'cross');
      b.appendChild(fIcon(f.icon));
      b.appendChild(el('span', '', [el('span', 'nm', f.label), el('span', 'st', [UI.icon(ic), label])]));
      b.setAttribute('aria-label', f.label + ': ' + label.toLowerCase() + '. Tap to change.');
      b.addEventListener('click', function () {
        var cur = (s.features && s.features[f.key]) || 'none';
        s.features = s.features || {};
        s.features[f.key] = cur === 'found' ? 'none' : 'found';
        var ev = s.evidence && s.evidence[f.key];
        detailText = f.label + ': ' + (s.features[f.key] === 'found' ? 'marked as already in the game.' : 'marked as not in the game.') + (ev && ev.length ? ' I saw hints in ' + ev.join(', ') + '.' : '');
        UI.save(); render();
        var again = root.querySelectorAll('.feat'); var idx = PQ.FEATURES.indexOf(f); if (again[idx]) again[idx].focus();
      });
      grid.appendChild(b);
    });
    p.appendChild(grid); p.appendChild(detail);
    return p;
  }

  function protectPanel(s) {
    var p = el('section', 'panel');
    p.appendChild(el('h2', '', 'NEVER TOUCH THESE'));
    p.appendChild(el('p', 'fine', 'Files and folders the AI must never edit. I filled these in from your zip. Remove one with the cross, or add your own.'));
    var pills = el('div', 'pills');
    if (!s.protect.length) pills.appendChild(el('p', 'fine', 'Nothing found. The prompts will tell the AI to stop and ask before touching anything generated, third-party or binary.'));
    s.protect.forEach(function (x, i) {
      var rm = el('button'); rm.type = 'button'; rm.appendChild(UI.icon('cross')); rm.setAttribute('aria-label', 'Remove ' + x);
      rm.addEventListener('click', function () { s.protect.splice(i, 1); touch(); });
      pills.appendChild(el('span', 'pillx', [x, rm]));
    });
    p.appendChild(pills);
    var inp = el('input', 'in'); inp.type = 'text'; inp.id = 'f-protect'; inp.placeholder = 'Add a file or folder, like Assets/Plugins/'; inp.maxLength = 120; inp.autocomplete = 'off';
    var addBtn = UI.btn('Add', 'blue sm', 'plus', function () {
      var v = inp.value.replace(/\s+/g, ' ').trim(); if (!v) return;
      if (s.protect.indexOf(v) < 0 && s.protect.length < 30) s.protect.push(v);
      inp.value = ''; touch();
    });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
    var lab = el('label', 'sr', 'Add a protected file or folder'); lab.setAttribute('for', 'f-protect');
    p.appendChild(el('div', 'row', [lab, el('div', 'grow', [inp]), addBtn]));
    return p;
  }

  function notesPanel(s) {
    var arr = (s.notes || []).slice();
    var st = s.stats;
    if (!arr.length && !st) return null;
    var p = el('section', 'panel dark');
    p.appendChild(el('h2', '', 'GOOD TO KNOW'));
    var ul = el('ul', 'notes');
    if (st && !s.isSample) ul.appendChild(el('li', '', [UI.icon('zip'), el('span', '', 'Your zip has ' + st.files + ' files. I read the text of ' + st.read + ' of them, right here on your device. Nothing was uploaded and nothing was saved except the summary on this page.')]));
    arr.forEach(function (n) { ul.appendChild(el('li', '', [UI.icon(/^Warning/.test(n) ? 'warning' : 'info'), el('span', '', n)])); });
    p.appendChild(ul);
    return p;
  }

  function render() {
    var s = UI.state.scan; if (!s) return;
    UI.clear(root);
    var h = el('h1', 'sr', 'What I found'); h.id = 'h-scan'; root.appendChild(h);
    root.appendChild(el('div', 'vhead', [UI.icon('p_audit', 'big'), el('div', '', [el('p', 'px', 'WHAT I FOUND'), el('p', '', s.isSample ? 'This is a made-up example. Drop your own zip to see your game.' : 'Check this. Tap anything that is wrong. Nothing here leaves your device.')])]));
    var ask = askPanel(s); if (ask) root.appendChild(ask);
    var cols = el('div', 'cols', [el('div', '', [basics(s), phonePanel(s), protectPanel(s)]), el('div', '', [featPanel(s), notesPanel(s)])]);
    Array.prototype.forEach.call(cols.children, function (c) { c.className = 'colx'; });
    root.appendChild(cols);
    var go = UI.btn('Looks right - show my quests', 'green', 'play', function () { s.engineSure = true; s.genreSure = true; UI.save(); UI.go('#quest'); });
    var again = UI.btn('Drop a different zip', 'ghost sm', 'zip', function () { UI.go('#home'); });
    root.appendChild(el('div', 'row end', [again, go]));
    UI.save();
  }

  V.init = function () { root = UI.$('v-scan'); };
  V.enter = function (arg, changed) { if (changed) detailText = ''; render(); };
})(typeof window !== 'undefined' ? window : globalThis);
