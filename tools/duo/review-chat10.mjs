// Chat 9 screenshot review by Fable 5.2 (planner key). Usage: node tools/duo/review-chat9.mjs rescore3 planner docs/17-FABLE-REVIEW-5.md
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'planner', out = 'docs/17-FABLE-REVIEW-5.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const all = fs.readdirSync(D).filter(f => f.endsWith('.jpg'));
const want = [/^desktop-1-home/, /^desktop-2-kind/, /^desktop-3-rating/, /^desktop-4-overview/, /^desktop-5-assets/, /^desktop-6-plan/, /^phone-1-home/, /^phone-3-rating/];
const pics = want.map(rx => all.find(f => rx.test(f))).filter(Boolean);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool.
What changed since the last review (it scored 7, money-ready 5): the site is now deployed live on Vercel (screenshots are of the LIVE site). New: a one-question-at-a-time screen for PC or Mobile, game type and look (low poly etc.), a Free assets screen (MIT/CC0 sources with honest licence labels, CC0 search through a server route), a copyable asset and mobile-performance prompt, rating screen has one gold button and a quiet See the plan link, overview shows one selected chapter and Step 0 label, small text raised to 15px and lighter, sample task card preview on the plan screen.
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
