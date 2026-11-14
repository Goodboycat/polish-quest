// Records the hand pointer over time on home. Usage: node tools/duo/hand.cjs [phone]
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site'), out = path.resolve(__dirname, 'shots/hand'); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
(async () => {
  await new Promise(r => srv.listen(3006, '127.0.0.1', r));
  const phone = process.argv[2] === 'phone';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext({ viewport: phone ? { width: 390, height: 844 } : { width: 1280, height: 720 }, hasTouch: phone })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:3006/', { waitUntil: 'load' });
  const t0 = Date.now(); let n = 0;
  const log = [];
  for (const ms of [700, 1100, 1500, 2100, 3000, 3700, 4300, 5200, 6200]) {
    await p.waitForTimeout(Math.max(0, ms - (Date.now() - t0)));
    const st = await p.evaluate(() => { const h = document.querySelector('.pq-hand'); const sp = [...document.querySelectorAll('.pq-spark')].filter(s => +s.style.opacity > 0.05).length; const b = document.querySelector('.pq-press'); const l = document.querySelector('.pq-label'); return h ? { on: h.classList.contains('on'), tf: h.style.transform.slice(0, 80), sparks: sp, pressed: !!b, label: l && l.textContent } : null; });
    log.push(ms + 'ms ' + JSON.stringify(st));
    await p.screenshot({ path: `${out}/f${String(++n).padStart(2, '0')}-${ms}.png`, clip: phone ? undefined : { x: 480, y: 160, width: 700, height: 400 } });
  }
  console.log(log.join('\n')); console.log('errors', errs.length, errs.slice(0, 3));
  await b.close(); srv.close();
})();
