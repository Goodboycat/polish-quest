/* Polish Quest - Review screen: the optional custom review. The page makes a short summary the client can READ before sending.
   No code, no zip. This page never sends it anywhere: the client copies it and sends it by hand. */
(function (g) {
  'use strict';
  var PQ = g.PQ, UI = PQ.ui, el = UI.el;
  var V = UI.views.review = {};
  var root, box, wins = {}, pain = {}, note = '';

  var AREAS = [
    { id: 'feel', label: 'The game does not feel good yet', icon: 'p_combat' },
    { id: 'perf', label: 'It runs slow on phones', icon: 'p_perf' },
    { id: 'quit', label: 'Players quit early', icon: 'p_retain' },
    { id: 'confuse', label: 'Players get confused', icon: 'p_learn' },
    { id: 'bugs', label: 'Too many bugs', icon: 'bug' },
    { id: 'story', label: 'Story and ending feel weak', icon: 'p_cinema' }
  ];

  function summary() {
    var s = UI.state.scan, ctx = UI.ctx(), t = '';
    t += 'POLISH QUEST - REVIEW SUMMARY (made on my own device, no code and no zip inside)\n\n';
    t += 'Game: ' + ctx.name + '\nType: ' + ctx.genre.label + '\nBuilt with: ' + ctx.engine.label + '\nWeakest phone: ' + ctx.device.label + '\n';
    if (s && s.stats && !s.isSample) t += 'Size: ' + s.stats.files + ' files\n';
    var have = [], none = [];
    PQ.FEATURES.forEach(function (f) { var st = (s && s.features && s.features[f.key]) || 'none'; if (st === 'found') have.push(f.label); else if (st === 'none') none.push(f.label); });
    t += '\nAlready in the game: ' + (have.length ? have.join('; ') : 'nothing marked') + '\n';
    t += 'Not in the game: ' + (none.length ? none.join('; ') : 'nothing marked') + '\n';
    var p = AREAS.filter(function (a) { return pain[a.id]; }).map(function (a) { return a.label; });
    t += '\nMain problems (my words, tapped): ' + (p.length ? p.join('; ') : 'none picked') + '\n';
    var d = PQ.PROMPTS.filter(function (x) { return UI.state.done[x.n]; }).map(function (x) { return x.n; });
    t += 'Prompts already done: ' + (d.length ? d.join(', ') : 'none') + '\n';
    if (note.trim()) t += '\nNote from me: ' + note.trim().replace(/\s+/g, ' ').slice(0, 600) + '\n';
    return t;
  }

  function paint() {
    UI.clear(box);
    var cfg = g.PQ_CONFIG || {};
    var s = UI.state.scan;
    if (!s || s.isSample) {
      box.appendChild(el('p', '', 'Drop your own game zip first. The summary is built from what the page found, so it needs a real game.'));
      box.appendChild(UI.btn('Go to the drop zone', 'blue sm', 'zip', function () { UI.go('#home'); }));
      return;
    }
    box.appendChild(el('h3', '', 'WHAT IS THE MAIN PROBLEM? TAP ANY'));
    var chips = el('div', 'chips');
    AREAS.forEach(function (a) {
      chips.appendChild(UI.chip({ label: a.label, icon: a.icon, pressed: !!pain[a.id], onTap: function () { pain[a.id] = !pain[a.id]; paint(); } }));
    });
    box.appendChild(chips);
    var ta = el('textarea', 'in'); ta.id = 'rv-note'; ta.maxLength = 600; ta.rows = 3; ta.value = note;
    ta.placeholder = 'Optional. Do not paste code, keys or passwords.';
    var out = el('pre', 'sumbox'); out.textContent = summary(); out.id = 'rv-sum'; out.tabIndex = 0;
    ta.addEventListener('input', function () { note = ta.value; out.textContent = summary(); });
    var lab = el('label', 'field', [el('span', '', 'ANYTHING ELSE? (OPTIONAL)'), ta]); lab.setAttribute('for', 'rv-note');
    box.appendChild(lab);
    box.appendChild(el('h3', '', 'THIS IS EXACTLY WHAT WOULD BE SHARED. READ IT.'));
    box.appendChild(out);
    var copy = UI.btn('Copy summary', 'green', 'copy', function () { UI.copy(summary()).then(function (ok) { UI.log(ok ? 'Summary copied. You send it yourself.' : 'Could not copy here. Press and hold the text to select it.', ok ? 'check' : 'warning'); }); });
    var row = el('div', 'row', [copy]);
    if (cfg.CONTACT_URL) { var a = el('a', 'btn blue'); a.href = cfg.CONTACT_URL; a.rel = 'noopener noreferrer'; a.target = '_blank'; a.appendChild(UI.icon('mail')); a.appendChild(el('span', '', 'Contact the owner')); row.appendChild(a); }
    box.appendChild(row);
  }

  V.init = function () {
    root = UI.$('v-review'); var cfg = g.PQ_CONFIG || {};
    var h = el('h1', 'sr', 'Custom review'); h.id = 'h-review'; root.appendChild(h);
    root.appendChild(el('div', 'vhead', [UI.icon('star', 'big'), el('div', '', [el('p', 'px', 'CUSTOM REVIEW'), el('p', '', 'The free prompts are enough to start. A review is for when you want a person to plan it with you.')])]));

    var open = !!cfg.CONTACT_URL;
    root.appendChild(el('section', 'panel', [
      el('h2', '', 'WHAT IT IS'),
      el('p', '', 'A short, personal roadmap for your game: which prompts matter most for you, in what order, and what to watch out for. It is made by hand, from the summary below. I never ask for your code or your zip.'),
      el('p', 'fine', open
        ? [UI.icon('check', 'inl'), 'Reviews are open.' + (cfg.REVIEW_PRICE ? ' Price: ' + cfg.REVIEW_PRICE + '.' : ' The owner will tell you the price before you pay anything.')]
        : [UI.icon('info', 'inl'), 'Reviews are not open yet. You can still build the summary below. Nothing is sent from this page either way.'])
    ]));

    box = el('div', '');
    root.appendChild(el('section', 'panel', [el('h2', '', 'BUILD YOUR SUMMARY'), box]));

    var share = el('section', 'panel dark', [el('h2', '', 'BEFORE YOU SEND ANYTHING'), el('div', 'share', [
      el('div', '', [el('p', 'px', 'SHARED'), el('ul', '', [el('li', '', 'The short summary above, only if you copy it and send it yourself.'), el('li', '', 'Whatever you type in the optional note.'), el('li', '', 'Who gets it: only the owner of this page, by the way you choose to contact them.')])]),
      el('div', '', [el('p', 'px', 'NOT SHARED'), el('ul', '', [el('li', '', 'Your zip or any of your code.'), el('li', '', 'Any file name from inside your zip.'), el('li', '', 'Anything automatically. This page has no way to send it.')])])
    ])]);
    root.appendChild(share);
    if (cfg.PAY_PROVIDER) root.appendChild(el('p', 'fine', 'Payment is handled by ' + cfg.PAY_PROVIDER + ', not by this page.'));
  };
  V.enter = function () { paint(); };
})(typeof window !== 'undefined' ? window : globalThis);
