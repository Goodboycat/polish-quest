// Drops phaser.zip, reaches #rating, opens an area, marks one finding wrong, checks the score moves, copies the report.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site'), OUT = path.resolve(__dirname, 'shots/evidence');
fs.mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3004, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const cx = await b.newContext({ viewport: { width: 1280, height: 720 }, permissions: ['clipboard-read', 'clipboard-write'] }); const p = await cx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); });
  await p.goto('http://127.0.0.1:3004/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1000);
  await p.locator('input[type=file]').first().setInputFiles('/tmp/dt/phaser.zip');
  await p.waitForURL(/#scan/, { timeout: 8000 }); await p.waitForTimeout(500);
  await p.locator('[data-t=next]').click(); await p.waitForURL(/#goal/); await p.waitForTimeout(400);
  await p.locator('[data-t=goal-free]').click(); await p.locator('[data-t=next]').click(); await p.waitForURL(/#rating/); await p.waitForTimeout(1500);
  const score = () => p.locator('.ring-c b').textContent();
  const s0 = await score();
  await p.locator('button.bar-row').first().click(); await p.waitForTimeout(300);
  await p.screenshot({ path: OUT + '/open.png' });
  const rows = await p.locator('.ev-row').count();
  const btnTxt = await p.locator('.ev-btn').first().textContent();
  // click the first "It is there" button to raise score
  const there = p.locator('.ev-btn', { hasText: 'It is there' }).first();
  const hadThere = await there.count();
  if (hadThere) await there.click({ force: true });
  await p.waitForTimeout(1600);
  const s1 = await score();
  const exp = await (async()=>{ if (await p.locator('[data-t=more]').count()) await p.locator('[data-t=more]').click(); return p.locator('[data-t=export]').count(); })();
  await p.locator('[data-t=export]').click(); await p.waitForTimeout(400);
  const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(e => 'ERR ' + e.message);
  // reload: correction should persist
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(1500);
  const hash = await p.evaluate(() => location.hash);
  const s2 = await score().catch(() => 'n/a');
  console.log(JSON.stringify({ s0, s1, s2, rows, btnTxt, hadThere, exp, hash, clipHead: clip.split('\n').slice(0, 4), clipLen: clip.length, errs }, null, 1));
  await b.close(); srv.close();
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });
