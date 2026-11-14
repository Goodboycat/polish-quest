// Chat 14 screenshot review by Fable 5.2 (planner key). Usage: node tools/duo/review-chat13.mjs rescore13 planner docs/25-FABLE-REVIEW-9.md
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'planner', out = 'docs/25-FABLE-REVIEW-9.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const pics = ['desktop-home', 'desktop-kind', 'desktop-rating', 'desktop-plan', 'desktop-assets', 'phone-home', 'phone-rating', 'phone-plan-menu'].map(n => n + '.jpg').filter(f => fs.existsSync(D + f)).slice(0, 8);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool. These are shots of the LIVE site.
Last review: 7.5/10 (professional 7.5, beginner 7.5, alive 8, money-ready 7). Defects then: kind selection ring wider than its card, hand and chip near Back/Next, stray dots; plan screen showed a raw Gmail address, repeated the email instruction, sample card not aligned with order card; rating left column was a stack of badge, chip, Change and note; phone header had no Plan link.
Changed since: kind screen has no ring, no dust, no trail dots, hand clear of Back/Next; plan step 2 is now a Send your game link by email link and the raw address is gone, the sample card has the same top and height as the order card; rating shows one line (Example game, goal, Change) and the code-only note moved into the report; phone header has a Menu button whose list includes Plan (last shot shows it open).
Old complaints to judge against: not professional, too much text, not beginner friendly, hard to read, everything at once instead of one full screen at a time, too many colors, looked dead.
Screenshots in order: ${pics.join(', ')}.
Reply in EXACTLY this format, blunt, no invented numbers or sales:
SCORE: <1-10>
PROFESSIONAL: <1-10>  BEGINNER: <1-10>  ALIVE: <1-10>  MONEY-READY: <1-10>
TOP FIVE DEFECTS:
1. ...
(five items, each naming the screen and a precise fix)
NEXT PROMPT FOR THE BUILDER: (one short paragraph)`;
const r = await L.chatSafe(role, [{ role: 'system', content: 'You are the PLANNER (Fable 5.2): a ruthless product-design reviewer who looks at screenshots. You never write code.' }, { role: 'user', content: [{ type: 'text', text }, ...pics.map(img)] }], { maxTokens: 1800 });
fs.writeFileSync(L.ROOT + '/' + out, '# Fable 5.2 screenshot review (' + new Date().toISOString().slice(0, 10) + ', shots: ' + dir + ')\n\n' + r.text + '\n');
console.log(r.text); console.log(L.status());
