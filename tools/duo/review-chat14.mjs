// Chat 14 screenshot review by Fable 5.2 (planner key). Usage: node tools/duo/review-chat13.mjs rescore13 planner docs/25-FABLE-REVIEW-9.md
import fs from 'node:fs'; import * as L from './lib.mjs';
const [dir, role = 'planner', out = 'docs/25-FABLE-REVIEW-9.md'] = process.argv.slice(2);
const D = L.ROOT + '/tools/duo/shots/' + dir + '/';
const pics = ['desktop-home', 'desktop-kind', 'desktop-rating', 'desktop-plan', 'desktop-assets', 'phone-home', 'phone-rating', 'phone-plan-menu'].map(n => n + '.jpg').filter(f => fs.existsSync(D + f)).slice(0, 8);
const img = f => ({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + fs.readFileSync(D + f).toString('base64') } });
const text = `You are reviewing "Polish Quest", a website for indie game developers. It reads a game zip in the browser and gives ordered prompts for an AI coding tool. These are shots of the LIVE site.
Last review: 7/10 (professional 6.5, beginner 7.5, alive 8, money-ready 7). Defects then: empty gold box over the home subtitle, phone home button labels clipped, kind cards looked different with a hollow circle and a floating hand, phone home dead gap and hand crowding the bar, plan sample card half empty with Pip bubble overlapping and Back cut off.
Changed since: kind screen ripple circle removed; phone home buttons stacked full width; plan sample card now shows two tasks, plan fits 1280x720 with Back visible; phone Menu list includes Plan (last shot shows it open). The gold ring on home is the hand-pointer target ring around the Choose button.
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
