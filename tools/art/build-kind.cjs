// 1) draw 8 subjects x 3 variants side by side  2) screenshot the sheet  3) cut each picked cell out as a transparent PNG.
// Usage: node tools/art/build-kind.cjs [variant letter, default b]
const { chromium } = require('/home/user/tools-env/node_modules/playwright'); const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '../..'), pick = process.argv[2] || 'b';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 700, height: 1500 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/kind-sheet.html'); await p.waitForFunction('window.ARTDONE');
  await p.locator('#sheet').screenshot({ path: path.join(ROOT, 'docs/kind-icons-sheet.png') });
  await p.evaluate(() => { document.documentElement.classList.add('cut'); document.body.classList.add('cut'); });
  const out = path.join(ROOT, 'site/assets/art'); fs.mkdirSync(out, { recursive: true });
  for (const id of ['k-pc', 'k-mobile', 'k-3d', 'k-2d', 'k-ui', 'k-lowpoly', 'k-stylized', 'k-pixel']) { await p.locator('#' + id + '-' + pick).screenshot({ path: path.join(out, id + '.png'), omitBackground: true }); console.log('cut', id, pick); }
  await b.close();
})();
