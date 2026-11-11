// Screenshot + health report for the planner. Usage: node tools/duo/shoot.cjs <outDirName>
// Serves site/ on :3002 with a MOCK /api/coach, drives the flow through data-t hooks, writes JPEGs + report.json
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = '/home/user/webapp', SITE = ROOT + '/site', PORT = 3002;
const out = path.join(ROOT, 'tools/duo/shots', process.argv[2] || 'latest');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
const missing = [];
const srv = http.createServer((req, res) => {
  const u = decodeURI(req.url.split('?')[0]);
  if (req.method === 'POST' && u === '/api/coach') { let b = ''; req.on('data', d => b += d); req.on('end', () => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ reply: 'MOCK: Paste the prompt, wait for the AI to finish, then check it.' })); }); return; }
  let f = path.join(SITE, u === '/' ? 'index.html' : u); if (!f.startsWith(SITE)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { missing.push(u); res.statusCode = 404; return res.end('nf'); }
  res.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); res.end(fs.readFileSync(f));
});
const VPS = [['desktop', { width: 1280, height: 720 }], ['phone', { width: 390, height: 844 }]];
(async () => {
  await new Promise(r => srv.listen(PORT, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const report = { shots: [], errors: [], failed: [], metrics: {}, flow: [] };
  for (const [name, vp] of VPS) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: name === 'phone' });
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') report.errors.push(`[${name}] console.${m.type()}: ${m.text().slice(0, 220)}`); });
    p.on('pageerror', e => report.errors.push(`[${name}] pageerror: ${String(e.message).slice(0, 220)}`));
    p.on('requestfailed', r => report.failed.push(`[${name}] ${r.url().slice(0, 120)}`));
    let n = 0;
    const shot = async (label) => { n++; const f = `${name}-${String(n).padStart(2, '0')}-${label}.jpg`; await p.screenshot({ path: path.join(out, f), type: 'jpeg', quality: 72 }); report.shots.push(f); };
    const has = async (sel) => (await p.locator(sel).count()) > 0 && await p.locator(sel).first().isVisible().catch(() => false);
    const click = async (sel, why) => { if (await has(sel)) { await p.locator(sel).first().click({ timeout: 3000 }).catch(e => report.flow.push(`[${name}] click ${sel} failed: ${e.message.slice(0, 80)}`)); await p.waitForTimeout(900); return true; } report.flow.push(`[${name}] MISSING hook ${sel} (${why})`); return false; };
    try {
      await p.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'load' }); await p.waitForTimeout(1600);
      await shot('home');
      if (await click('[data-t=sample]', 'try-sample button on the first screen')) {
        await shot('after-sample');
        for (let i = 0; i < 4; i++) { if (!(await click('[data-t=next]', 'next button on screen ' + (i + 1)))) break; await shot('next-' + (i + 1)); }
      }
      for (const h of ['#overview', '#fix', '#privacy']) { await p.goto(`http://127.0.0.1:${PORT}/${h}`); await p.waitForTimeout(900); await shot(h.slice(1)); }
      if (await has('[data-t=mascot]')) { await p.goto(`http://127.0.0.1:${PORT}/#step/1`); await p.waitForTimeout(900); await click('[data-t=coach-open]', 'open coach box'); await shot('coach-open'); }
      report.metrics[name] = await p.evaluate(() => {
        const small = []; document.querySelectorAll('body *').forEach(e => { if (e.children.length) return; const t = (e.textContent || '').trim(); if (!t) return; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 14) small.push(t.slice(0, 24) + ' ' + fs + 'px'); });
        const colors = new Set(); document.querySelectorAll('body *').forEach(e => { const cs = getComputedStyle(e); [cs.color, cs.backgroundColor].forEach(c => { if (c && !/rgba?\(0, 0, 0, 0\)/.test(c)) colors.add(c); }); });
        const canvas = document.querySelector('canvas');
        return { overflowX: document.documentElement.scrollWidth > innerWidth + 1, smallText: small.slice(0, 8), smallTextCount: small.length, distinctColors: colors.size, hasCanvas: !!canvas, canvasSize: canvas ? canvas.width + 'x' + canvas.height : null, visibleTextChars: (document.body.innerText || '').length, hasThree: typeof window.PQ3D !== 'undefined', hasGuide: !!(window.PQ && window.PQ.guide), hasMascot: !!document.querySelector('[data-t=mascot]') };
      });
    } catch (e) { report.errors.push(`[${name}] flow crashed: ${e.message.slice(0, 200)}`); }
    await ctx.close();
  }
  report.missing = missing.slice(0, 10);
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ shots: report.shots.length, errors: report.errors.length, flowIssues: report.flow.length, metrics: report.metrics }, null, 0));
  await b.close(); srv.close();
})().catch(e => { console.log('SHOOT ERR', e.message); process.exit(1); });
