// Clean UI check for the site itself: on every screen, no two visible buttons/links share a label, and no placeholder words. Usage: node tools/duo/dupes.cjs
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); if (u.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); return r.end('{"items":[],"reply":"x"}'); } const f = path.join(SITE, u === '/' ? 'index.html' : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'x'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3009, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const bad = []; let screens = 0;
  for (const vp of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    const p = await (await b.newContext({ viewport: vp })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); await p.addInitScript(() => localStorage.setItem('pq_tour', JSON.stringify({ home: 1, scan: 1, kind: 1, goal: 1, ads: 1, step: 1 })));
    await p.goto('http://127.0.0.1:3009/'); await p.waitForTimeout(700); await p.locator('[data-t=sample]').first().click(); await p.waitForTimeout(500);
    for (const h of ['#home', '#scan', '#kind', '#assets', '#goal', '#rating', '#step/0', '#step/1', '#step/26', '#step/27', '#overview', '#fix', '#plan', '#sample', '#privacy', '#done', '#enough']) {
      await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(450); screens++;
      const r = await p.evaluate(() => {
        const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        const els = [...document.querySelectorAll('#screen button, #screen a, .actions button, .actions a, header.bar a')].filter(vis);
        const seen = {}, dup = [];
        els.forEach(e => { const t = (e.textContent || e.getAttribute('aria-label') || '').trim().toLowerCase(); if (!t) return; if (seen[t]) dup.push(t); seen[t] = 1; });
        const txt = (document.getElementById('screen').innerText || '');
        const junk = (txt.match(/lorem|todo|click here|placeholder|undefined|\[object|NaN/gi) || []);
        return { dup, junk };
      });
      if (r.dup.length || r.junk.length) bad.push(`${vp.width} ${h}: dup=${JSON.stringify(r.dup)} junk=${JSON.stringify(r.junk)}`);
    }
    if (errs.length) bad.push('errors: ' + errs.slice(0, 3).join(' | '));
  }
  console.log(screens + ' screen checks'); console.log(bad.length ? bad.join('\n') : 'no duplicate labels, no placeholder text, 0 errors');
  await b.close(); srv.close();
})();
