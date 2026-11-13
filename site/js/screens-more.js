(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A) return;
  var el = A.el;

  A.screen('overview', function (root) {
    if (!A.state.scan) {
      var f0 = A.frame(root, { kicker: 'Map', title: 'All steps', lead: 'Add your game first.' });
      f0.actions.appendChild(el('button', {
        class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Choose your game',
        on: { click: function () { A.go('#home'); } }
      }, []));
      return;
    }
    var f = A.frame(root, { kicker: 'Map', title: 'All steps', lead: 'Gold fill = next for you. Outlined = done.' });
    f.root = root;
    var done = A.state.done || {};
    var count = 0, i;
    for (i = 1; i <= 26; i++) { if (done[i]) count++; }
    var cap = el('p', { class: 'ov-cap', 'aria-live': 'polite' });
    function title(n) { var p = n > 0 ? (PQ.PROMPTS || [])[n - 1] : null; return n === 0 ? 'Ground rules' : (p ? n + '. ' + p.title : 'Step ' + n); }
    var nextN = 0;
    for (i = 1; i <= 26; i++) if (!done[i]) { nextN = i; break; }
    function idle() { cap.textContent = nextN ? 'Next for you: ' + title(nextN) : 'All 26 done.'; }
    var rules = el('button', {
      class: 'chip ov-rules' + (done[0] ? ' is-done' : ''), type: 'button', text: 'Ground rules (paste first)',
      on: { click: function () { A.go('#step/0'); }, mouseenter: function () { cap.textContent = 'Ground rules: paste first in every new chat.'; }, mouseleave: idle }
    }, []);
    var grid = el('div', { class: 'tiles' }, []);
    for (i = 1; i <= 26; i++) {
      (function (n) {
        var b = el('button', {
          class: 'tile' + (n === nextN ? ' is-cur' : done[n] ? ' is-done' : ''),
          type: 'button', title: title(n), 'aria-label': 'Step ' + title(n), text: String(n),
          on: {
            click: function () { A.go('#step/' + n); },
            mouseenter: function () { cap.textContent = title(n); }, mouseleave: idle,
            focus: function () { cap.textContent = title(n); }, blur: idle
          }
        }, []);
        if (n === nextN) b.setAttribute('aria-current', 'step');
        grid.appendChild(b);
      })(i);
    }
    f.body.appendChild(rules);
    f.body.appendChild(grid);
    f.body.appendChild(cap);
    idle();
    f.body.appendChild(el('p', { class: 'muted ov-count', text: count + ' of 26 done' }));
    var o = PQ.offer && PQ.offer('line');
    if (o) f.body.appendChild(o);
  });

  A.screen('fix', function (root) {
    var f = A.frame(root, { kicker: 'Fix Kit', title: 'Something went wrong?', lead: 'Pick what happened.' });
    f.body.classList.add('pq-scroll');
    var list = el('div', { class: 'fixlist' }, []);
    var openBtn = null, openBox = null;

    function close() {
      if (openBtn) openBtn.setAttribute('aria-pressed', 'false');
      if (openBox && openBox.parentNode) openBox.parentNode.removeChild(openBox);
      openBtn = openBox = null;
    }

    function build(item) {
      var params = {};
      var box = el('div', { class: 'fixopts' }, []);
      var copyB = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'copy' }, text: 'Copy fix prompt' }, []);
      (item.params || []).forEach(function (pm) {
        var opts = pm.options || [];
        if (!opts.length) return;
        params[pm.key] = opts[0].id;
        if (pm.label) box.appendChild(el('p', { class: 'muted', text: pm.label }));
        var chips = el('div', { class: 'chips' }, []);
        opts.forEach(function (op, k) {
          var c = el('button', { class: 'chip', type: 'button', 'aria-pressed': k === 0 ? 'true' : 'false', text: op.label }, []);
          c.addEventListener('click', function () {
            params[pm.key] = op.id;
            Array.prototype.forEach.call(chips.children, function (x) {
              x.setAttribute('aria-pressed', x === c ? 'true' : 'false');
            });
            copyB.textContent = 'Copy fix prompt';
          });
          chips.appendChild(c);
        });
        box.appendChild(chips);
      });
      copyB.addEventListener('click', function () {
        var text = '';
        try {
          var ctx = A.state.scan ? A.ctx() : PQ.makeCtx(PQ.detect.sample());
          text = PQ.renderFix(item, ctx, params);
        } catch (e) { text = ''; }
        if (!text) { A.toast('Could not build the prompt. Add your game first.'); return; }
        Promise.resolve(A.copy(text)).then(function (ok) {
          if (ok) {
            copyB.textContent = 'Copied';
            try { if (window.PQ3D && window.PQ3D.pulse) window.PQ3D.pulse(); } catch (e) {}
          } else {
            A.toast('Could not copy. Try again.');
          }
        }, function () { A.toast('Could not copy. Try again.'); });
      });
      box.appendChild(copyB);
      return box;
    }

    (PQ.FIXKIT || []).forEach(function (item) {
      var b = el('button', { class: 'btn btn-ghost fixbtn', type: 'button', 'aria-pressed': 'false', text: item.title }, []);
      if (item.blurb) b.setAttribute('title', item.blurb);
      b.addEventListener('click', function () {
        var same = openBtn === b;
        close();
        if (same) return;
        openBtn = b;
        b.setAttribute('aria-pressed', 'true');
        openBox = build(item);
        list.insertBefore(openBox, b.nextSibling);
      });
      list.appendChild(b);
    });
    f.body.appendChild(list);
    var o = PQ.offer && PQ.offer('line');
    if (o) f.body.appendChild(o);
  });

  A.screen('done', function (root) {
    var f = A.frame(root, { kicker: 'Finished', title: 'All 26 done. Ship it.', lead: 'Play your game once more from start to end, then publish it.' });
    try { if (window.PQ3D && window.PQ3D.setMood) window.PQ3D.setMood('done'); } catch (e) { /* optional */ }
    var o = PQ.offer && PQ.offer('card');
    if (o) f.body.appendChild(o);
    f.actions.appendChild(el('button', {
      class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Is it good enough?',
      on: { click: function () { A.go('#enough'); } }
    }, []));
    f.actions.appendChild(el('button', {
      class: 'btn btn-ghost', type: 'button', text: 'Open the Fix Kit',
      on: { click: function () { A.go('#fix'); } }
    }, []));
  });

  A.screen('privacy', function (root) {
    var f = A.frame(root, { kicker: 'Privacy', title: 'Your game stays with you.' });
    [
      'Your zip never leaves your device. Only two things can be sent to an AI service (Coarena), and only when you press a button: a short question you type to the coach, or your goal and seven scores if you ask for a second opinion. Never your code or file names.',
      'Your progress is saved in this browser only.',
      'No account. No tracking.'
    ].forEach(function (t) {
      f.body.appendChild(el('p', { class: 'lead', text: t }));
    });
    f.actions.appendChild(el('button', {
      class: 'btn btn-ghost', type: 'button', text: 'Back',
      on: { click: function () { if (history.length > 1) history.back(); else A.go('#home'); } }
    }, []));
  });
})();
