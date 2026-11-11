/* Polish Quest - Quest screen: prompt cards, the viewer sheet, the Fix Kit. */
(function (g) {
  'use strict';
  var PQ = g.PQ, UI = PQ.ui, el = UI.el, doc = g.document;
  var V = UI.views.quest = {};
  var EXTRA = { 3: 1, 7: 1, 18: 1, 26: 1 };      // prompts added on top of the owner's list
  var root, sheetRoot, sh = {}, openKey = '', lastFocus = null, fixParams = {};

  function nextUp() {
    for (var i = 0; i < PQ.PROMPTS.length; i++) if (!UI.state.done[PQ.PROMPTS[i].n]) return PQ.PROMPTS[i].n;
    return 0;
  }
  function doneCount() { var c = 0; PQ.PROMPTS.forEach(function (p) { if (UI.state.done[p.n]) c++; }); return c; }

  /* ---------- list ---------- */
  function card(key, icon, num, title, tags, cls, art) {
    var b = el('button', 'qcard ' + (cls || '')); b.type = 'button'; b.dataset.key = key;
    b.appendChild(art ? UI.art(icon, 'qi') : UI.icon(icon, 'qi'));
    b.appendChild(el('span', 'qn', num));
    b.appendChild(el('span', 'qt', title));
    var tg = el('span', 'qb'); (tags || []).forEach(function (t) { tg.appendChild(el('span', 'tag ' + t[0], t[1])); }); b.appendChild(tg);
    b.addEventListener('click', function () { lastFocus = b; UI.go('#quest/' + key); });
    return b;
  }

  function render() {
    var s = UI.state.scan; if (!s) return;
    var ctx = UI.ctx();
    UI.clear(root);
    var h = el('h1', 'sr', 'Your quests'); h.id = 'h-quest'; root.appendChild(h);

    var total = PQ.PROMPTS.length, dn = doneCount(), nx = nextUp();
    var pct = total ? dn / total : 0;
    var fill = el('i'); var bar = el('div', 'bar gold', [fill]);
    g.setTimeout(function () { fill.style.transform = 'scaleX(' + pct + ')'; }, 30);
    var top = el('section', 'panel qtop', [
      el('p', 'kicker', s.isSample ? 'EXAMPLE GAME' : 'YOUR GAME'),
      el('p', 'nm', ctx.name),
      el('p', 'qmeta', [ctx.genre.label, ' | ', ctx.engine.label, ' | ', ctx.device.label]),
      bar,
      el('p', 'fine', dn + ' of ' + total + ' prompts done' + (nx ? '. Next up: prompt ' + nx + '.' : '. All done. Well played.'))
    ]);
    var edit = UI.btn('Change what I found', 'ghost sm', 'gear', function () { UI.go('#scan'); });
    var rowtop = el('div', 'row', [edit]);
    if (dn) rowtop.appendChild(UI.btn('Reset ticks', 'ghost sm', 'f_undo', function () { UI.state.done = {}; UI.save(); UI.log('All ticks cleared.', 'info'); render(); }));
    top.appendChild(rowtop);
    root.appendChild(top);

    var how = el('section', 'panel dark', [
      el('h2', '', 'HOW IT WORKS'),
      el('ol', 'howto', [
        el('li', '', [el('b', '', '1'), el('span', '', 'Start a fresh chat in your AI coding tool. Use ' + PQ.MODEL + ' if you can. Paste the Ground Rules first.')]),
        el('li', '', [el('b', '', '2'), el('span', '', 'Then paste ONE numbered prompt. Wait until it finishes and you checked it.')]),
        el('li', '', [el('b', '', '3'), el('span', '', 'Tick it here, save a checkpoint, and go to the next. Never skip ahead. Chat got cut? Use the Fix Kit.')])
      ])
    ]);
    root.appendChild(how);

    root.appendChild(el('div', 'sechead', [UI.icon('p_zero'), 'START HERE']));
    root.appendChild(el('div', 'qgrid', [card('p0', 'p_zero', 'GROUND RULES', 'Prompt 0: paste this first, every chat', [['next', 'FIRST']], 'is-zero')]));

    root.appendChild(el('div', 'sechead', [UI.icon('scroll'), 'THE 26 PROMPTS, IN ORDER']));
    var grid = el('div', 'qgrid');
    PQ.PROMPTS.forEach(function (p) {
      var tags = [], cls = '';
      if (UI.state.done[p.n]) { tags.push(['done', 'DONE']); cls = 'is-done'; }
      else if (p.n === nx) { tags.push(['next', 'NEXT']); cls = 'is-next'; }
      if (EXTRA[p.n]) tags.push(['extra', 'EXTRA']);
      var cov = PQ.coverage(p, ctx);
      if (!UI.state.done[p.n] && cov.tracked >= 2 && cov.ratio >= 0.6) tags.push(['check', 'CHECK ONLY']);
      grid.appendChild(card('p' + p.n, p.icon, 'PROMPT ' + p.n, p.title, tags, cls));
    });
    root.appendChild(grid);
    root.appendChild(el('p', 'fine', [UI.icon('info', 'inl'), 'EXTRA means I added it on top of your 19 rules because the order works better with it. CHECK ONLY means the scan thinks the game already does most of it.']));

    root.appendChild(el('div', 'sechead', [UI.icon('wrench'), 'FIX KIT: FOR DEBUG AND POLISH DAYS']));
    root.appendChild(el('p', 'fine', 'Not part of the order. Use these any time. Tap one, answer with taps, copy, paste.'));
    var fg = el('div', 'fixgrid');
    PQ.FIXKIT.forEach(function (f) {
      var b = el('button', 'fixcard'); b.type = 'button'; b.dataset.key = 'f-' + f.id;
      b.appendChild(UI.icon(f.icon));
      b.appendChild(el('span', '', [el('b', '', f.title.toUpperCase()), el('span', '', f.blurb)]));
      b.addEventListener('click', function () { lastFocus = b; UI.go('#quest/f-' + f.id); });
      fg.appendChild(b);
    });
    root.appendChild(fg);
    root.appendChild(el('p', 'fine', 'Tip: ' + PQ.MODEL + ' is the standard here, but we have not tested these prompts on it. Read what the AI does and check each result yourself.'));
  }

  /* ---------- sheet ---------- */
  function buildSheet() {
    sheetRoot = UI.$('sheet-root');
    sh.back = el('div', 'sheet-back');
    sh.back.addEventListener('click', closeSheet);
    sh.icon = el('span'); sh.kick = el('span', 'kicker', ''); sh.title = el('span', 'ttl', '');
    var x = el('button', 'xbtn'); x.type = 'button'; x.appendChild(UI.icon('cross')); x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closeSheet); sh.x = x;
    sh.head = el('div', 'sh-head', [sh.icon, el('div', '', [sh.kick, sh.title]), x]);
    sh.ctrl = el('div', 'sh-ctrl'); sh.body = el('div', 'sh-body'); sh.body.tabIndex = 0; sh.foot = el('div', 'sh-foot');
    sh.panel = el('div', 'sheet', [sh.head, sh.ctrl, sh.body, sh.foot]);
    sh.panel.setAttribute('role', 'dialog'); sh.panel.setAttribute('aria-modal', 'true'); sh.panel.setAttribute('aria-label', 'Prompt');
    UI.add(sheetRoot, [sh.back, sh.panel]);
    doc.addEventListener('keydown', function (e) {
      if (!openKey) return;
      if (e.key === 'Escape') { e.preventDefault(); closeSheet(); return; }
      if (e.key === 'Tab') {
        var f = sh.panel.querySelectorAll('button, textarea, input, [tabindex="0"]'), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function paintText(text) {
    UI.clear(sh.body);
    var lines = text.split('\n'), n = 0;
    lines.forEach(function (ln, i) {
      if (!ln.trim()) return;
      if (i === 0) sh.body.appendChild(el('p', 'l1', ln));
      else if (n === 0 && /^(Game:|Rules this serves:)/.test(ln)) sh.body.appendChild(el('p', 'l2', ln));
      else if (/^ {4}\S/.test(ln)) sh.body.appendChild(el('p', 'li2', ln.trim()));
      else if (/^[A-Z][A-Z0-9 ]+( \(.*\))?$/.test(ln)) { n++; sh.body.appendChild(el('h3', '', ln)); }
      else if (/^(- |\d+\. )/.test(ln)) sh.body.appendChild(el('p', 'li', ln));
      else sh.body.appendChild(el('p', '', ln));
    });
    sh.body.scrollTop = 0;
  }

  function ctrlFix(f) {
    UI.clear(sh.ctrl);
    var P = fixParams[f.id] = fixParams[f.id] || {};
    function repaint() { paintText(text(f)); }
    (f.params || []).forEach(function (q) {
      sh.ctrl.appendChild(el('p', 'kicker', q.label.toUpperCase()));
      var chips = el('div', 'chips');
      q.options.forEach(function (o) {
        var c = UI.chip({ label: o.label, pressed: P[q.key] === o.id, onTap: function () {
          P[q.key] = (P[q.key] === o.id) ? '' : o.id;
          Array.prototype.forEach.call(chips.children, function (ch, i) { ch.setAttribute('aria-pressed', P[q.key] === q.options[i].id ? 'true' : 'false'); });
          repaint();
        } });
        chips.appendChild(c);
      });
      sh.ctrl.appendChild(chips);
    });
    var ta = el('textarea', 'in'); ta.id = 'fix-note'; ta.maxLength = 600; ta.rows = 2; ta.value = P.note || '';
    ta.placeholder = 'Optional, in your own words. Do not paste code, keys or passwords.';
    ta.addEventListener('input', function () { P.note = ta.value; repaint(); });
    var lab = el('label', 'field', [el('span', '', 'IN YOUR WORDS (OPTIONAL)'), ta]); lab.setAttribute('for', 'fix-note');
    sh.ctrl.appendChild(lab);
  }

  function text(item) {
    var ctx = UI.ctx();
    if (item === 'p0') return PQ.renderPrompt0(ctx);
    if (item.steps) return PQ.renderFix(item, ctx, fixParams[item.id] || {});
    return PQ.renderPrompt(item, ctx);
  }

  function closeSheet() { if (openKey) UI.go('#quest'); }

  function footBtns(key, item, num) {
    UI.clear(sh.foot);
    var copyBtn = UI.btn('Copy prompt', 'green', 'copy', function () {
      var t = text(item), bad = PQ.lint(t);
      if (bad.length) { UI.log('Something is wrong with this prompt text (' + bad.join(', ') + '). Please tell the site owner.', 'warning'); return; }
      UI.copy(t).then(function (ok) {
        if (ok) UI.log('Copied. Paste it into your AI tool.', 'check');
        else UI.log('Could not copy here. Press and hold the text to select it, or use Download.', 'warning');
      });
    });
    var dl = UI.btn('Save as file', 'ghost sm', 'download', function () {
      var nm = key === 'p0' ? 'prompt-0-ground-rules' : (num ? 'prompt-' + num : key.replace('f-', 'fix-'));
      UI.download(UI.slug(UI.ctx().name) + '-' + nm + '.txt', text(item)); UI.log('Saved a text file to your downloads.', 'check');
    });
    var left = el('div', 'grp', [copyBtn, dl]);
    var right = el('div', 'grp');
    if (num) {
      var done = !!UI.state.done[num];
      var tick = UI.btn(done ? 'Done. Tap to undo' : 'I did this one', done ? 'ghost sm' : 'blue sm', done ? 'check' : 'flag', function () {
        UI.state.done[num] = !UI.state.done[num]; if (!UI.state.done[num]) delete UI.state.done[num];
        UI.save(); UI.log(UI.state.done[num] ? 'Prompt ' + num + ' ticked off.' : 'Prompt ' + num + ' un-ticked.', UI.state.done[num] ? 'check' : 'info');
        footBtns(key, item, num); render();
      });
      right.appendChild(tick);
    }
    UI.add(sh.foot, [left, right]);
  }

  function sheetOpen(key) {
    var item, num = 0;
    if (key === 'p0') { item = 'p0'; }
    else if (/^p\d+$/.test(key)) { num = parseInt(key.slice(1), 10); item = PQ.PROMPTS.filter(function (p) { return p.n === num; })[0]; }
    else if (/^f-/.test(key)) { item = PQ.FIXKIT.filter(function (f) { return 'f-' + f.id === key; })[0]; }
    if (!item) { UI.go('#quest'); return; }
    var ctx = UI.ctx();
    UI.clear(sh.icon);
    var iconName = item === 'p0' ? 'p_zero' : item.icon;
    sh.icon.appendChild(UI.icon(iconName, 'ic'));
    sh.icon.className = '';
    sh.kick.textContent = item === 'p0' ? 'PASTE FIRST' : (num ? 'PROMPT ' + num + ' OF ' + PQ.STEP_COUNT : 'FIX KIT');
    sh.title.textContent = item === 'p0' ? 'Ground rules' : item.title;
    if (item.steps) ctrlFix(item); else UI.clear(sh.ctrl);
    paintText(text(item));
    footBtns(key, item, num);
    if (!openKey) {
      sheetRoot.setAttribute('aria-hidden', 'false'); sheetRoot.classList.add('open');
      g.setTimeout(function () { try { sh.x.focus({ preventScroll: true }); } catch (e) { sh.x.focus(); } }, 30);
    }
    openKey = key;
  }

  V.sheetRoute = function (arg) {
    if (!UI.state.scan) arg = '';
    if (!arg) {
      if (openKey) {
        openKey = ''; sheetRoot.classList.remove('open'); sheetRoot.setAttribute('aria-hidden', 'true');
        if (lastFocus && doc.body.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
      }
      return;
    }
    if (arg !== openKey) sheetOpen(arg);
  };

  V.init = function () { root = UI.$('v-quest'); buildSheet(); };
  V.enter = function (arg, changed) {
    if (changed || !root.firstChild) render();
    else if (!arg) render();
  };
})(typeof window !== 'undefined' ? window : globalThis);
