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
    var f = A.frame(root, { kicker: 'Map', title: 'All steps' });
    f.body.classList.add('pq-scroll');
    var done = A.state.done || {};
    var cur = -1, count = 0, i;
    for (i = 0; i <= 26; i++) {
      if (!done[i] && cur < 0) cur = i;
      if (i > 0 && done[i]) count++;
    }
    var grid = el('div', { class: 'tiles' }, []);
    for (i = 0; i <= 26; i++) {
      (function (n) {
        var p = n > 0 ? (PQ.PROMPTS || [])[n - 1] : null;
        var title = n === 0 ? 'Ground rules' : (p ? p.title : 'Step ' + n);
        var b = el('button', {
          class: 'tile' + (n === cur ? ' is-cur' : done[n] ? ' is-done' : ''),
          type: 'button', title: title, 'aria-label': 'Step ' + n + ': ' + title, text: String(n),
          on: { click: function () { A.go('#step/' + n); } }
        }, []);
        if (n === cur) b.setAttribute('aria-current', 'step');
        grid.appendChild(b);
      })(i);
    }
    f.body.appendChild(grid);
    f.body.appendChild(el('p', { class: 'muted', text: count + ' of 26 done' }));
    var o = PQ.offer && PQ.offer('card');
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

  A.screen('privacy', function (root) {
    var f = A.frame(root, { kicker: 'Privacy', title: 'Your game stays with you.' });
    [
      'Your zip never leaves your device. Only a short question you type to the coach is sent to an AI service (Coarena).',
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
