// Drops each test zip through the real file input, picks a goal, checks the rating screen, then previews the offer block with ?offer=1.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site'), OUT = path.resolve(__dirname, 'shots/zips');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3003, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const res = [], goals = { unity: 'aaa', godot: 'paid', phaser: 'free', mystery: 'jam' };
  for (const z of ['unity', 'godot', 'phaser', 'mystery']) {
    const cx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await cx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
    await p.goto('http://127.0.0.1:3003/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1200);
    await p.locator('input[type=file]').first().setInputFiles('/tmp/dt/' + z + '.zip');
    await p.waitForURL(/#scan/, { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(700);
    await p.locator('[data-t=next]').click(); await p.waitForURL(/#goal/, { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(600);
    await p.locator('[data-t=goal-' + goals[z] + ']').click(); await p.locator('[data-t=next]').click(); await p.waitForURL(/#rating/, { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(1500);
    const info = await p.evaluate(() => ({ hash: location.hash, title: (document.querySelector('h1') || {}).textContent, score: (document.querySelector('.ring-c b') || {}).textContent, bars: document.querySelectorAll('.bar-row').length, tags: [...document.querySelectorAll('.focus .tag')].map(t => t.textContent) }));
    res.push({ zip: z, goal: goals[z], ...info, errs });
    await p.screenshot({ path: `${OUT}/${z}.jpg`, type: 'jpeg', quality: 70 }); await cx.close();
  }
  const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await p.goto('http://127.0.0.1:3003/?offer=1', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(900);
  await p.locator('[data-t=sample]').click(); await p.waitForTimeout(500);
  const pages = {};
  for (const h of ['#overview', '#done', '#fix', '#rating']) { await p.goto('http://127.0.0.1:3003/?offer=1' + h, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(900);
    pages[h] = { offer: await p.locator('[data-t=offer]').count(), fits: await p.evaluate(() => { const s = document.getElementById('screen'); return s.scrollHeight <= s.clientHeight + 1; }) };
    await p.screenshot({ path: `${OUT}/offer${h.slice(1)}.jpg`, type: 'jpeg', quality: 70 }); }
  const p2 = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await p2.goto('http://127.0.0.1:3003/#home', { waitUntil: 'domcontentloaded' }); await p2.waitForTimeout(500);
  console.log(JSON.stringify({ res, pages, offerShownWithoutFlag: await p2.evaluate(() => !!document.querySelector('[data-t=offer]')) }, null, 1));
  await b.close(); srv.close();
})();
