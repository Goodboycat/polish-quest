// Screenshots specific routes after loading the sample game. Usage: node tools/duo/routes.cjs OUTDIR [BASEURL]  (default: serves site/ on :3003 with mock /api)
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site'), out = path.resolve(__dirname, 'shots', process.argv[2] || 'routes');
const BASE = process.argv[3] || '';
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.ogg': 'audio/ogg' };
const srv = http.createServer((q, r) => {
  const u = decodeURI(q.url.split('?')[0]);
  if (u.startsWith('/api/')) { r.setHeader('content-type', 'application/json'); return r.end(JSON.stringify(u === '/api/assets' ? { items: [{ name: 'Mock tree', url: 'https://polyhaven.com/a/x', license: 'CC0' }], source: 'Poly Haven' } : { reply: 'MOCK reply.' })); }
  let f = path.join(SITE, u === '/' ? 'index.html' : u); if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f));
});
const ROUTES = (process.env.ROUTES || 'home,kind,assets,overview,rating,plan').split(',');
const SIZES = (process.env.SIZES || 'desktop,phone').split(',');
const VP = { desktop: { width: 1280, height: 720 }, phone: { width: 390, height: 844 }, small: { width: 360, height: 640 } };
(async () => {
  let base = BASE; if (!base) { await new Promise(r => srv.listen(3003, '127.0.0.1', r)); base = 'http://127.0.0.1:3003'; }
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const name of SIZES) {
    const ctx = await b.newContext({ viewport: VP[name], hasTouch: name !== 'desktop' }); const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    await p.addInitScript(() => { try { localStorage.setItem('pq_tour', JSON.stringify({ home: 1, scan: 1, kind: 1, goal: 1, ads: 1, step: 1 })); } catch (e) {} });
    await p.goto(base + '/', { waitUntil: 'load' }); await p.waitForTimeout(1200);
    if (ROUTES.includes('home')) await p.screenshot({ path: `${out}/${name}-home.png` });
    await p.locator('[data-t=sample]').first().click(); await p.waitForTimeout(600);
    await p.evaluate(() => { location.hash = '#goal'; }); await p.waitForTimeout(600);
    await p.locator('[data-t=goal-free]').click(); await p.waitForTimeout(200); await p.locator('[data-t=next]').click(); await p.waitForTimeout(600);
    for (const r of ROUTES) { if (r === 'home') continue; await p.evaluate(h => { location.hash = h; }, '#' + r); await p.waitForTimeout(+process.env.WAIT || 1300); await p.screenshot({ path: `${out}/${name}-${r}.png` }); }
    console.log(name, 'errors', errs.length, errs.slice(0, 3).join(' | ')); await ctx.close();
  }
  await b.close(); srv.close();
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
