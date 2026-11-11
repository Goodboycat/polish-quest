// Polish Quest duo: PLANNER (Fable 5.2, key 1, sees screenshots) orders, WORKER (Fable 5.2, key 2) writes files.
// Stops at 90% of $5 on either key. Resumable via tools/duo/state.json. Usage: node tools/duo/duo.mjs [auto]
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
import * as L from './lib.mjs';
const R = L.ROOT, SPEC = R + '/tools/duo/spec', STATE = R + '/tools/duo/state.json';
const st = (() => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { phase: 'plan', tasks: [], done: [], round: 0, scores: [] }; } })();
const save = () => fs.writeFileSync(STATE, JSON.stringify(st, null, 1));
const rd = f => fs.readFileSync(f, 'utf8');
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64') } });
const png = f => ({ type: 'image_url', image_url: { url: 'data:image/png;base64,' + fs.readFileSync(f).toString('base64') } });

const WORKER_SYS = `You are the WORKER half of a two-agent team (model Fable 5.2). The PLANNER gives you a task; you write the code. You cannot ask questions.
OUTPUT FORMAT (nothing else, no prose, no markdown fences around blocks):
=== FILE: relative/path.ext ===
<entire file content>
=== END FILE ===
To change an existing file with small edits use:
=== PATCH: relative/path.ext ===
<<<<<<< SEARCH
<exact existing text, must match once>
=======
<new text>
>>>>>>> REPLACE
=== END PATCH ===
To remove a file: === DELETE: relative/path.ext ===
Allowed paths: site/, src3d/, functions/, docs/, README.md. Never write secrets or API keys anywhere.
Quality bar: professional product site (think Linear / Vercel / Stripe), calm, lots of space, ONE accent color, big readable type (Inter), one idea per full screen, no walls of text, plain words for beginners, no emojis, no pixel fonts. Code must run without errors in a modern browser. Classic scripts on window.PQ namespace (no ES modules in site/js; src3d uses ES imports and is bundled). Obey the CONTEXT hard rules exactly (CSP, no innerHTML with user text, data-t test hooks).
Keep your whole answer under 14000 tokens: be compact (short names, no long comments).`;

function plannerSys() { return `You are the PLANNER half of a two-agent team (model Fable 5.2). You think, look at screenshots, analyse, decide and order. The WORKER writes all code. You never write code files; you write precise instructions.
You are rebuilding "Polish Quest" so it earns its owner the first 25 US dollars from indie game developers. Judge like a ruthless product designer: professional, concise, beginner friendly, readable, few colors, alive (Three.js), ONE thing per full screen, visual hand-pointer tutorial, a talking mascot that never blocks the page. Be concrete (hex colors, px sizes, copy text, file names). The worker has a hard 14000-token output limit per task, so size tasks to fit (max ~35KB of code per task, max 4 files).`; }

