/* Ads screen (rewarded only, never forced) and the honest "is it good enough" screen. */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A || !PQ.adsReview) return;
  var el = A.el;

  function numbered(list) {
    var ol = el('ol', { class: 'rule-list' });
    list.forEach(function (t, i) {
      ol.appendChild(el('li', {}, [el('span', { class: 'num', text: String(i + 1) }), el('span', { text: t })]));
    });
    return ol;
  }

  function fold(label, list, hideLabel) {
    var box = el('div', { class: 'fold' });
    var body = numbered(list); body.classList.add('hidden');
    var b = el('button', { class: 'link', type: 'button', text: label, 'aria-expanded': 'false' });
    b.addEventListener('click', function () {
      var h = body.classList.toggle('hidden');
      b.setAttribute('aria-expanded', h ? 'false' : 'true');
      b.textContent = h ? label : hideLabel;
    });
    box.appendChild(b); box.appendChild(body);
    return box;
  }

  A.screen('ads', function (root) {
    var s = A.state.scan;
    if (!s) { A.go('#home'); return; }
    var rv = PQ.adsReview(s, s.goalId);
    if (!rv) { A.go('#step/0'); return; }
    root.classList.add('wide');
    var f = A.frame(root, { kicker: 'Ads', title: rv.title });
    var box = el('div', { class: 'ads-card ads-' + rv.level });
    var shown = rv.lines.filter(function (t) { return t.indexOf('This reads code only') !== 0; }).slice(0, 2);
    shown.forEach(function (t) { box.appendChild(el('p', { text: t })); });
    f.body.appendChild(box);
    f.body.appendChild(el('p', { class: 'muted small', text: 'Read from code only. I cannot see the game running, so test it by playing.' }));
    f.body.appendChild(fold('See the 6 rules for fair ads', PQ.RULES_ADS, 'Hide the rules'));

    var next = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Start the steps', on: { click: function () { A.go('#step/0'); } } });
    if (rv.needPrompt) {
      var text = PQ.renderAdsPrompt(PQ.makeCtx(s), rv);
      var copy = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'copy' }, text: 'Copy the ads prompt' });
      next.className = 'btn btn-ghost';
      copy.addEventListener('click', function () {
        A.copy(text).then(function (ok) {
          if (!ok) { A.toast('Copy failed. Select the text and copy it by hand.'); return; }
          copy.textContent = 'Copied';
          copy.className = 'btn btn-ghost';
          next.className = 'btn btn-primary';
        });
      });
      f.actions.appendChild(copy);
    }
    f.actions.appendChild(next);
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { A.go('#rating'); } } }));
  });

  A.screen('enough', function (root) {
    var f = A.frame(root, { kicker: 'After the steps', title: 'Is the game good enough?' });
    PQ.enoughLines().forEach(function (t) { f.body.appendChild(el('p', { class: 'lead', text: t })); });
    f.body.appendChild(fold('Playtest in 5 steps (20 minutes)', PQ.PLAYTEST, 'Hide the playtest'));
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'See all steps', on: { click: function () { A.go('#overview'); } } }));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Get a plan made for your game', on: { click: function () { A.go('#plan'); } } }));
  });

  A.screen('plan', function (root) {
    var f = A.frame(root, { kicker: 'Full plan', title: 'A plan written for your game' });
    var o = PQ.offer && PQ.offer('card');
    if (o) f.body.appendChild(o);
    else f.body.appendChild(el('p', { class: 'lead', text: 'The paid plan is not open yet.' }));
    var x = PQ.SAMPLE_REVIEW && PQ.SAMPLE_REVIEW.tasks[0];
    if (x) root.appendChild(el('aside', { class: 'plan-peek', 'aria-label': 'Preview of one task (invented example)' }, [
      el('span', { class: 'sr-tag', text: 'Sample task (invented)' }),
      el('b', { text: 'Task 1: ' + x.name }),
      el('pre', { class: 'sr-prompt', text: x.prompt.slice(0, 260) + (x.prompt.length > 260 ? '...' : '') }),
      el('span', { class: 'sr-k', text: 'Done when: ' + x.check }),
      el('hr', { class: 'sr-sep' }),
      el('b', { text: 'Task 2: ' + PQ.SAMPLE_REVIEW.tasks[1].name }),
      el('pre', { class: 'sr-prompt', text: PQ.SAMPLE_REVIEW.tasks[1].prompt }),
      el('span', { class: 'sr-k', text: 'Done when: ' + PQ.SAMPLE_REVIEW.tasks[1].check })
    ]));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { if (history.length > 1) history.back(); else A.go('#home'); } } }));
    /* line the sample card up with the order card: same top, same height */
    function align() {
      var pk = document.querySelector('.plan-peek'), oc = document.querySelector('.offer-card'), fr = pk && pk.parentElement;
      if (!pk || !oc || !fr || getComputedStyle(pk).display === 'none') return;
      var a = oc.getBoundingClientRect(), b = fr.getBoundingClientRect();
      pk.style.top = (a.top - b.top) + 'px'; pk.style.height = a.height + 'px'; pk.style.boxSizing = 'border-box';
    }
    requestAnimationFrame(function () { requestAnimationFrame(align); });
    setTimeout(align, 400); window.addEventListener('resize', align);
  });

  A.screen('sample', function (root) {
    var R = PQ.SAMPLE_REVIEW, i = 0;
    var f = A.frame(root, { kicker: 'Sample plan', title: 'A sample plan', lead: 'Invented example. Made-up game: ' + R.game.replace(' (made-up example)', '') + '.' });
    var card = el('div', { class: 'sr-one' });
    var cnt = el('p', { class: 'muted small', 'aria-live': 'polite' });
    f.body.appendChild(card); f.body.appendChild(cnt);
    var nextB = el('button', { class: 'btn btn-ghost', type: 'button', text: 'Next task', on: { click: function () { i = (i + 1) % R.tasks.length; draw(); } } });
    function draw() {
      var x = R.tasks[i];
      card.textContent = '';
      card.appendChild(el('b', { text: 'Task ' + (i + 1) + ': ' + x.name }));
      card.appendChild(el('span', { text: x.why }));
      card.appendChild(el('pre', { class: 'sr-prompt', text: x.prompt }));
      card.appendChild(el('span', { class: 'sr-k', text: 'Done when: ' + x.check }));
      cnt.textContent = (i + 1) + ' of ' + R.tasks.length + '. ' + R.more;
      nextB.textContent = i < R.tasks.length - 1 ? 'Next task' : 'First task again';
    }
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Get a plan for my game', on: { click: function () { A.go('#plan'); } } }));
    f.actions.appendChild(nextB);
    draw();
  });

  A.screen('store', function (root) {
    var f = A.frame(root, { kicker: 'For a game with a price', title: 'Store page checklist', lead: 'Six things a buyer looks for. It will not guarantee sales.' });
    var ul = el('ol', { class: 'rule-list' });
    PQ.STORE_CHECK.forEach(function (t, i) { ul.appendChild(el('li', {}, [el('span', { class: 'num', text: String(i + 1) }), el('span', { text: t })])); });
    f.body.appendChild(ul);
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Back', on: { click: function () { if (history.length > 1) history.back(); else A.go('#home'); } } }));
  });
})();
