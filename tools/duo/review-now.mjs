// One screenshot review by Fable 5.2. Usage: node tools/duo/review-now.mjs <shotsDir> <role> <outFile>
// role = which key pays (planner|worker|extra1|extra2). Sends only screenshots and a short brief, never any key.
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'worker', out = 'docs/09-FABLE-REVIEW.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const all = fs.readdirSync(D).filter(f => f.endsWith('.jpg'));
const want = [/^desktop-\d+-home/, /^desktop-\d+-goal-empty/, /^desktop-\d+-goal-picked/, /^desktop-\d+-next-2/, /^desktop-\d+-overview/, /^phone-\d+-goal-empty/, /^phone-\d+-next-2/, /^phone-\d+-overview/];
const pics = want.map(rx => all.find(f => rx.test(f))).filter(Boolean).slice(0, 8);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const rep = JSON.parse(fs.readFileSync(D + 'report.json', 'utf8'));
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool.
New in this build: after the scan it asks the owner's GOAL (flagship game / free with ads or purchases / one fixed price / just finish it), then shows a 0-10 READINESS RATING weighted by that goal (a code checklist: the scan looks for features such as saves, touch controls, tutorial, audio; nobody plays the game). A 3D pointing-hand tutorial and a mascot (Pip) exist. Art was made as procedural Three.js 3D objects.
Old complaints to judge against: not professional, too much text, not beginner friendly, hard-to-read text, everything shown at once instead of one full screen at a time, too many colors, looked dead. Rule: no emojis.
Robot report: ${JSON.stringify({ errors: rep.errors.length, failed: rep.failed.length, desktop: rep.metrics.desktop, phone: rep.metrics.phone })}
Note: 'goal-empty' is the goal screen before a pick (Continue is disabled), 'next-2' is the rating screen. Screenshots in order: ${pics.join(', ')}.
Reply in EXACTLY this format, blunt and concrete, no invented numbers:
SCORE: <1-10>
PROFESSIONAL: <1-10>  BEGINNER: <1-10>  ALIVE: <1-10>  MONEY-READY: <1-10>
TOP FIVE DEFECTS:
1. ...
(five items, each naming the screen and a precise fix)
WHAT WOULD MOVE IT TO 9: (3 bullets)`;
const r = await L.chatSafe(role, [{ role: 'system', content: 'You are the PLANNER (Fable 5.2): a ruthless product-design reviewer who looks at screenshots. You never write code.' }, { role: 'user', content: [{ type: 'text', text }, ...pics.map(img)] }], { maxTokens: 3500, effort: 'low', label: 'review-now' });
fs.writeFileSync(L.ROOT + '/' + out, '# Fable 5.2 screenshot review (' + new Date().toISOString().slice(0, 10) + ', shots: ' + dir + ')\n\n' + r.text + '\n');
console.log(r.finish, r.text.length); console.log(r.text.slice(0, 2600)); console.log(L.status());
