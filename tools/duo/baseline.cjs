// One-off: screenshots of the OLD site (before the rebuild). Run: node tools/duo/baseline.cjs
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const out = '/home/user/webapp/tools/duo/shots/before/';
  for (const [name, vp] of [['desktop', { width: 1280, height: 720 }], ['phone', { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp });
    await p.goto('http://127.0.0.1:3001/#home'); await p.waitForTimeout(700);
    await p.screenshot({ path: out + name + '-1-home.png' });
    const sample = p.locator('button:has-text("sample"), a:has-text("sample"), button:has-text("example")').first();
    if (await sample.count()) { await sample.click(); await p.waitForTimeout(700); await p.screenshot({ path: out + name + '-2-after-sample.png' }); }
    for (const h of ['#scan', '#quest', '#quest/p1', '#trust']) { await p.goto('http://127.0.0.1:3001/' + h); await p.waitForTimeout(500); await p.screenshot({ path: out + name + '-' + h.replace(/[#\/]/g, '_') + '.png' }); }
    await p.close();
  }
  await b.close(); console.log('ok');
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
