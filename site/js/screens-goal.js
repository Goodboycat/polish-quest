/* Goal question and the rating screen. The rating is a code checklist weighted by the goal (see rating.js).
   The optional AI opinion sends only the goal, genre, engine, seven scores and missing feature names to /api/rate. Never code or file names. */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var A = PQ.app;
  if (!A) return;
  var el = A.el;
  var NS = 'http://www.w3.org/2000/svg';

  function g3(fn) { try { if (window.PQ3D && window.PQ3D[fn]) window.PQ3D[fn](); } catch (e) { /* optional */ } }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  /* ---------- goal ---------- */
  A.screen('goal', function (root) {
    var s = A.state.scan;
    if (!s) { A.go('#home'); return; }
    root.classList.add('wide');
    var f = A.frame(root, { kicker: 'Your goal', title: 'What is this game for?', lead: 'The rating depends on your answer.' });
    var grid = el('div', { class: 'goals', role: 'group', 'aria-label': 'Goal for this game', data: { t: 'goals' } });
    var cards = [], go = el('button', { class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Continue' });
    function sync() {
      var ok = !!(s.goalId && PQ.goalById(s.goalId));
      go.disabled = !ok;
      cards.forEach(function (c) { c.b.setAttribute('aria-pressed', c.id === s.goalId ? 'true' : 'false'); });
    }
    PQ.GOALS.forEach(function (g) {
      var b = el('button', { class: 'goal-card', type: 'button', data: { t: 'goal-' + g.id }, 'aria-pressed': 'false' }, [
        el('img', { class: 'goal-art', src: 'assets/art/' + g.art + '.png', alt: '', width: '88', height: '88' }),
        el('span', { class: 'goal-t', text: g.title }),
        el('span', { class: 'goal-s', text: g.sub })
      ]);
      b.addEventListener('click', function () { s.goalId = g.id; A.save(); g3('pulse'); sync(); });
      cards.push({ id: g.id, b: b });
      grid.appendChild(b);
    });
    go.addEventListener('click', function () { if (!go.disabled) A.go('#rating'); });
    f.body.appendChild(grid);
    f.actions.appendChild(go);
    f.actions.appendChild(el('button', { class: 'btn btn-ghost', type: 'button', text: 'Back', on: { click: function () { A.go('#kind'); } } }));
    sync();
  });

  /* ---------- rating ---------- */
  function ring(score) {
    var R = 54, C = 2 * Math.PI * R;
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 132 132');
    svg.setAttribute('class', 'ring-svg');
    svg.setAttribute('aria-hidden', 'true');
    var t = document.createElementNS(NS, 'circle');
    ['cx', 'cy'].forEach(function (k) { t.setAttribute(k, '66'); });
    t.setAttribute('r', String(R)); t.setAttribute('class', 'ring-track');
    var p = document.createElementNS(NS, 'circle');
    ['cx', 'cy'].forEach(function (k) { p.setAttribute(k, '66'); });
    p.setAttribute('r', String(R)); p.setAttribute('class', 'ring-fill');
    p.style.strokeDasharray = C + ' ' + C;
    p.style.strokeDashoffset = String(C);
    svg.appendChild(t); svg.appendChild(p);
    requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = String(C * (1 - score / 10)); }); });
    return svg;
  }

  function word(x) { return x < 3.5 ? 'Weak' : x < 6.5 ? 'Needs work' : 'Good'; }
  function bar(d, key, ev) {
    var fill = el('i');
    var head = el(ev ? 'button' : 'div', { class: 'bar-row' + (key ? ' is-key' : ''), type: ev ? 'button' : null, 'aria-expanded': ev ? 'false' : null }, [
      el('span', { class: 'bar-l', text: d.label }),
      el('span', { class: 'bar-t', 'aria-hidden': 'true' }, fill),
      el('span', { class: 'bar-n', text: d.score.toFixed(1) }),
      el('span', { class: 'bar-w w-' + word(d.score).toLowerCase().replace(/ /g, ''), text: word(d.score) }, d.score < 3.5 ? [el('i', { class: 'w-dia', 'aria-hidden': 'true' })] : [])
    ]);
    requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = Math.max(2, d.score * 10) + '%'; }); });
    var ai3 = -1; PQ.DIMS.forEach(function (x, k) { if (x.id === d.id) ai3 = k; });
    var fl3 = function () { try { if (window.PQ3D && PQ3D.focusArea) PQ3D.focusArea(ai3); } catch (e) { /* optional */ } };
    head.addEventListener('mouseenter', fl3); head.addEventListener('focus', fl3);
    if (!ev) return head;
    var note = typeof ev === 'string' ? el('p', { class: 'bar-ev muted hidden', text: ev }) : ev;
    head.addEventListener('click', function () {
      var h = note.classList.toggle('hidden');
      head.setAttribute('aria-expanded', h ? 'false' : 'true');
    });
    return el('div', { class: 'bar-item', role: 'listitem' }, [head, note]);
  }
  function evidence(d) {
    var parts = [];
    if (d.missLabels && d.missLabels.length) {
      var low = d.missLabels.slice(0, 2).map(function (x) { return x.charAt(0).toLowerCase() + x.slice(1); });
      var extra = d.missLabels.length - 2;
      parts.push('Could not see: ' + low.join(', ') + (extra > 0 ? ' and ' + extra + ' more' : ''));
    }
    else parts.push('Everything checked here was found.');
    if (d.step) {
      var p = PQ.PROMPTS[d.step - 1];
      if (p) parts.push('Step ' + d.step + ' (' + p.title + ') fixes this.');
    }
    return parts.join('. ').replace(/\.\./g, '.');
  }

  /* Evidence view: every feature behind an area, the file that showed it, and a button to correct the scan. */
  function detail(d, s) {
    var box = el('div', { class: 'bar-ev hidden' });
    box.appendChild(el('p', { class: 'muted', text: evidence(d) }));
    var list = el('ul', { class: 'ev-list' });
    d.found.concat(d.missing).forEach(function (k) {
      var f = PQ.featStatus(s, k);
      var what = f.eff === 'found' ? 'Seen' : f.eff === 'maybe' ? 'Maybe' : 'Could not see';
      var where = f.eff !== 'none' && f.files.length ? ' in ' + f.files.slice(0, 2).join(', ') : '';
      var up = f.eff === 'found';
      var btn = el('button', { class: 'link ev-btn', type: 'button', text: f.corrected ? 'Undo' : (up ? 'Mark wrong' : 'It is there'), 'aria-label': (f.corrected ? 'Undo your correction for ' : up ? 'Mark wrong: ' : 'Mark as there: ') + f.label });
      btn.addEventListener('click', function () {
        s.overrides = s.overrides || {};
        if (f.corrected) delete s.overrides[k]; else s.overrides[k] = up ? 'none' : 'found';
        A.save(); A.render();
      });
      list.appendChild(el('li', { class: 'ev-row' + (f.eff === 'found' ? ' is-ok' : '') }, [
        el('span', { class: 'ev-t' }, [el('b', { text: f.label }), el('span', { class: 'muted', text: ' ' + what + where + (f.corrected ? ' (you set this)' : '') })]),
        btn
      ]));
    });
    box.appendChild(list);
    return box;
  }

  function payload(s, r) {
    var scores = {}, missing = [];
    r.dims.forEach(function (d) { scores[d.label] = d.score; });
    r.dims.forEach(function (d) { d.missing.forEach(function (k) { if (missing.indexOf(k) < 0) missing.push(k); }); });
    var eng = byId(PQ.ENGINES, s.engineId), gn = byId(PQ.GENRES, s.genreId);
    return {
      goal: r.goal.id,
      genre: gn ? gn.label : '', engine: eng ? eng.label : '',
      overall: r.overall, scores: scores,
      missing: missing.slice(0, 12).map(function (k) { var F = PQ.FEATURES || []; for (var i = 0; i < F.length; i++) if (F[i].key === k) return F[i].label; return k; })
    };
  }

  A.screen('rating', function (root) {
    var s = A.state.scan;
    if (!s) { A.go('#home'); return; }
    if (!s.goalId || !PQ.goalById(s.goalId)) { A.go('#goal'); return; }
    var r = PQ.rate(s, s.goalId, A.state.done || {});
    root.classList.add('wide');
    var f = A.frame(root, { kicker: 'Your score', title: (s.name || 'Your game') + ': ' + r.tier });

    var score = el('div', { class: 'ring', role: 'img', 'aria-label': 'Score ' + r.overall.toFixed(1) + ' out of 10' }, [
      ring(r.overall),
      el('div', { class: 'ring-c' }, [el('b', { text: r.overall.toFixed(1) }), el('span', { text: 'of 10' })])
    ]);
    var chip = el('div', { class: 'goal-chip' }, [
      el('img', { src: 'assets/art/' + r.goal.art + '.png', alt: '', width: '40', height: '40' }),
      el('span', { text: r.goal.chip || r.goal.title }),
      el('button', { class: 'link', type: 'button', text: 'Change', 'aria-label': 'Change goal', on: { click: function () { A.go('#goal'); } } })
    ]);
    var note = el('p', { class: 'muted small rate-note', text: r.conf.level === 'ok' ? 'Scored from your code only. It cannot tell if the game is fun, and nobody played it.' : r.conf.why + ' Scored from code only.' });
    var why = el('p', { class: 'rate-why', text: PQ.rateLine(r) });
    var left = el('div', { class: 'rate-top' }, [score, el('div', { class: 'rate-side' }, [s.isSample ? el('span', { class: 'badge-ex', text: 'Example game' }) : null, chip, note].filter(Boolean))]);
    var right = el('div', {});
    f.body.appendChild(el('div', { class: 'rate-main' }, [left, right]));
    right.appendChild(why);
    if (s.prev) {
      var pv = s.prev, bits = [];
      bits.push('Compared with your last scan: ' + pv.before.toFixed(1) + ' then, ' + r.overall.toFixed(1) + ' now.');
      if (pv.gained.length) bits.push('Now seen: ' + pv.gained.slice(0, 3).join(', ').toLowerCase() + (pv.gained.length > 3 ? ' and ' + (pv.gained.length - 3) + ' more' : '') + '.');
      if (pv.lost.length) bits.push('No longer seen: ' + pv.lost.slice(0, 3).join(', ').toLowerCase() + '.');
      if (!pv.gained.length && !pv.lost.length) bits.push('No findings changed.');
      right.appendChild(el('p', { class: 'rate-cmp muted small', text: bits.join(' ') }));
    }

    try { if (window.PQ3D && PQ3D.setAreas) PQ3D.setAreas(r.dims.map(function (d) { return d.score; })); } catch (e) { /* 3D optional */ }
    var gold = el('div', { class: 'bars', role: 'list' });
    r.top.forEach(function (d) { gold.appendChild(bar(d, true, detail(d, s))); });
    if (r.top.length) right.appendChild(el('p', { class: 'rate-cap', text: 'Fix these first. Tap one to see why.' }));
    right.appendChild(gold);
    var rest = r.order.filter(function (d) { return r.top.indexOf(d) < 0; });
    var more = el('div', { class: 'bars hidden', role: 'list' });
    rest.forEach(function (d) { more.appendChild(bar(d, false, detail(d, s))); });
    var tog = el('button', { class: 'link', type: 'button', text: 'See all 7 areas', 'aria-expanded': 'false' });
    tog.addEventListener('click', function () {
      var hid = more.classList.toggle('hidden');
      tog.setAttribute('aria-expanded', hid ? 'false' : 'true');
      tog.textContent = hid ? 'See all 7 areas' : 'Hide the other areas';
    });
    if (rest.length) { right.appendChild(tog); right.appendChild(more); }
    if (!r.top.length) right.appendChild(el('p', { class: 'lead', text: 'No big gaps found in the code. Test it on a real phone anyway.' }));

    var ai = el('div', { class: 'ai-card hidden', 'aria-live': 'polite' });
    right.appendChild(ai);
    var aiBtn = el('button', { class: 'link', type: 'button', data: { t: 'ai-read' }, text: 'Ask the AI for a second opinion' });
    aiBtn.addEventListener('click', function () {
      ai.classList.remove('hidden');
      ai.textContent = 'Thinking...';
      aiBtn.disabled = true;
      var done = function (txt, off) {
        ai.textContent = '';
        ai.appendChild(el('p', { text: txt }));
        ai.appendChild(el('p', { class: 'muted small', text: off ? 'The AI was not reachable, so this is the built-in summary.' : 'From an AI (Coarena). It saw only your goal and these scores. It did not see your game.' }));
        aiBtn.disabled = false;
        aiBtn.textContent = 'Ask again';
      };
      var ctl = null, tm = 0;
      try { ctl = new AbortController(); tm = setTimeout(function () { ctl.abort(); }, 12000); } catch (e) { ctl = null; }
      var fall = function () { clearTimeout(tm); done(PQ.rateLine(r), true); };
      try {
        fetch('/api/rate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(s, r)), signal: ctl ? ctl.signal : undefined })
          .then(function (x) { if (!x.ok) throw new Error('x'); return x.json(); })
          .then(function (d) { clearTimeout(tm); if (d && d.reply) done(String(d.reply).slice(0, 900), false); else fall(); })
          .catch(fall);
      } catch (e) { fall(); }
    });

    f.actions.appendChild(el('button', {
      class: 'btn btn-primary', type: 'button', data: { t: 'next' }, text: 'Start the steps',
      on: { click: function () { g3('pulse'); A.go(PQ.adsReview && PQ.adsReview(s, s.goalId) ? '#ads' : '#step/0'); } }
    }));
    var moreBox = el('span', { class: 'more-box hidden' }, [aiBtn]);
    var moreTog = el('button', { class: 'link', type: 'button', text: 'Report and AI opinion', 'aria-expanded': 'false', data: { t: 'more' } });
    moreTog.addEventListener('click', function () { var h = moreBox.classList.toggle('hidden'); moreTog.setAttribute('aria-expanded', h ? 'false' : 'true'); moreTog.textContent = h ? 'Report and AI opinion' : 'Hide report and AI opinion'; });
    f.actions.appendChild(el('button', { class: 'link', type: 'button', data: { t: 'plan' }, text: 'See the plan', on: { click: function () { A.go('#plan'); } } }));
    f.actions.appendChild(moreTog);
    f.actions.appendChild(moreBox);
    moreBox.appendChild(el('button', { class: 'link', type: 'button', data: { t: 'export' }, text: 'Copy the report', on: { click: function () {
      A.copy(PQ.reportText(s, s.goalId, A.state.done || {})).then(function (ok) { A.toast(ok ? 'Report copied' : 'Could not copy'); });
    } } }));
  });
})();
