// One planner-only call after the worker hit its 90% line: final verdict + exact task list for the next chat + appeal plan.
import fs from 'node:fs'; import * as L from './lib.mjs';
const R = L.ROOT, S = R + '/tools/duo/spec/', D = R + '/tools/duo/shots/final/';
const rd = f => fs.readFileSync(f, 'utf8');
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const pics = ['desktop-01-home.jpg', 'desktop-02-after-sample.jpg', 'desktop-07-overview.jpg', 'phone-02-after-sample.jpg', 'phone-03-next-1.jpg', 'phone-07-overview.jpg'].filter(f => fs.existsSync(D + f));
const rep = JSON.parse(rd(D + 'report.json'));
const tree = fs.readdirSync(R + '/site/js').join(', ') + ' | css: ' + fs.readdirSync(R + '/site/css').join(', ') + ' | functions/api: ' + (fs.existsSync(R + '/functions/api') ? fs.readdirSync(R + '/functions/api').join(', ') || '(empty)' : '(missing)');
const text = `${rd(S + 'REQUIREMENTS.md')}\n\n# DESIGN SPEC\n${rd(S + 'DESIGN.md')}\n\n# Last reviews (tail)\n${rd(S + 'REVIEWS.md').slice(-3500)}\n\nFACTS: files now: ${tree}. functions/api/coach.js does NOT exist (the free API is not wired). site/js/config.js has empty BUY_URL/CONTACT_URL so no offer renders. Robot: ${JSON.stringify({ errors: rep.errors.length, flow: rep.flow, metrics: rep.metrics.desktop })}.
The WORKER budget is spent (90% line reached). A NEW chat will continue with fresh budget, so write for that chat. Screenshots attached (final state): ${pics.join(', ')}.
Reply in EXACTLY these sections, concise, concrete, no invented statistics:
## VERDICT
SCORE n/10 and 5 bullets: what is good, what is broken (be blunt).
## NEXT TASKS (for the next worker; max 8; each fits in 14000 output tokens; ordered by impact; each with files, exact selectors/px/hex/copy)
## APPEAL PLAN (step-by-step beginners: what exactly makes indie devs who want everything step by step say yes; max 10 bullets)
## FIRST 25 DOLLARS (honest plan: what to sell, price, where, what the owner must do by hand; flag what is unverified)`;
const r = await L.chatSafe('planner', [{ role: 'system', content: 'You are the PLANNER (Fable 5.2). You analyse screenshots and order work. You never write code files.' }, { role: 'user', content: [{ type: 'text', text }, ...pics.map(img)] }], { maxTokens: 7500, effort: 'low', label: 'final-review' });
fs.writeFileSync(R + '/docs/07-PLANNER-FINAL-PLAN.md', '# 7. Planner final plan (written by Fable 5.2, planner key, 2026-11-12)\n\n' + r.text + '\n');
console.log(r.finish, r.text.length, L.status());
