// node tools/real-zips.cjs file1.zip file2.zip ... -> runs PQ.detect.scan on real zips in the browser, prints result summary
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext()).newPage();
  pg.on('pageerror', e => console.log('PAGEERR', e.message));
  await pg.goto('http://localhost:3000/'); await pg.waitForTimeout(300);
  for (const f of process.argv.slice(2)) {
    await pg.goto('http://localhost:3000/#home');
    await pg.setInputFiles('#zip-input', f);
    const t0 = Date.now();
    try {
      await pg.waitForFunction(() => location.hash === '#scan' || document.querySelector('.err.on'), null, { timeout: 120000 });
    } catch (e) { console.log(f, 'TIMEOUT'); continue; }
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => ({ hash: location.hash, err: (document.querySelector('.err.on') || {}).innerText,
      name: (document.querySelector('#f-name') || {}).value, engine: (document.querySelector('#f-engine') || {}).value,
      genre: (document.querySelector('#f-genre') || {}).value, asks: document.querySelectorAll('.ask').length,
      warn: [...document.querySelectorAll('ul.notes li, .ask')].map(x => x.innerText.replace(/\s+/g,' ').slice(0, 220)) }));
    console.log(f.split('/').pop(), (Date.now() - t0) + 'ms', JSON.stringify(r));
  }
  await b.close();
})();
