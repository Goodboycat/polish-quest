/* Polish Quest - readiness rating. Pure function: scan result + goal id -> score out of 10.
   It only uses what the in-browser scan found in the code (found = 1, maybe = 0.5, none = 0). Nobody plays the game here.
   It is a checklist of known polish areas weighted by the goal. It does not predict sales or quality. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var VAL = { found: 1, maybe: 0.5, none: 0 };

  function fv(scan, key) { var s = scan && scan.features && scan.features[key]; return VAL[s] != null ? VAL[s] : 0; }
  function featLabel(key) {
    var F = PQ.FEATURES || [];
    for (var i = 0; i < F.length; i++) if (F[i].key === key) return F[i].label;
    return key;
  }
  function r1(x) { return Math.round(x * 10) / 10; }

  PQ.tier = function (score) {
    return score < 3.5 ? 'Early' : score < 5.5 ? 'Getting there' : score < 7.5 ? 'Solid' : 'Ready to show';
  };

  PQ.rate = function (scan, goalId, done) {
    var goal = PQ.goalById(goalId) || PQ.GOALS[0];
    scan = scan || {};
    done = done || {};
    var genre = PQ.genreById ? PQ.genreById(scan.genreId) : { combat: true };
    var combat = !genre || genre.combat !== false;
    var dims = [], sumW = 0, sum = 0;

    PQ.DIMS.forEach(function (d) {
      var keys = d.feats.filter(function (k) { return combat || !(d.skip && d.skip.indexOf(k) >= 0); });
      var tot = 0, found = [], missing = [];
      keys.forEach(function (k) {
        var v = fv(scan, k); tot += v;
        (v >= 1 ? found : missing).push(k);
      });
      var score = keys.length ? r1(tot / keys.length * 10) : 0;
      var w = goal.w[d.id] || 1;
      dims.push({ id: d.id, label: d.label, score: score, weight: w, found: found, missing: missing, steps: d.steps, gap: w * (10 - score) });
      sumW += w; sum += w * score;
    });

    var mt = 0, mustMissing = [];
    goal.must.forEach(function (k) { var v = fv(scan, k); mt += v; if (v < 1) mustMissing.push(k); });
    var must = goal.must.length ? mt / goal.must.length * 10 : 0;
    var overall = r1(Math.max(0, Math.min(10, 0.65 * (sum / sumW) + 0.35 * must)));

    /* One rule for everything shown: gap = goal weight x distance from 10. The three biggest gaps are the gold rows. */
    var order = dims.slice().sort(function (a, b) { return b.gap - a.gap; });
    var top = order.filter(function (d) { return d.score < 9.5; }).slice(0, 3);
    var steps = [];
    top.forEach(function (d) {
      d.step = 0;
      for (var i = 0; i < d.steps.length; i++) if (!done[d.steps[i]]) { d.step = d.steps[i]; break; }
      d.missLabels = d.missing.map(featLabel);
      if (d.step) steps.push({ n: d.step, dim: d.id });
    });

    var conf = { level: 'ok', why: 'Based on what the scan found in your code.' };
    var eng = PQ.engineById ? PQ.engineById(scan.engineId) : null;
    if (scan.isSample) conf = { level: 'sample', why: 'This is the made-up example game.' };
    else if (scan.engineSure === false || scan.engineId === 'unknown') conf = { level: 'low', why: 'The engine is not sure, so the scan may miss things.' };
    else if (eng && eng.ed) conf = { level: 'low', why: 'Most work in this engine happens in its editor, so the scan sees less.' };
    else if (scan.stats && typeof scan.stats.read === 'number' && scan.stats.read < 3) conf = { level: 'low', why: 'Very few code files were readable.' };

    return {
      goal: goal, overall: overall, tier: PQ.tier(overall), dims: dims, order: order, top: top, steps: steps,
      mustMissing: mustMissing, mustMissingLabels: mustMissing.map(featLabel), conf: conf, combat: combat
    };
  };

  /* One plain line for Pip, built from the numbers. No AI, always available. */
  PQ.rateLine = function (r) {
    var w = r.order[0];
    var s = r.goal.focus;
    if (w && w.score < 9.5) s += ' Your weakest area for this goal: ' + w.label.toLowerCase() + '.';
    else s += ' No big gaps found.';
    return s;
  };
})(typeof window !== 'undefined' ? window : globalThis);
