// Screenshot the side-by-side sheet, then cut each hand into a transparent PNG.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 340 }, deviceScaleFactor: 2 });
  await p.goto('file://' + __dirname + '/hand-sheet.html');
  await p.locator('#row').screenshot({ path: __dirname + '/hand-sheet.png' });
  for (const k of ['glove', 'skin', 'dark']) {
    await p.evaluate(id => { document.getElementById('row').style.background = 'transparent'; document.querySelectorAll('canvas').forEach(c => c.style.visibility = c.id === id ? 'visible' : 'hidden'); }, k);
    await p.locator('#' + k).screenshot({ path: __dirname + '/hand-' + k + '.png', omitBackground: true });
  }
  await b.close();
})();
