// Drops /tmp/dt/ads.zip (made by hand: interstitial + banner-free adsense), picks "free", checks #ads and #enough, screenshots desktop + phone.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site'), OUT = path.resolve(__dirname, 'shots/ads');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3004, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const res = [];
  for (const [vn, vp] of [['desktop', { width: 1280, height: 720 }], ['phone', { width: 390, height: 844 }]]) {
    const cx = await b.newContext({ viewport: vp }); const p = await cx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
    await p.goto('http://127.0.0.1:3004/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200);
    await p.locator('input[type=file]').first().setInputFiles('/tmp/dt/ads.zip');
    await p.waitForURL(/#scan/, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(500);
    await p.locator('[data-t=next]').click(); await p.waitForURL(/#goal/).catch(() => {}); await p.waitForTimeout(400);
    await p.locator('[data-t=goal-free]').click(); await p.locator('[data-t=next]').click(); await p.waitForURL(/#rating/).catch(() => {}); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${vn}-rating.jpg`, type: 'jpeg', quality: 70 });
    await p.locator('[data-t=next]').click(); await p.waitForURL(/#ads/, { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
    const ads = await p.evaluate(() => ({ hash: location.hash, h1: (document.querySelector('h1') || {}).textContent, lines: [...document.querySelectorAll('.ads-card p')].map(x => x.textContent), copy: !!document.querySelector('[data-t=copy]'), hand: !!document.querySelector('.pq-hand'), ow: document.documentElement.scrollWidth > innerWidth }));
    await p.screenshot({ path: `${OUT}/${vn}-ads.jpg`, type: 'jpeg', quality: 70 });
    await p.goto('http://127.0.0.1:3004/#enough'); await p.waitForTimeout(900);
    const en = await p.evaluate(() => ({ h1: (document.querySelector('h1') || {}).textContent, offer: !!document.querySelector('[data-t=offer]'), href: [...document.querySelectorAll('.offer a')].map(a => a.href) }));
    await p.screenshot({ path: `${OUT}/${vn}-enough.jpg`, type: 'jpeg', quality: 70 });
    res.push({ vn, ads, en, errs }); await cx.close();
  }
  console.log(JSON.stringify(res, null, 1)); await b.close(); srv.close();
})();
