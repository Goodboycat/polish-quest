// Chat 9 screenshot review by Fable 5.2 (planner key). Usage: node tools/duo/review-chat9.mjs rescore3 planner docs/17-FABLE-REVIEW-5.md
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'planner', out = 'docs/17-FABLE-REVIEW-5.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const all = fs.readdirSync(D).filter(f => f.endsWith('.jpg'));
const want = [/^desktop-\d+-home/, /^desktop-\d+-next-2/, /^desktop-\d+-overview/, /^desktop-\d+-plan/, /^desktop-\d+-sample/, /^phone-\d+-home/, /^phone-\d+-next-2/, /^phone-\d+-plan/];
const pics = want.map(rx => all.find(f => rx.test(f))).filter(Boolean);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool.
What changed in this build: the product on sale is now "a plan made for your game: the tasks in order, one ready prompt per task, a done-check, which the buyer runs themselves" for a fixed price. The first screen now leads with the question "Stuck on how to make your game better?". The grey "Ask for a human review" sentence was removed from every screen. One offer card now lives on its own #plan screen (nav link "Plan") with a picture, price, what you get, and a link to a sample. #sample is now a made-up sample plan with task, why, prompt line, done-when. The site is NOT deployed yet and no sale is claimed.
Old complaints to judge against: not professional, too much text, not beginner friendly, hard-to-read text, everything shown at once instead of one full screen at a time, too many colors, looked dead.
Screenshots in order: ${pics.join(', ')}.
Reply in EXACTLY this format, blunt and concrete, no invented numbers or sales:
SCORE: <1-10>
PROFESSIONAL: <1-10>  BEGINNER: <1-10>  ALIVE: <1-10>  MONEY-READY: <1-10>
TOP FIVE DEFECTS:
1. ...
(five items, each naming the screen and a precise fix)
NEXT PROMPT FOR THE BUILDER: (one short paragraph, the single most valuable next change)`;
const r = await L.chatSafe(role, [{ role: 'system', content: 'You are the PLANNER (Fable 5.2): a ruthless product-design reviewer who looks at screenshots. You never write code.' }, { role: 'user', content: [{ type: 'text', text }, ...pics.map(img)] }], { maxTokens: 2500 });
fs.writeFileSync(L.ROOT + '/' + out, '# Fable 5.2 screenshot review (' + new Date().toISOString().slice(0, 10) + ', shots: ' + dir + ')\n\n' + r.text + '\n');
console.log(r.finish, r.text.length); console.log(r.text); console.log(L.status());
