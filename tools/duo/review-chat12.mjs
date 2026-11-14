// Chat 9 screenshot review by Fable 5.2 (planner key). Usage: node tools/duo/review-chat9.mjs rescore3 planner docs/17-FABLE-REVIEW-5.md
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'planner', out = 'docs/17-FABLE-REVIEW-5.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const all = fs.readdirSync(D).filter(f => f.endsWith('.jpg'));
const want = [/^desktop-home/, /^desktop-kind/, /^desktop-rating/, /^desktop-overview/, /^desktop-assets/, /^desktop-plan/, /^phone-home/, /^phone-rating/];
const pics = want.map(rx => all.find(f => rx.test(f))).filter(Boolean);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool.
What changed since the last review (7.5, money-ready 6): bright gold rotating 3D shape on every screen, gold line icons in the kind cards, rating labels with a goal chip, animated hand pointer with trail sparkles and button press, a source dropdown on asset search, a Clean UI prompt, and a playable Three.js example game (Coin Hop, Kenney CC0 models) linked from the Free assets screen. Screenshots are of a local build of the same code as the live site (no deploy token available). Owner decisions on refund, delivery time and who writes the plan are still blank, so the plan screen deliberately states none of them.
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
