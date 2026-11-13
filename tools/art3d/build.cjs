// 1) bundle  2) draw 6 subjects x 3 variants side by side  3) screenshot the sheet  4) cut every canvas out as a transparent PNG
// Usage: node tools/art3d/build.cjs [pick]   pick = e.g. "goal-aaa=a,goal-free=a,..."  (default: all a). Writes site/assets/art/<id>.png at 256px.
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const { execSync } = require('child_process'); const fs = require('fs'), path = require('path');
const D = __dirname, ROOT = path.resolve(D, '../..');
execSync(`cd ${ROOT} && npx esbuild tools/art3d/main.js --bundle --format=iife --target=es2019 --outfile=tools/art3d/icons.bundle.js --log-level=warning`, { stdio: 'inherit' });
const pick = Object.fromEntries((process.argv[2] || '').split(',').filter(Boolean).map(s => s.split('=')));
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1000, height: 4200 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto('file://' + D + '/sheet.html'); await p.waitForFunction('window.ARTDONE', null, { timeout: 120000 });
  await p.locator('#sheet').screenshot({ path: path.join(ROOT, 'docs/art-sheet.png') });           // side-by-side review screenshot
  await p.evaluate(() => { document.documentElement.classList.add('cut'); document.body.classList.add('cut'); });
  const out = path.join(ROOT, 'site/assets/art'); fs.mkdirSync(out, { recursive: true });
  const ids = ['goal-aaa', 'goal-free', 'goal-paid', 'goal-jam', 'pip-closed', 'pip-open', 'hand', 'ch-1', 'ch-2', 'ch-3', 'ch-4', 'ch-5', 'ch-6', 'review-card'];
  for (const id of ids) {
    const v = pick[id] || pick[id.replace(/-(closed|open)$/, '')] || pick['pip'] || 'a';
    const f = path.join(out, id + '.png'); await p.locator('#' + id + '-' + v).screenshot({ path: f, omitBackground: true });
    console.log('cut', id, 'variant', v);
  }
  await b.close();
  // tight-crop the hand and print where the fingertip is, so the guide can aim exactly
  const py = `from PIL import Image\nim=Image.open('${out}/hand.png').convert('RGBA'); bb=im.getchannel('A').point(lambda a:255 if a>24 else 0).getbbox(); im=im.crop(bb); im.save('${out}/hand.png')\nA=im.getchannel('A'); w,h=im.size; xs=[x for x in range(w) if A.getpixel((x,2))>24 or A.getpixel((x,4))>24]; print('hand', w, h, 'tipx', round(sum(xs)/len(xs)) if xs else w//2)`;
  console.log(execSync('python3 -c "' + py.replace(/"/g, '\\"') + '"').toString().trim());
})().catch(e => { console.log('ERR', e.message); process.exit(1); });