async function plan() {
  L.log('PLAN: planner studies the old site screenshots');
  const before = ['desktop-1-home.png', 'desktop-2-after-sample.png', 'desktop-_quest_p1.png', 'phone-1-home.png', 'phone-_quest.png'].map(f => png(R + '/tools/duo/shots/before/' + f));
  const content = [{ type: 'text', text: `${rd(SPEC + '/REQUIREMENTS.md')}\n\n${rd(SPEC + '/CONTEXT.md')}\n\nThe attached 5 screenshots are the OLD site (home, after loading the example, a prompt sheet, phone home, phone quest list).
Produce the rebuild plan in EXACTLY this format:
=== DESIGN ===
(a design spec the worker will read before every task, max 900 words: palette with hex values (max 1 accent + neutrals), type scale, spacing, the screen list with one-line purpose and EXACT copy for each screen (short!), the wizard flow (home -> scan -> confirm -> steps 1..26 one full screen each -> done), how the 3D scene behaves per screen (moods), how the hand pointer guide works (API: PQ.guide.point(selector,{text}), PQ.guide.sequence([{sel,text}]), first-visit tour), how the mascot behaves (SVG character, speech bubble that auto-advances, minimizable, never modal, the user can keep clicking; coach question box talking to /api/coach), the monetisation block (honest, uses PQ_CONFIG.BUY_URL/CONTACT_URL/REVIEW_PRICE, hidden when empty), and what makes this irresistible for beginners who want everything step by step)
=== TASK t1 | short title | file1, file2 ===
(instructions for the worker)
=== TASK t2 | ... ===
... (4 to 6 tasks total, ordered so that after t1 the site already loads and the robot can click through; t1 MUST include index.html with the correct script order and CSP, the base CSS design system, router, state, and the first screens)
=== END ===` }, ...before];
  const r = await L.chat('planner', [{ role: 'system', content: plannerSys() }, { role: 'user', content }], { maxTokens: 9000, effort: 'medium', label: 'plan' });
  const design = (r.text.match(/=== DESIGN ===\n([\s\S]*?)\n=== TASK /) || [])[1];
  if (!design) throw new Error('plan had no DESIGN section: ' + r.text.slice(0, 300));
  fs.writeFileSync(SPEC + '/DESIGN.md', design);
  const tasks = []; const rx = /=== TASK (\w+) \| ([^|]+)\| ([^=]+?) ===\n([\s\S]*?)(?=\n=== (?:TASK|END) )/g; let m;
  while ((m = rx.exec(r.text))) tasks.push({ id: m[1], title: m[2].trim(), files: m[3].split(',').map(s => s.trim()).filter(Boolean), text: m[4].trim() });
  if (!tasks.length) throw new Error('plan had no tasks');
  st.tasks = tasks; st.phase = 'build'; save(); fs.writeFileSync(SPEC + '/PLAN.txt', r.text);
  L.log('PLAN ok: ' + tasks.map(t => t.id + ':' + t.title).join(' | '));
}

function cleanOld() {
  const rm = p => fs.rmSync(path.join(R, p), { recursive: true, force: true });
  ['site/js/ui.js', 'site/js/view-home.js', 'site/js/view-scan.js', 'site/js/view-quest.js', 'site/js/view-trust.js', 'site/js/view-review.js', 'site/js/app.js', 'site/css/style.css', 'site/privacy.html', 'site/assets/art', 'site/assets/icons', 'tools/e2e.cjs', 'tools/e2e-func.cjs', 'tools/art', 'tools/art-sheet.html', 'tools/build-art.cjs', 'tools/slice.py', 'tools/out', 'dist-zip'].forEach(rm);
  L.log('old UI, pixel art and old UI tests removed (kept in git history)');
}

function ctxFor(task, extraPaths = []) {
  const files = [...new Set([...(task.files || []), ...extraPaths])].filter(f => fs.existsSync(path.join(R, f)) && !f.endsWith('.png'));
  return `${rd(SPEC + '/REQUIREMENTS.md')}\n\n${rd(SPEC + '/CONTEXT.md')}\n\n# DESIGN SPEC\n${fs.existsSync(SPEC + '/DESIGN.md') ? rd(SPEC + '/DESIGN.md') : ''}\n\n# Current site files (you may rely on them)\n${L.readFiles(files, 45000)}\n# Current file tree of site/ and others\n${execSync(`cd ${R} && find site src3d functions -type f -not -name "*.woff2" | sort`).toString()}`;
}

