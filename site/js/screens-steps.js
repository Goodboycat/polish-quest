(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A) return;
  var el = A.el;

  // extra stylesheet (allowed by CSP: style from 'self')
  if (!document.querySelector('link[data-pq-screens]')) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'css/screens.css';
    l.setAttribute('data-pq-screens', '1');
    document.head.appendChild(l);
  }

  function pulse() {
    try { if (window.PQ3D && window.PQ3D.pulse) window.PQ3D.pulse(); } catch (e) {}
  }

  PQ.offer = function (kind) {
    var c = window.PQ_CONFIG || {};
    var buy = c.BUY_URL || '', ask = c.CONTACT_URL || '';
    if (!buy && !ask) return null;
    if (kind === 'line') {
      return el('p', { class: 'muted' }, [
        document.createTextNode('Still stuck? '),
        el('a', { class: 'link', href: buy || ask, target: '_blank', rel: 'noopener', text: 'A human can look.' })
      ]);
    }
    var row = el('div', { class: 'row' }, []);
    if (buy) {
      row.appendChild(el('a', {
        class: 'btn btn-primary pq-a', href: buy, target: '_blank', rel: 'noopener', data: { t: 'buy' },
        text: 'Get a review' + (c.REVIEW_PRICE ? ', ' + c.REVIEW_PRICE : '')
      }));
    }
    if (ask) {
      row.appendChild(el('a', { class: 'btn btn-ghost pq-a', href: ask, target: '_blank', rel: 'noopener', text: 'Ask first' }));
    }
    return el('div', { class: 'card' }, [
      el('h2', { text: 'Want a human to check your game?' }),
      el('p', { text: 'I play your build and send you the 10 fixes that matter most, as ready-to-paste prompts.' }),
      row
    ]);
  };

  A.screen('step', function (root, param) {
    if (!A.state.scan) { A.go('#home'); return; }
    var n = Math.max(0, Math.min(26, parseInt(param, 10) || 0));
    var ctx = A.ctx();
    var p = n > 0 ? (PQ.PROMPTS || [])[n - 1] : null;
    var text = '';
    try { text = n === 0 ? PQ.renderPrompt0(ctx) : PQ.renderPrompt(p, ctx); } catch (e) { text = ''; }

    var f = A.frame(root, n === 0
      ? { kicker: 'Before step 1', title: 'Ground rules', lead: 'Paste this first in every new chat. It stops the AI from breaking your game.' }
      : { kicker: 'Step ' + n + ' of 26', title: p ? p.title : 'Step ' + n });

    if (p) {
      try {
        var cv = PQ.coverage(p, ctx);
        if (cv && cv.ratio >= 0.6 && cv.tracked >= 2) {
          f.body.appendChild(el('p', { class: 'tag', text: 'Your game mostly has this. The prompt only checks.' }));
        }
      } catch (e) {}
    }

    var lines = n === 0
      ? ['Copy the prompt', 'Paste it into your AI tool', 'Then come back here']
      : ['Copy the prompt', 'Paste it into your AI tool and let it finish', 'Play your game, then come back'];
    var ol = el('ol', { class: 'stack howto' }, []);
    lines.forEach(function (t, i) {
      ol.appendChild(el('li', {}, [
        el('span', { class: 'num', 'aria-hidden': 'true', text: String(i + 1) }),
        el('span', { text: t })
      ]));
    });
    f.body.appendChild(ol);

    var pre = el('pre', { tabindex: '0' }, []);
    pre.textContent = text;
    var panel = el('div', { class: 'panel promptbox hidden' }, [pre]);
    var read = el('button', { class: 'link', type: 'button', 'aria-expanded': 'false', text: 'Read the prompt' }, []);
    function setOpen(o) {
      panel.classList.toggle('hidden', !o);
      read.setAttribute('aria-expanded', o ? 'true' : 'false');
      read.textContent = o ? 'Hide the prompt' : 'Read the prompt';
    }
    read.addEventListener('click', function () { setOpen(panel.classList.contains('hidden')); });
    f.body.appendChild(read);
    f.body.appendChild(panel);

    var copyB = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'copy' }, text: 'Copy prompt' }, []);
    var nextB = el('button', { class: 'btn btn-ghost', type: 'button', data: { t: 'next' }, text: n === 0 ? 'Next: step 1' : 'Done, next step' }, []);

    copyB.addEventListener('click', function () {
      Promise.resolve(A.copy(text)).then(function (ok) {
        if (ok) {
          copyB.textContent = 'Copied';
          copyB.className = 'btn btn-ghost';
          nextB.className = 'btn btn-primary';
          pulse();
        } else {
          A.toast('Could not copy. Open "Read the prompt" and copy by hand.');
          setOpen(true);
        }
      }, function () {
        A.toast('Could not copy. Open "Read the prompt" and copy by hand.');
        setOpen(true);
      });
    });
    nextB.addEventListener('click', function () {
      if (!A.state.done) A.state.done = {};
      A.state.done[n] = true;
      A.save();
      pulse();
      A.go(n < 26 ? '#step/' + (n + 1) : '#done');
    });

    f.actions.appendChild(copyB);
    f.actions.appendChild(nextB);
    if (n > 0) {
      f.actions.appendChild(el('button', {
        class: 'link', type: 'button', text: 'Back',
        on: { click: function () { A.go('#step/' + (n - 1)); } }
      }, []));
    }
  });

  A.screen('done', function (root) {
    var f = A.frame(root, {
      kicker: 'Finished', title: 'All 26 done. Ship it.',
      lead: 'Your game is polished. Play it once more, then publish.'
    });
    var o = PQ.offer('card');
    if (o) f.body.appendChild(o);
    f.actions.appendChild(el('button', {
      class: 'btn btn-ghost', type: 'button', text: 'See all steps',
      on: { click: function () { A.go('#overview'); } }
    }, []));
  });
})();
