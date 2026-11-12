(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A) return;
  var el = A.el;
  var STAGES = { list: 'Listing files', manifests: 'Finding the engine', read: 'Reading the code', think: 'Working out the plan', done: 'Ready' };
  var onFile = null;

  function g3(fn, a) { try { if (window.PQ3D && window.PQ3D[fn]) window.PQ3D[fn](a); } catch (e) {} }
  function col(f) {
    var c = f.body && f.body.parentElement;
    if (c) c.classList.add('s-col');
  }
  function nextStep() {
    var d = A.state.done || {};
    for (var i = 1; i <= 26; i++) if (!d[i]) return i;
    return 0;
  }
  PQ.nextStep = nextStep;

  document.addEventListener('dragover', function (e) { if (onFile) e.preventDefault(); });
  document.addEventListener('drop', function (e) {
    if (!onFile) return;
    e.preventDefault();
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFile(f);
  });
  document.addEventListener('pq:route', function (e) {
    if (!e.detail || e.detail.name !== 'home') onFile = null;
  });

  function home(root) {
    var st = A.state;
    var f = A.frame(root, {
      kicker: 'For indie game developers',
      title: 'Make your game feel finished.',
      lead: "Drop your game's zip. Get 26 copy-paste prompts for your AI coding tool, in the right order."
    });
    col(f);
    var err = el('p', { class: 's-err hidden', role: 'alert' });
    var note = el('p', { class: 'muted s-note', text: 'Your zip never leaves your device.' });
    var inp = el('input', { type: 'file', accept: '.zip,application/zip', class: 'hidden', 'aria-label': 'Game zip file' });
    f.body.appendChild(err);
    f.body.appendChild(inp);

    function begin(scan) {
      st.scan = scan; st.done = {};
      A.save();
      A.go('#scan');
    }
    function buttons() {
      f.actions.textContent = '';
      if (st.scan) {
        var n = nextStep();
        f.actions.appendChild(el('button', {
          class: 'btn btn-primary', type: 'button', data: { t: 'continue' },
          text: 'Continue ' + (st.scan.name || 'your game') + (n ? ', step ' + n : ''),
          on: { click: function () { A.go(n ? '#step/' + n : '#done'); } }
        }));
        f.actions.appendChild(el('button', {
          class: 'btn btn-ghost', type: 'button', text: 'Start over',
          on: { click: function () {
            PQ.store.clear();
            st.scan = null; st.done = {};
            g3('setProgress', 0);
            buttons();
          } }
        }));
        return;
      }
      f.actions.appendChild(el('button', {
        class: 'btn btn-primary', type: 'button', data: { t: 'zip' }, text: 'Choose your game .zip',
        on: { click: function () { inp.click(); } }
      }));
      f.actions.appendChild(el('button', {
        class: 'btn btn-ghost', type: 'button', data: { t: 'sample' }, text: 'Try the example game',
        on: { click: function () { begin(PQ.detect.sample()); } }
      }));
    }
    function run(file) {
      err.classList.add('hidden');
      g3('setMood', 'scan');
      var fill = el('div', { class: 's-fill' });
      var line = el('p', { class: 'muted s-stage', 'aria-live': 'polite', text: STAGES.list });
      f.actions.textContent = '';
      f.actions.appendChild(el('div', { class: 's-prog' }, [el('div', { class: 's-bar' }, [fill]), line]));
      var order = ['list', 'manifests', 'read', 'think', 'done'];
      PQ.detect.scan(file, {
        onProgress: function (stage, frac) {
          var i = Math.max(0, order.indexOf(stage));
          var v = (i + Math.max(0, Math.min(1, +frac || 0))) / order.length;
          if (stage === 'done') v = 1;
          fill.style.width = Math.round(v * 100) + '%';
          line.textContent = STAGES[stage] || STAGES.read;
        }
      }).then(begin, function (e) {
        g3('setMood', 'home');
        err.textContent = (e && e.message) || 'That file could not be read. Try another zip.';
        err.classList.remove('hidden');
        buttons();
      });
    }
    inp.addEventListener('change', function () { if (inp.files && inp.files[0]) run(inp.files[0]); });
    onFile = run;
    buttons();
    f.body.appendChild(note);
  }
  A.screen('home', home);

  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  A.screen('scan', function (root) {
    var st = A.state, scan = st.scan;
    if (!scan) { A.go('#home'); return; }
    var f = A.frame(root, { kicker: 'Check', title: 'Is this your game?' });
    col(f);
    var card = el('div', { class: 's-card' });
    f.body.appendChild(card);
    var dd = PQ.DEFAULT_DEVICE;
    if (!scan.deviceId) scan.deviceId = (dd && dd.id) || dd || (PQ.DEVICES[0] && PQ.DEVICES[0].id);

    function row(label, get, open, build) {
      var val = el('span', { class: 's-val', text: get() });
      var more = el('div', { class: 's-more hidden' });
      var btn = el('button', { class: 'link s-change', type: 'button', text: 'Change', 'aria-expanded': 'false', 'aria-label': 'Change ' + label });
      function set(o) {
        more.classList.toggle('hidden', !o);
        btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      }
      btn.addEventListener('click', function () { set(more.classList.contains('hidden')); });
      build(more, function (close) { val.textContent = get(); A.save(); if (close) set(false); });
      card.appendChild(el('div', { class: 's-row' }, [
        el('div', { class: 's-head' }, [el('span', { class: 's-lab muted', text: label }), val, btn]), more
      ]));
      if (open) set(true);
    }
    function chips(list, cur, pick, unsure) {
      return function (more, upd) {
        if (unsure) more.appendChild(el('p', { class: 'muted s-unsure', text: 'I am not sure. Pick the closest.' }));
        var wrap = el('div', { class: 's-chips' });
        var all = [];
        list.forEach(function (o) {
          var c = el('button', { class: 'chip', type: 'button', text: o.label, 'aria-pressed': o.id === cur() ? 'true' : 'false' });
          c.addEventListener('click', function () {
            pick(o.id);
            all.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
            upd(true);
          });
          all.push(c);
          wrap.appendChild(c);
        });
        more.appendChild(wrap);
      };
    }
    function lab(list, id) { var o = byId(list, id); return o ? o.label : 'Not known'; }

    row('Name', function () { return scan.name || 'My game'; }, false, function (more, upd) {
      var i = el('input', { class: 'field s-name', type: 'text', maxlength: '40', 'aria-label': 'Game name' });
      i.value = scan.name || '';
      i.addEventListener('input', function () {
        scan.name = i.value.trim().slice(0, 40) || 'My game';
        scan.nameSure = true;
        upd(false);
      });
      more.appendChild(i);
    });
    row('Engine', function () { return lab(PQ.ENGINES, scan.engineId); }, !scan.engineSure,
      chips(PQ.ENGINES, function () { return scan.engineId; }, function (id) { scan.engineId = id; scan.engineSure = true; }, !scan.engineSure));
    row('Type', function () { return lab(PQ.GENRES, scan.genreId); }, !scan.genreSure,
      chips(PQ.GENRES, function () { return scan.genreId; }, function (id) { scan.genreId = id; scan.genreSure = true; }, !scan.genreSure));
    row('Weakest device', function () { return lab(PQ.DEVICES, scan.deviceId); }, false,
      chips(PQ.DEVICES, function () { return scan.deviceId; }, function (id) { scan.deviceId = id; }, false));

    f.actions.appendChild(el('button', {
      class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Yes, start',
      on: { click: function () {
        scan.engineSure = true; scan.genreSure = true;
        A.save();
        g3('pulse');
        A.go('#step/0');
      } }
    }));
  });

  A.screen('step', function (root, param) {
    var st = A.state;
    if (!st.scan) { A.go('#home'); return; }
    var n = parseInt(param, 10);
    if (!(n >= 0 && n <= 26)) n = 0;
    var ctx = A.ctx();
    var p = n ? PQ.PROMPTS[n - 1] : null;
    var text = n ? PQ.renderPrompt(p, ctx) : PQ.renderPrompt0(ctx);
    var f = A.frame(root, n ? { kicker: 'Step ' + n + ' of 26', title: p.title } : {
      kicker: 'Before step 1', title: 'Ground rules',
      lead: 'Paste this first in every new chat. It stops the AI from breaking your game.'
    });
    col(f);
    if (n) {
      var cov = null;
      try { cov = PQ.coverage(p, ctx); } catch (e) {}
      if (cov && cov.ratio >= 0.6 && cov.tracked >= 2) {
        f.body.appendChild(el('p', { class: 'tag', text: 'Your game mostly has this. The prompt only checks.' }));
      }
      var ol = el('div', { class: 's-steps' });
      ['Copy the prompt', 'Paste it into your AI tool and let it finish', 'Play your game, then come back'].forEach(function (t, i) {
        ol.appendChild(el('div', { class: 's-step' }, [el('span', { class: 's-num', text: String(i + 1) }), el('span', { text: t })]));
      });
      f.body.appendChild(ol);
    }
    var pre = el('pre', { class: 'panel s-pre hidden', tabindex: '0', 'aria-label': 'Prompt text' });
    pre.textContent = text;
    f.body.appendChild(pre);

    var copy = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'copy' }, text: 'Copy prompt' });
    var next = el('button', { class: 'btn btn-ghost', type: 'button', data: { t: 'next' }, text: n ? 'Done, next step' : 'Next: step 1' });
    var read = el('button', { class: 'link', type: 'button', text: 'Read the prompt', 'aria-expanded': 'false' });
    copy.addEventListener('click', function () {
      A.copy(text).then(function (okc) {
        if (!okc) { pre.classList.remove('hidden'); A.toast('Copy failed. Select the text and copy it by hand.'); return; }
        copy.textContent = 'Copied';
        copy.className = 'btn btn-ghost';
        next.className = 'btn btn-primary';
        g3('pulse');
      });
    });
    next.addEventListener('click', function () {
      if (n) { st.done = st.done || {}; st.done[n] = true; A.save(); }
      g3('pulse');
      A.go(n < 26 ? '#step/' + (n + 1) : '#done');
    });
    read.addEventListener('click', function () {
      var o = pre.classList.toggle('hidden');
      read.setAttribute('aria-expanded', o ? 'false' : 'true');
      read.textContent = o ? 'Read the prompt' : 'Hide the prompt';
    });
    f.actions.appendChild(copy);
    f.actions.appendChild(next);
    f.actions.appendChild(read);
  });
})();
