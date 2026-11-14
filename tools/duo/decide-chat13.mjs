// Chat 13: ask the planner (Fable 5.2) to pick the checkout wording from the owner's two options. Text only, no images.
import fs from 'node:fs'; import * as L from './lib.mjs';
const text = `You are the PLANNER for "Polish Quest", a site that sells one thing: a $25 plan (ordered tasks, one ready prompt each, a done-check) written by the owner for a buyer's indie game. The owner gave you authority to choose the checkout lines. Use ONLY the owner's own words below, no invented facts, no emojis, no sales claims.
Option A (owner's first message): "delivery time of the game I build can be in 24 hours" (a guess), "refund policy I don't know, I prefer no refunding", "buyer leaves the game in the website and the website sends it to me through a place that can upload up to 500MB; maybe GitHub or email; Google Drive limit is 10MB".
Option B (owner's lines): "Delivered within 3 days", "Refund if the plan isn't useful, just ask", "Send your game link to goodboykitty2@gmail.com".
Facts: the site has no file-upload backend; it is static plus small serverless functions on Vercel. Email attachments are usually capped near 25MB, GitHub files at 100MB. Building a 500MB upload service is not done.
Reply in EXACTLY this format:
DELIVERY: <one short line for the buyer>
REFUND: <one short line>
SEND: <one short line telling the buyer where to send the game, using only the owner's address or link idea>
WHY: <two sentences: why this choice is the most trustworthy and honest for a first-time buyer>
NOTE FOR OWNER: <one sentence about the 500MB upload idea>`;
const r = await L.chatSafe('planner', [{ role: 'system', content: 'You are the PLANNER (Fable 5.2). Be concise and honest.' }, { role: 'user', content: text }], { max_tokens: 500 });
fs.writeFileSync(L.ROOT + '/docs/24-PLANNER-CHECKOUT-WORDS.md', '# Planner decision on checkout words (chat 13)\n\n' + r.text + '\n');
console.log(r.text); console.log(L.status());
