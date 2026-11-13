// Scan phaser.zip, mark one finding as there, tick nothing, re-drop the same zip: correction and compare line must show.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3006, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:3006/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(900);
  await p.locator('input[type=file]').first().setInputFiles('/tmp/dt/phaser.zip'); await p.waitForURL(/#scan/); await p.waitForTimeout(400);
  await p.locator('[data-t=next]').click(); await p.waitForURL(/#goal/); await p.locator('[data-t=goal-free]').click(); await p.locator('[data-t=next]').click(); await p.waitForURL(/#rating/); await p.waitForTimeout(1200);
  await p.locator('button.bar-row').first().click(); await p.locator('.ev-btn', { hasText: 'It is there' }).first().click({ force: true }); await p.waitForTimeout(1200);
  const s1 = await p.locator('.ring-c b').textContent();
  await p.goto('http://127.0.0.1:3006/#home', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(900);
  await p.locator('input[type=file]').first().setInputFiles('/tmp/dt/phaser.zip'); await p.waitForURL(/#scan/); await p.waitForTimeout(400);
  await p.evaluate(() => { location.hash = '#rating'; }); await p.waitForTimeout(1400);
  
  const s2 = await p.locator('.ring-c b').textContent();
  const cmp = await p.locator('.rate-cmp').textContent().catch(() => 'NONE');
  console.log(JSON.stringify({ s1, s2, cmp, errs }));
  await b.close(); srv.close();
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
