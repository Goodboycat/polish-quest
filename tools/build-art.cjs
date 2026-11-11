// Usage: node tools/build-art.js   (run from /home/user/webapp)
// 1) opens art-sheet.html (visible version) -> screenshot tools/out/art-sheet-visible.png  (side by side art + icons)
// 2) opens it again transparent -> screenshot -> reads each canvas bounding box -> tools/out/manifest.json
// 3) python3 tools/slice.py cuts the screenshot into PNGs
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..'); const out = path.join(root, 'tools/out'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 2100, height: 1500 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const url = 'file://' + path.join(root, 'tools/art-sheet.html');
  await pg.goto(url + '#vis'); await pg.waitForFunction('window.__ready===true', null, { timeout: 15000 });
  await pg.screenshot({ path: path.join(out, 'art-sheet-visible.png'), fullPage: true });
  await pg.goto(url); await pg.reload(); await pg.waitForFunction('window.__ready===true');
  const man = await pg.evaluate(() => [...document.querySelectorAll('canvas')].map(c => { const r = c.getBoundingClientRect(); return { name: c.dataset.name, x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }));
  await pg.screenshot({ path: path.join(out, 'art-sheet-transparent.png'), fullPage: true, omitBackground: true });
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(man, null, 1));
  console.log('items', man.length, 'errors', errs.length ? errs : 'none');
  await b.close();
})();
