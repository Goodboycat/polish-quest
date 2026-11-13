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

/* Master-text guard. Distinctive lines from the 26 master prompts must not sit in site/ once the owner chose to hide them.
   Decision lives in tools/hide-decision.json. The guard scans every site file except the prompts-*.js files that are the source. */
const decision = JSON.parse(fs.readFileSync(path.join(__dirname, 'hide-decision.json'), 'utf8'));
const probe = PQ.makeCtx({ name: 'Moon Cat', engineId: 'unity', genreId: PQ.GENRES[0].id, deviceId: PQ.DEVICES[0].id, features: {}, protect: [] });
const phrases = [];
PQ.PROMPTS.forEach(p => {
  ['look', 'build', 'dont', 'test'].forEach(k => {
    let v = typeof p[k] === 'function' ? p[k](probe) : p[k];
    (v || []).forEach(x => { if (typeof x === 'function') x = x(probe); if (x && typeof x === 'object') x = typeof x.t === 'function' ? x.t(probe) : x.t; if (typeof x === 'string' && x.length >= 60) phrases.push(x.slice(0, 60)); });
  });
});
function walk(d) { return fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]); }
const siteDir = path.join(__dirname, '../site');
const files = walk(siteDir).filter(f => /\.(js|html|css|json|txt|md)$/.test(f));
let exposed = 0; const where = new Set();
files.forEach(f => { const t = fs.readFileSync(f, 'utf8'); phrases.forEach(ph => { if (t.indexOf(ph) >= 0) { exposed++; where.add(path.relative(siteDir, f)); } }); });
console.log('master phrases checked:', phrases.length, '| found in site/:', exposed, where.size ? '(' + Array.from(where).join(', ') + ')' : '');
let fail = bad ? 1 : 0;
if (exposed && decision.hidePrompts) { console.log('FAIL: owner chose to hide the prompts but master text is still in site/'); fail = 1; }
else if (exposed) console.log('NOTE: master text is public in site/ (tools/hide-decision.json hidePrompts=false, owner undecided or chose keep).');
process.exit(fail);
