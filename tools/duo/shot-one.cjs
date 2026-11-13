// Screenshot one route after loading the sample game. Usage: node tools/duo/shot-one.cjs '#overview' out-prefix
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3005, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, vp] of [['desktop', { width: 1280, height: 720 }], ['phone', { width: 390, height: 844 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('http://127.0.0.1:3005/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
    await p.locator('[data-t=sample]').click(); await p.waitForTimeout(500);
    if (process.argv[2] !== '#goal') { await p.evaluate(() => { location.hash = '#goal'; }); await p.waitForTimeout(700); await p.locator('[data-t=goal-free]').click(); await p.waitForTimeout(300); await p.locator('[data-t=next]').click(); await p.waitForTimeout(800); }
    await p.evaluate(h => { location.hash = h; }, process.argv[2]); await p.waitForTimeout(+process.env.WAIT || 1200);
    await p.screenshot({ path: `/tmp/${process.argv[3]}-${name}.png` });
    console.log(name, 'errors:', errs.length, errs.slice(0, 2).join(' | '));
  }
  await b.close(); srv.close();
})();
