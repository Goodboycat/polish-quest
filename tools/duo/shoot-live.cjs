// Live-site screenshots for the planner review. Usage: node tools/duo/shoot-live.cjs OUTDIR [URL]
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const out = process.argv[2] || 'live14', URL = process.argv[3] || 'https://polish-quest-sigma.vercel.app/';
const D = __dirname + '/shots/' + out + '/';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const jobs = [['desktop', { width: 1280, height: 720 }, ['home', 'kind', 'rating', 'plan', 'assets']], ['phone', { width: 390, height: 844 }, ['home', 'rating', 'plan-menu']]];
  for (const [n, vp, routes] of jobs) {
    const p = await (await b.newContext({ viewport: vp })).newPage();
    await p.goto(URL, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
    if (routes[0] === 'home') await p.screenshot({ path: D + n + '-home.jpg', type: 'jpeg', quality: 80 });
    await p.locator('[data-t=sample]').click(); await p.waitForTimeout(600);
    await p.evaluate(() => { location.hash = '#goal'; }); await p.waitForTimeout(700);
    await p.locator('[data-t=goal-free]').click(); await p.waitForTimeout(300); await p.locator('[data-t=next]').click(); await p.waitForTimeout(1500);
    for (const r of routes) {
      if (r === 'home') continue;
      if (r === 'plan-menu') { await p.evaluate(() => { location.hash = '#plan'; }); await p.waitForTimeout(1500); await p.click('#menu-btn'); await p.waitForTimeout(400); }
      else { await p.evaluate(h => { location.hash = h; }, '#' + (r === 'kind' ? 'kind' : r)); await p.waitForTimeout(3000); }
      await p.screenshot({ path: D + n + '-' + r + '.jpg', type: 'jpeg', quality: 80 });
    }
  }
  await b.close();
})();
