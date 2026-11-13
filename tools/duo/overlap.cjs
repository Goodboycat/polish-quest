// Pip overlap test: for every screen at 4 sizes, does Pip (or its speech bubble) cover any visible text, button or picture?
// Usage: node tools/duo/overlap.cjs   -> prints each hit, exit code 1 if any.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '../../site');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const u = decodeURI(q.url.split('?')[0]); const f = path.join(SITE, u === '/' ? 'index.html' : u); if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', MIME[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f)); });
const ROUTES = ['#home', '#scan', '#goal', '#rating', '#ads', '#enough', '#step/0', '#step/1', '#overview', '#fix', '#privacy', '#done', '#sample', '#store'];
const SIZES = [['desktop', 1280, 720], ['laptop', 1366, 640], ['phone', 390, 844], ['small-phone', 360, 640], ['narrow-desktop', 1024, 700]];
(async () => {
  await new Promise(r => srv.listen(3007, '127.0.0.1', r));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  let hits = 0;
  for (const [name, w, h] of SIZES) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    await p.goto('http://127.0.0.1:3007/', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700);
    await p.locator('[data-t=sample]').click(); await p.waitForTimeout(500);
    await p.evaluate(() => { location.hash = '#goal'; }); await p.waitForTimeout(500);
    await p.locator('[data-t=goal-free]').click(); await p.locator('[data-t=next]').click(); await p.waitForTimeout(500);
    for (const hsh of ROUTES) {
      await p.evaluate(x => { location.hash = x; }, hsh); await p.waitForTimeout(1900);   // let Pip speak
      const res = await p.evaluate(() => {
        const pr = document.querySelector('.pp-root'); if (!pr) return { err: 'no pip' };
        const boxes = [];
        const pip = document.querySelector('.pp-pip'), bub = document.querySelector('.pp-bubble');
        const add = (el, tag) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); if (r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05) boxes.push({ tag, l: r.left, t: r.top, r: r.right, b: r.bottom }); };
        if (pip && getComputedStyle(pip.querySelector('.pp-art') || pip).display !== 'none') add(pip, 'pip');
        if (bub && +getComputedStyle(bub).opacity > 0.05 && getComputedStyle(bub).display !== 'none') add(bub, 'bubble');
        const out = [];
        const scr = document.getElementById('screen'); if (!scr) return { err: 'no screen' };
        const nodes = scr.querySelectorAll('h1,h2,p,li,a,button,img,span,b,label,input,.ring');
        nodes.forEach(n => {
          if (n.closest('.pp-root') || n.closest('.hidden')) return;
          const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return;
          // only leaf-ish things: text-bearing or media or interactive
          const own = Array.from(n.childNodes).some(c => c.nodeType === 3 && c.textContent.trim());
          if (!own && !['IMG', 'BUTTON', 'INPUT', 'A'].includes(n.tagName)) return;
          const r = n.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return;
          if (r.bottom < 0 || r.top > innerHeight) return;
          boxes.forEach(bx => { if (bx.tag === 'pip' || bx.tag === 'bubble') { const ix = Math.min(r.right, bx.r) - Math.max(r.left, bx.l), iy = Math.min(r.bottom, bx.b) - Math.max(r.top, bx.t); if (ix > 3 && iy > 3) out.push(bx.tag + ' covers <' + n.tagName.toLowerCase() + '> "' + (n.textContent || n.alt || '').trim().slice(0, 36) + '"'); } });
        });
        return { out };
      });
      if (res.err) { console.log(`[${name}] ${hsh} ${res.err}`); continue; }
      const uniq = [...new Set(res.out)];
      uniq.forEach(u => { hits++; console.log(`[${name}] ${hsh}: ${u}`); });
    }
  }
  console.log(hits ? `OVERLAPS: ${hits}` : 'OVERLAPS: 0'); await b.close(); srv.close(); process.exit(hits ? 1 : 0);
})();
