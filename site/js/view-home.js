/* Polish Quest - Home screen: the drop zone. The zip is read with File.slice inside this page. Nothing is uploaded. */
(function (g) {
  'use strict';
  var PQ = g.PQ, UI = PQ.ui, el = UI.el, doc = g.document;
  var V = UI.views.home = {};
  var busy = false, errBox, drop, fill, msg, back, input;

  var STAGE = { list: 'Looking at the list of files', manifests: 'Checking the project files', read: 'Reading the code, on your device', think: 'Working out what you have', done: 'Done' };

  function showErr(text) { errBox.textContent = text; errBox.classList.add('on'); }
  function hideErr() { errBox.classList.remove('on'); errBox.textContent = ''; }

  function handle(file) {
    if (busy || !file) return;
    hideErr();
    busy = true; drop.classList.add('busy'); fill.style.transform = 'scaleX(.04)'; msg.textContent = STAGE.list;
    var t0 = Date.now();
    PQ.detect.scan(file, {
      onProgress: function (stage, frac) { msg.textContent = STAGE[stage] || 'Working'; fill.style.transform = 'scaleX(' + Math.max(.04, Math.min(1, frac)) + ')'; }
    }).then(function (res) {
      var same = UI.state.scan && UI.state.scan.name && res.name && UI.state.scan.name.toLowerCase() === res.name.toLowerCase();
      if (!same) UI.state.done = {};
      UI.state.scan = res; UI.save();
      var wait = Math.max(0, 450 - (Date.now() - t0));   // let the bar be seen
      g.setTimeout(function () {
        busy = false; drop.classList.remove('busy'); input.value = '';
        UI.log('Read ' + res.stats.files + ' files on this device. Nothing was uploaded.', 'check');
        UI.go('#scan');
      }, wait);
    }).catch(function (e) {
      busy = false; drop.classList.remove('busy'); input.value = '';
      showErr(e && e.message ? e.message : 'I could not read that file.');
      UI.log('That file could not be read.', 'warning');
    });
  }
  V.handle = handle;

  function dropFiles(ev) {
    ev.preventDefault();
    drop.classList.remove('over');
    var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (f) { if (UI.cur !== 'home') UI.go('#home'); handle(f); }
  }

  V.init = function () {
    var root = UI.$('v-home');
    var cfg = g.PQ_CONFIG || {};

    /* hero art */
    var art = el('div', 'hero-art', [
      UI.art('bg_hero', 'bg'), UI.art('mascot_cat', 'cat'),
      el('div', 'say', 'Drop your zip and I will line up your prompts.')
    ]);

    input = el('input'); input.type = 'file'; input.id = 'zip-input'; input.className = 'sr'; input.accept = '.zip,application/zip,application/x-zip-compressed,application/octet-stream';
    input.addEventListener('change', function () { if (input.files && input.files[0]) handle(input.files[0]); });
    fill = el('i'); back = el('div', 'bar', [fill]); msg = el('p', 'fine', ''); msg.setAttribute('role', 'status');
    var idle = el('div', 'idle', [UI.art('drop_arrow', 'arrow'), el('strong', '', 'DROP YOUR GAME ZIP HERE'), el('span', 'fine', 'or tap here to pick the file')]);
    idle.style.display = '';   // no-op: layout comes from the stylesheet
    var lab = el('label', 'drop panel', [input, idle, el('div', 'scanbox', [el('p', 'px', 'READING YOUR ZIP'), back, msg])]);
    drop = lab;
    lab.setAttribute('for', 'zip-input');
    ['dragenter', 'dragover'].forEach(function (n) { lab.addEventListener(n, function (e) { e.preventDefault(); lab.classList.add('over'); }); });
    ['dragleave', 'dragend'].forEach(function (n) { lab.addEventListener(n, function () { lab.classList.remove('over'); }); });
    lab.addEventListener('drop', dropFiles);
    // dropping a file anywhere else must not make the browser open it and leave the page
    g.addEventListener('dragover', function (e) { e.preventDefault(); });
    g.addEventListener('drop', dropFiles);

    errBox = el('p', 'err'); errBox.setAttribute('role', 'alert');
    var sample = UI.btn('Try the sample', 'ghost sm', 'play', function () {
      UI.state.scan = PQ.detect.sample(); UI.state.done = UI.state.done || {};
      UI.log('Showing a made-up example game.', 'info'); UI.go('#scan');
    });

    var resume = el('div', 'panel dark'); resume.id = 'resume';
    var main = el('div', 'hero-main', [
      el('h1', '', 'FIX YOUR GAME. ONE PROMPT AT A TIME.'),
      el('p', 'lead', 'Drop your game zip. I read it right here in your browser and hand you numbered prompts for your AI coding tool, in the right order, so it does not break what already works.'),
      resume, lab, errBox,
      el('div', 'row', [sample, el('span', 'fine', 'No zip handy? See how it looks.')])
    ]);
    root.appendChild(el('h2', 'sr', 'Start')); root.lastChild.id = 'h-home';
    root.appendChild(el('div', 'hero', [art, main]));

    root.appendChild(el('div', 'steps3', [
      el('div', 'step panel dark', [UI.icon('zip'), el('b', '', '1. DROP'), el('span', '', 'Your project zip. It never leaves your device.')]),
      el('div', 'step panel dark', [UI.icon('p_audit'), el('b', '', '2. CHECK'), el('span', '', 'I show what I found. Tap to fix anything.')]),
      el('div', 'step panel dark', [UI.icon('scroll'), el('b', '', '3. PASTE'), el('span', '', 'One prompt at a time into your AI tool.')])
    ]));

    var link = el('a', '', 'Test it yourself'); link.href = '#trust';
    root.appendChild(el('div', 'testbox panel', [UI.icon('airplane'), el('div', '', [
      el('p', 'px', 'TEST IT YOURSELF'),
      el('p', 'fine', ['Open this page, turn on airplane mode, then drop a zip. It still works, because nothing is sent anywhere. ', link, '.'])
    ])]));

    var model = el('p', 'fine', ['Standard model for these prompts: ', PQ.MODEL, '. We have not tested them on it or on any other model, so check every result yourself.']);
    var priv = el('a', '', 'Privacy page'); priv.href = 'privacy.html';
    root.appendChild(el('div', 'footer', [model, priv, el('span', '', 'Last updated ' + (cfg.LAST_UPDATED || ''))]));
  };

  V.enter = function () {
    var box = UI.$('resume'); if (!box) return;
    UI.clear(box);
    var s = UI.state.scan;
    if (!s || s.isSample) { box.style.display = 'none'; return; }
    box.style.display = '';
    var go = UI.btn('Continue with ' + (s.name || 'my game'), 'green sm', 'play', function () { UI.go('#quest'); });
    var forget = UI.btn('Forget it', 'ghost sm', 'cross', function () { UI.forget(); V.enter(); });
    UI.add(box, [el('p', 'fine', 'Saved on this device only. No code is saved, just the summary you confirmed.'), el('div', 'row', [go, forget])]);
  };
})(typeof window !== 'undefined' ? window : globalThis);
