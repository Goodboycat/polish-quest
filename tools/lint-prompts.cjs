// node tools/lint-prompts.cjs  -> renders every prompt for many engine/genre/feature combos and fails on leaks.
global.window = undefined;
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../site/js');
['data', 'core'].forEach(f => require(path.join(dir, f + '.js')));
fs.readdirSync(dir).filter(f => /^prompts-/.test(f)).sort().forEach(f => require(path.join(dir, f)));
let bad = 0, n = 0;
const featStates = ['none', 'maybe', 'found'];
PQ.ENGINES.forEach((e, ei) => PQ.GENRES.forEach((gn, gi) => {
  const feats = {}; PQ.FEATURES.forEach((ft, k) => feats[ft.key] = featStates[(ei + gi + k) % 3]);
  [[], ['node_modules/', 'Library/']].forEach(protect => {
    const ctx = PQ.makeCtx({ name: 'Moon Cat', engineId: e.id, genreId: gn.id, deviceId: PQ.DEVICES[(ei + gi) % PQ.DEVICES.length].id, features: feats, protect });
    const all = [PQ.renderPrompt0(ctx)].concat(PQ.PROMPTS.map(p => PQ.renderPrompt(p, ctx)));
    (PQ.FIXKIT || []).forEach(f => all.push(PQ.renderFix(f, ctx, {})));
    all.forEach((t, i) => { n++; const b = PQ.lint(t); if (b.length) { bad++; if (bad < 8) console.log('LEAK', e.id, gn.id, i, b, (t.match(/.{0,40}(undefined|NaN|\[object|null|\{\{).{0,40}/) || [''])[0]); } });
  });
}));
console.log('prompts:', PQ.PROMPTS.length, 'fixkit:', (PQ.FIXKIT || []).length, 'renders:', n, 'leaks:', bad);
process.exit(bad ? 1 : 0);
