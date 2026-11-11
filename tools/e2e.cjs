// node tools/e2e.cjs [baseUrl]  -> loads the site in Chromium, drops a zip, walks every screen, saves screenshots to tools/out/shots
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const path = require('path'), fs = require('fs');
const base = process.argv[2] || 'http://localhost:3000/';
const out = path.join(__dirname, 'out/shots'); fs.mkdirSync(out, { recursive: true });
const ZIP = process.env.ZIP || '/tmp/dt/phaser.zip';
(async () => {
  const b = await chromium.launch();
  const errs = [], reqs = [], viol = [];
  async function newCtx(w, h, extra) {
    const ctx = await b.newContext(Object.assign({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: w < 900, isMobile: w < 900 }, extra || {}));
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/example\.com\/pq-test/.test(m.text()) && !/Content Security Policy/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
    pg.on('request', r => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) reqs.push(r.url()); });
    return { ctx, pg };
  }
  const sizes = [['land', 844, 390], ['port', 390, 844], ['desk', 1280, 800], ['tiny', 667, 375]];
  for (const [nm, w, h] of sizes) {
    const { ctx, pg } = await newCtx(w, h);
    await pg.goto(base); await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(out, nm + '-1-home.png') });
    await pg.setInputFiles('#zip-input', ZIP);
    await pg.waitForFunction(() => location.hash === '#scan', null, { timeout: 8000 });
    await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(out, nm + '-2-scan.png') });
    await pg.screenshot({ path: path.join(out, nm + '-2-scan-full.png'), fullPage: false });
    await pg.click('text=Looks right'); await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(out, nm + '-3-quest.png') });
    await pg.click('.qcard[data-key="p10"]'); await pg.waitForTimeout(500);
    await pg.screenshot({ path: path.join(out, nm + '-4-sheet.png') });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    await pg.click('.fixcard[data-key="f-bug"]'); await pg.waitForTimeout(400);
    await pg.screenshot({ path: path.join(out, nm + '-5-fix.png') });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    await pg.goto(base + '#trust'); await pg.waitForTimeout(3200);
    await pg.screenshot({ path: path.join(out, nm + '-6-trust.png') });
    await pg.goto(base + '#review'); await pg.waitForTimeout(400);
    await pg.screenshot({ path: path.join(out, nm + '-7-review.png') });
    await ctx.close();
  }
  console.log('errors:', errs.length ? errs : 'none');
  console.log('outside requests:', reqs.length ? reqs : 'none');
  await b.close();
})().catch(e => { console.error('FAIL', e); process.exit(1); });
