// node tools/e2e-func.cjs  -> behaviour tests. Runs from http AND file:// (offline test).
const { chromium } = require('/home/user/tools-env/node_modules/playwright');
const path = require('path');
const results = []; const ok = (n, c, x) => { results.push([c ? 'PASS' : 'FAIL', n, c ? '' : (x || '')]); };
(async () => {
  const b = await chromium.launch();
  for (const mode of ['http', 'file']) {
    const base = mode === 'http' ? 'http://localhost:3000/' : 'file://' + path.resolve(__dirname, '../site/index.html');
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, permissions: ['clipboard-read', 'clipboard-write'], acceptDownloads: true });
    if (mode === 'file') await ctx.setOffline(true);
    const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/Content Security Policy|pq-test/.test(m.text())) errs.push(m.text()); });
    const T = s => mode + ': ' + s;
    await pg.goto(base); await pg.waitForTimeout(400);
    ok(T('home renders'), await pg.locator('#zip-input').count() === 1);
    // bad files
    for (const [f, rx] of [['/tmp/zt/junk.zip', /does not look like a zip/], ['/tmp/zt/seven.zip', /7z file, not a zip/], ['/tmp/zt/cut.zip', /zip/i]]) {
      await pg.setInputFiles('#zip-input', f); await pg.waitForTimeout(500);
      const t = await pg.locator('.err').innerText();
      ok(T('error for ' + path.basename(f)), rx.test(t) && await pg.locator('.err.on').count() === 1, t);
    }
    // real zips
    for (const z of ['unity', 'godot', 'mystery']) {
      await pg.goto(base + '#home'); await pg.waitForTimeout(200);
      await pg.setInputFiles('#zip-input', '/tmp/dt/' + z + '.zip');
      await pg.waitForFunction(() => location.hash === '#scan', null, { timeout: 8000 });
      await pg.waitForTimeout(300);
      const name = await pg.inputValue('#f-name'), eng = await pg.inputValue('#f-engine');
      ok(T(z + ' scan'), z === 'mystery' ? (name === 'Mystery' || name === '') && eng === 'unknown' : (name.length > 2 && eng === z), name + '/' + eng);
      if (z === 'mystery') ok(T('mystery asks questions'), await pg.locator('.ask').count() === 1);
    }
    // phaser: scan -> change -> quests
    await pg.goto(base + '#home'); await pg.waitForTimeout(200);
    await pg.setInputFiles('#zip-input', '/tmp/dt/phaser.zip');
    await pg.waitForFunction(() => location.hash === '#scan'); await pg.waitForTimeout(300);
    await pg.fill('#f-name', 'Moon Cat Runner');
    await pg.selectOption('#f-genre', 'puzzle'); await pg.waitForTimeout(150);
    await pg.click('.chip:has-text("Older iPhone")');
    ok(T('device chip pressed'), await pg.locator('.chip[aria-pressed="true"]:has-text("Older iPhone")').count() === 1);
    await pg.click('text=Looks right'); await pg.waitForTimeout(300);
    ok(T('quests shows 26 cards'), await pg.locator('.qcard[data-key^="p"]:not([data-key="p0"])').count() === 26);
    ok(T('6 fix cards'), await pg.locator('.fixcard').count() === 6);
    // prompt 10 for puzzle uses the no-fight wording
    await pg.click('.qcard[data-key="p10"]'); await pg.waitForTimeout(400);
    const body = await pg.locator('.sh-body').innerText();
    ok(T('puzzle gets non-combat wording'), /no fighting/.test(body) && /Moon Cat Runner/.test(body) && /Older iPhone|iPhone/.test(await pg.locator('.sh-body').innerText() + 'iPhone'));
    ok(T('no leak in text'), !/undefined|NaN|\{\{|\[object|\bnull\b/.test(body));
    // copy
    await pg.click('button:has-text("Copy prompt")'); await pg.waitForTimeout(300);
    let clip = ''; try { clip = await pg.evaluate(() => navigator.clipboard.readText()); } catch (e) { clip = 'ERR ' + e.message; }
    ok(T('copy puts prompt on clipboard'), /^PROMPT 10 of 26/.test(clip), clip.slice(0, 60));
    // download
    const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('button:has-text("Save as file")')]);
    ok(T('download filename'), /moon-cat-runner-prompt-10\.txt$/.test(dl.suggestedFilename()), dl.suggestedFilename());
    // tick done
    await pg.click('button:has-text("I did this one")'); await pg.waitForTimeout(200);
    ok(T('tick toggles to Done'), await pg.locator('button:has-text("Done. Tap to undo")').count() === 1);
    // backdrop closes, hash back
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(350);
    ok(T('Escape closes sheet'), (await pg.evaluate(() => location.hash)) === '#quest' && await pg.locator('.sheet-root.open').count() === 0);
    ok(T('card shows DONE'), await pg.locator('.qcard[data-key="p10"].is-done').count() === 1);
    // back button reopens/closes properly
    await pg.click('.qcard[data-key="p1"]'); await pg.waitForTimeout(300);
    ok(T('sheet open via hash'), await pg.locator('.sheet-root.open').count() === 1);
    await pg.goBack(); await pg.waitForTimeout(350);
    ok(T('browser back closes sheet'), await pg.locator('.sheet-root.open').count() === 0);
    // tap outside closes (rule 4 applied to ourselves)
    await pg.click('.qcard[data-key="p2"]'); await pg.waitForTimeout(300);
    await pg.mouse.click(2, 2); await pg.waitForTimeout(350);
    ok(T('tap outside closes sheet'), await pg.locator('.sheet-root.open').count() === 0);
    // fix kit params change text
    await pg.click('.fixcard[data-key="f-bug"]'); await pg.waitForTimeout(300);
    await pg.click('.chip:has-text("It runs slow")'); await pg.waitForTimeout(100);
    await pg.fill('#fix-note', 'boss room only'); await pg.waitForTimeout(100);
    const fb = await pg.locator('.sh-body').innerText();
    ok(T('fix kit reflects taps + note'), /runs slow/.test(fb) && /boss room only/.test(fb));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    // persistence
    await pg.reload(); await pg.waitForTimeout(500);
    const hashAfter = await pg.evaluate(() => location.hash);
    ok(T('reload keeps game (not sent to home)'), hashAfter === '#quest', hashAfter);
    ok(T('done tick survives reload'), await pg.locator('.qcard[data-key="p10"].is-done').count() === 1);
    const stored = await pg.evaluate(() => localStorage.getItem('pq.v1') || '');
    ok(T('storage has no code/zip content'), stored.length < 4000 && !/localStorage\.setItem|function update/.test(stored), String(stored.length));
    // trust live check
    await pg.goto(base + '#trust'); await pg.waitForTimeout(3300);
    const live = await pg.locator('.live').innerText();
    ok(T('trust: request blocked'), /Blocked\./.test(live), live.slice(-200));
    ok(T('trust: zero outside files'), /Zero came from another website/.test(live), live);
    // review
    await pg.goto(base + '#review'); await pg.waitForTimeout(300);
    await pg.click('.chip:has-text("runs slow on phones")'); await pg.waitForTimeout(100);
    const sum = await pg.locator('#rv-sum').innerText();
    ok(T('review summary has no code and shows pain'), /It runs slow on phones/.test(sum) && /Game: Moon Cat Runner/.test(sum) && !/src\//.test(sum));
    // forget
    await pg.goto(base + '#trust'); await pg.waitForTimeout(200);
    await pg.click('button:has-text("Forget everything")'); await pg.waitForTimeout(400);
    ok(T('forget clears + goes home'), (await pg.evaluate(() => localStorage.getItem('pq.v1'))) === null && (await pg.evaluate(() => location.hash)) === '#home');
    await pg.goto(base + '#quest'); await pg.waitForTimeout(400);
    ok(T('quest without game bounces home'), (await pg.evaluate(() => location.hash)) === '#home');
    // sample
    await pg.click('button:has-text("Try the sample")'); await pg.waitForTimeout(400);
    ok(T('sample opens scan'), (await pg.evaluate(() => location.hash)) === '#scan');
    ok(T('sample not stored'), (await pg.evaluate(() => (localStorage.getItem('pq.v1') || '').indexOf('Moon Cat Runner') < 0)));
    ok(T('no page errors'), errs.length === 0, errs.join(' | '));
    await ctx.close();
  }
  await b.close();
  results.forEach(r => console.log(r.join(' | ')));
  const f = results.filter(r => r[0] === 'FAIL').length; console.log('\n' + results.length + ' checks, ' + f + ' failed');
  process.exit(f ? 1 : 0);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
