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
    var f = A.frame(root, { kicker: 'After the 26 steps', title: 'Is the game good enough?' });
    PQ.enoughLines().forEach(function (t) { f.body.appendChild(el('p', { class: 'lead', text: t })); });
    f.body.appendChild(fold('Playtest in 5 steps (20 minutes)', PQ.PLAYTEST, 'Hide the playtest'));
    var o = PQ.offer && PQ.offer('card');
    if (o) f.body.appendChild(o);
    f.actions.appendChild(el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'See all steps', on: { click: function () { A.go('#overview'); } } }));
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { A.go('#done'); } } }));
  });
})();
