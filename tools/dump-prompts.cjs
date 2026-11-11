// node tools/dump-prompts.cjs file.zip outdir  -> scans a real zip in the browser, writes every prompt exactly as the site renders it
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [zip, out] = [process.argv[2], process.argv[3] || 'tools/out/prompts'];
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await (await b.newContext()).newPage();
  await pg.goto('http://localhost:3000/#home'); await pg.waitForTimeout(300);
  await pg.setInputFiles('#zip-input', zip);
  await pg.waitForFunction(() => location.hash === '#scan', null, { timeout: 60000 });
  const res = await pg.evaluate(() => { const c = PQ.makeCtx(PQ.ui.state.scan); const o = { p0: PQ.renderPrompt0(c) }; PQ.PROMPTS.forEach(p => { o['p' + p.n] = PQ.renderPrompt(p, c); }); return o; });
  for (const k of Object.keys(res)) fs.writeFileSync(path.join(out, k + '.txt'), res[k]);
  console.log(Object.keys(res).length, 'prompts written to', out);
  await b.close();
})();