function build3d() { try { if (fs.existsSync(R + '/src3d/scene.js')) execSync(`cd ${R} && npx esbuild src3d/scene.js --bundle --minify --format=iife --target=es2019 --outfile=site/js/scene.bundle.js 2>&1`, { timeout: 90000 }); return ''; } catch (e) { return 'BUILD3D FAILED: ' + String(e.stdout || e.message).slice(0, 800); } }
function shoot(name) { try { return execSync(`cd ${R} && node tools/duo/shoot.cjs ${name} 2>&1 | tail -2`, { timeout: 150000 }).toString(); } catch (e) { return 'SHOOT FAILED ' + String(e.stdout || e.message).slice(0, 300); } }
function jsCheck() { const bad = []; for (const f of fs.readdirSync(R + '/site/js')) { if (!f.endsWith('.js') || f.endsWith('.bundle.js')) continue; try { execSync(`node --check ${R}/site/js/${f}`, { stdio: 'pipe' }); } catch (e) { bad.push(f + ': ' + String(e.stderr).split('\n').slice(0, 4).join(' ').slice(0, 300)); } } try { if (fs.existsSync(R + '/functions/api/coach.js')) execSync(`node --check ${R}/functions/api/coach.js`, { stdio: 'pipe' }); } catch (e) { bad.push('functions/api/coach.js: ' + String(e.stderr).slice(0, 300)); } return bad; }
function commit(msg) { try { execSync(`cd ${R} && git add -A && git -c user.name="Polish Quest Duo" -c user.email="duo@polish-quest.local" commit -qm ${JSON.stringify(msg)} 2>&1 | tail -1`); } catch { /* nothing to commit */ } }

async function runTask(task, tag = 'task') {
  L.log(`WORKER ${tag} ${task.id}: ${task.title}`);
  const user = `${ctxFor(task, task.extra || [])}\n\n# YOUR TASK (${task.id}: ${task.title})\nFiles you own for this task: ${task.files.join(', ')}\n${task.text}\n\nWrite the files now, in the required block format only.`;
  const r = await L.chat('worker', [{ role: 'system', content: WORKER_SYS }, { role: 'user', content: user }], { maxTokens: 15500, effort: 'low', label: `${tag} ${task.id}` });
  const b = L.parseBlocks(r.text, r.finish); const notes = L.applyBlocks(b);
  if (r.finish === 'length') notes.push('WARNING: output was cut at the token limit; the last file may be missing');
  L.log('  ' + notes.join(' | '));
  const errs = jsCheck(); const b3 = build3d(); if (b3) errs.push(b3);
  return { notes, errs };
}

async function fixLoop(label, errs) {
  for (let i = 0; i < 2 && errs.length && !L.overBudget(); i++) {
    L.log(`FIX ${label} attempt ${i + 1}: ${errs.join(' || ').slice(0, 300)}`);
    const owners = [...new Set(errs.map(e => (e.match(/^([\w./-]+\.js)/) || [])[1]).filter(Boolean).map(f => f.startsWith('functions') ? f : 'site/js/' + f))];
    const res = await runTask({ id: 'fix' + i, title: 'repair syntax/build errors', files: owners.length ? owners : ['site/js'], text: 'These errors were found automatically. Repair them with PATCH blocks (or FILE if a file is broken beyond patching). Change nothing else.\n' + errs.join('\n') }, 'repair');
    errs = res.errs;
  }
  return errs;
}

