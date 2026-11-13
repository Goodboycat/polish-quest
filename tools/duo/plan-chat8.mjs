// One planner call: brainstorm around the owner's "why nobody is paying" notes and the chat-8 task list, then write a plan.
// Usage: node tools/duo/plan-chat8.mjs   (planner key pays; no key is printed or stored here)
import fs from 'node:fs'; import * as L from './lib.mjs';
const notes = fs.readFileSync('/home/user/uploaded_files/Polish_Quest_Why_Nobody_Is_Paying.txt', 'utf8');
const ctx = L.readFiles(['docs/12-FABLE-REVIEW-3.md'], 4000) + '\n' + fs.readFileSync(L.ROOT + '/PROGRESS.md', 'utf8').slice(0, 3800);
const text = `You are the PLANNER for "Polish Quest", a browser tool that reads an indie game zip and gives ordered prompts for an AI coding tool. The owner (Israel) wants his first 25 US dollars. Below are his conversation notes about why nobody pays, then the current repo state.

RULES: no emojis in UI, no keys in repo/browser, never invent facts, sales or market numbers, be honest. Art = realistic procedural art, variants side by side, screenshot, cut PNGs. The site is static (Cloudflare Pages) plus functions/api/coach.js and rate.js. Master prompts currently live in site/js/prompts-*.js in a PUBLIC GitHub repo, so the notes' point about hiding the 26 master prompts matters.

TASK: Brainstorm around EVERY numbered point (1 to 8 and the summary) of the notes. For each point give: what it means for the website, concrete change (or "not a website change, owner action"), and effort. Then write a PLAN in this order of the owner's list: 1) skipped art (6 chapter icons, review card picture, 3D gem lighting by area score), 2) overview tiles show step names, 3) Pip never covers content, 4) test coach.js and rate.js under wrangler pages dev, 5) deploy, 6) re-score. Insert the payment-driven changes where they fit (first-screen pain headline, sample plan, free first slice, guarantee wording only if the owner can honestly honor it, master-prompt privacy). Mark each task S/M/L and give a done-check. Be concrete and brief; max about 1400 words. Flag anything that needs an owner decision.

=== OWNER NOTES ===
${notes}
=== REPO STATE ===
${ctx}`;
const r = await L.chatSafe('planner', [{ role: 'system', content: 'You are the PLANNER (Fable 5.2): a blunt product strategist. You never write code. You never invent facts or sales.' }, { role: 'user', content: text }], { maxTokens: 7000, effort: 'low', label: 'plan-chat8' });
fs.writeFileSync(L.ROOT + '/docs/14-PLAN-CHAT8.md', '# Chat 8 brainstorm and plan (Fable 5.2 planner, ' + new Date().toISOString().slice(0, 10) + ')\n\nWritten by the model from the owner notes. Unverified advice, no sales or market claims.\n\n' + r.text + '\n');
console.log(r.finish, r.text.length); console.log(L.status());
