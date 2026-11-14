// Checks that each screen fits in one viewport (no inner scroll) on desktop and phone, using the sample game. Usage: node tools/duo/fit.cjs
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3004, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const out = [];
  for (const [name, vp] of [['desktop', { width: 1280, height: 720 }], ['laptop', { width: 1366, height: 640 }], ['phone', { width: 390, height: 844 }], ['small-phone', { width: 360, height: 640 }]]) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    await p.goto('http://127.0.0.1:3004/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);
    await p.locator('[data-t=sample]').click(); await p.waitForTimeout(500);
    for (const h of ['#scan', '#kind', '#assets', '#goal', '#rating', '#step/0', '#step/1', '#overview', '#fix', '#privacy', '#done']) {
      await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(650);
      const m = await p.evaluate(() => { const s = document.getElementById('screen'); return { over: s.scrollHeight - s.clientHeight, ox: document.documentElement.scrollWidth - innerWidth }; });
      out.push(`${name} ${h}: ${m.over <= 1 ? 'fits' : 'SCROLLS by ' + m.over + 'px'}${m.ox > 1 ? ' OVERFLOW-X ' + m.ox : ''}`);
    }
    await p.close();
  }
  console.log(out.join('\n')); await b.close(); srv.close();
})();