async function review(roundLabel) {
  const out = `${roundLabel}`; const sh = shoot(out); L.log('SHOOT ' + out + ': ' + sh.slice(0, 300));
  const dir = R + '/tools/duo/shots/' + out; if (!fs.existsSync(dir + '/report.json')) return null;
  const rep = JSON.parse(rd(dir + '/report.json'));
  const want = rep.shots.filter(f => /home|after-sample|next-1|next-2|coach|overview/.test(f)).slice(0, 8);
  const pics = want.map(f => img(dir + '/' + f));
  const brief = JSON.stringify({ errors: rep.errors.slice(0, 8), failedRequests: rep.failed.slice(0, 5), flowIssues: rep.flow, missing404: rep.missing, metrics: rep.metrics }, null, 0).slice(0, 3500);
  const prompt = `${rd(SPEC + '/REQUIREMENTS.md')}\n\n# DESIGN SPEC\n${rd(SPEC + '/DESIGN.md')}\n\nREVIEW ROUND ${out}. Screenshots attached in this order: ${want.join(', ')}.\nRobot report: ${brief}\n
Be a ruthless reviewer. Check: professional look, few colors (metrics.distinctColors), text >= 16px (metrics.smallTextCount), ONE idea per screen, concise copy, beginner friendly, 3D scene visible (hasCanvas), hand pointer (hasGuide), mascot (hasMascot) that does not block, phone layout, overflow, flow (can a beginner go zip -> step by step?), money path.
Reply in EXACTLY this format:
SCORE: <1-10 overall>
VERDICT: <continue|good-enough>
FINDINGS:
- (max 8 bullets, most important first, each concrete)
=== TASK f1 | title | file1, file2 ===
(precise fix instructions for the worker; reference exact selectors, px, hex, copy. Use PATCH-friendly small edits unless a file must be rewritten. Max 2 tasks total, each fits in 14000 output tokens.)
=== END ===
If all is excellent, give zero tasks and VERDICT good-enough.`;
  const r = await L.chat('planner', [{ role: 'system', content: plannerSys() }, { role: 'user', content: [{ type: 'text', text: prompt }, ...pics] }], { maxTokens: 5000, effort: 'medium', label: 'review ' + out });
  const score = +((r.text.match(/SCORE:\s*(\d+)/) || [])[1] || 0); const verdict = (r.text.match(/VERDICT:\s*([\w-]+)/) || [])[1] || 'continue';
  const tasks = []; const rx = /=== TASK (\w+) \| ([^|]+)\| ([^=]+?) ===\n([\s\S]*?)(?=\n=== (?:TASK|END)|$)/g; let m;
  while ((m = rx.exec(r.text))) tasks.push({ id: m[1] + '_' + out, title: m[2].trim(), files: m[3].split(',').map(s => s.trim()).filter(Boolean), text: m[4].trim() });
  fs.writeFileSync(R + '/tools/duo/shots/' + out + '/review.txt', r.text);
  fs.appendFileSync(SPEC + '/REVIEWS.md', `\n## ${out} (score ${score}, ${verdict}) - ${L.status()}\n${r.text.split('=== TASK')[0]}\n`);
  st.scores.push({ round: out, score, verdict }); save();
  return { score, verdict, tasks };
}

async function main() {
  await L.initLedger(); fs.mkdirSync(SPEC, { recursive: true });
  L.log('START ' + L.status());
  if (st.phase === 'plan') { await plan(); cleanOld(); }
  if (st.phase === 'build') {
    for (const t of st.tasks) {
      if (st.done.includes(t.id)) continue;
      if (L.overBudget()) { L.log('BUDGET STOP before ' + t.id); st.phase = 'stopped'; save(); return; }
      const res = await runTask(t); const left = await fixLoop(t.id, res.errs);
      if (left.length) L.log('UNRESOLVED after repair: ' + left.join(' || ').slice(0, 300));
      st.done.push(t.id); save(); commit('duo: ' + t.id + ' ' + t.title);
    }
    st.phase = 'review'; save();
  }
  while (st.phase === 'review') {
    if (L.overBudget()) { L.log('BUDGET STOP in review'); st.phase = 'stopped'; save(); break; }
    st.round++; const rv = await review('r' + st.round); if (!rv) { L.log('review failed, retrying once'); continue; }
    L.log(`REVIEW r${st.round}: score ${rv.score} ${rv.verdict}, ${rv.tasks.length} tasks`);
    if ((rv.verdict === 'good-enough' && rv.score >= 8) || !rv.tasks.length || st.round >= 12) { st.phase = 'polish'; save(); break; }
    for (const t of rv.tasks) { if (L.overBudget()) break; const res = await runTask(t, 'fix'); await fixLoop(t.id, res.errs); commit('duo: ' + t.id + ' ' + t.title); }
  }
  L.log('END phase=' + st.phase + ' ' + L.status());
}
main().catch(e => { L.log('CRASH ' + e.message); process.exit(1); });
