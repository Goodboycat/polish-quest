# POLISH QUEST - PROGRESS (read this first in any new chat)

## CHAT 13 UPDATE (2026-11-14): clipping pass, assets rebuilt, checkout lines, REDEPLOYED. NO MONEY MADE YET
Pushed to GitHub after every task. Live: https://polish-quest-sigma.vercel.app (redeployed twice with the Vercel token from /home/user/.coarena.env, which is outside the repo; .vercel and .env.local are git-ignored).
- Budget: /v1/limits at start: planner used 0.23 (left 4.77), worker 0 (left 5). Fresh DAILY allowance (usd_per_day 5, resets 00:00 UTC). Ledger not zeroed. Spent about 1.2 on the planner (one text decision, one 8-image review). Worker not used, edited by hand.
- Task 1 clipping: home button now says only "Continue" with "Game name, step N" above it. NOTE: the real home screen is in site/js/screens-steps.js (it overrides the one in app.js). Goal chip uses a short label (goal.chip: Free game, Paid game...). Diamond has a space before it. "Example game" badge on #rating. Bottom action bar is solid.
- Task 2 #assets: three rows per tab, "Show more (N)", Search is its own tab, Coin Hop is a card with a real screenshot thumbnail (site/assets/art/coinhop-thumb.jpg) and a Play button. Phone has bottom padding so the fixed bar never covers it.
- Task 3: shape hidden on #plan (src3d/scene.js, bundle rebuilt). Hand now points at the first .kind-card, sparkles shrunk to about 40px, room reserved under the cards so the hand never covers Next/Skip. PC icon is a plain monitor (drawn as SVG, rendered with transparent background to PNG). Disabled Next is grey with a dashed border.
- Task 4 #plan checkout: three lines under the Order button, chosen by the planner (docs/24-PLANNER-CHECKOUT-WORDS.md) from the owner's two options: "Delivered within 3 days", "Refund if the plan isn't useful, just ask", "Send your game link to goodboykitty2@gmail.com". These are the owner's own words (config.js DELIVERY_TEXT, REFUND_TEXT, SEND_TEXT). The 500MB upload idea is NOT built: email attachments are usually about 25MB and GitHub allows 100MB per file, so the site asks for a game LINK instead. Owner still has to be ready to honour 3 days and the refund.
- Task 5: hide-prompts decision line was BLANK again. tools/hide-decision.json stays false. Nothing moved.
- Stripe: NO key or payment link was given this chat, so nothing was added. PayPal link is still the only checkout. Give a Stripe Payment Link (https://buy.stripe.com/...) and it can be a BUY_URL; no secret key goes in the site.
- Planner review 9 (docs/25-FABLE-REVIEW-9.md, taken on the live site BEFORE the final home fix because the first deploy still showed the old button): 7.5/10, professional 7.5, beginner 7.5, alive 8, money-ready 7 (was 6). After that review I fixed the home button for real and checked it locally with a screenshot and an overflow test (no overflow); the live file has the fix. No new review was bought, so 7.5 is not re-measured.
- Still open from review 9: kind screen selection ring wider than its card and hand near the Back/Next row on desktop; stray dots under the kind cards; raw Gmail address under the pay button (planner suggests a "Send your game link by email" link); step 2 and the third bullet on #plan repeat each other; sample card top not aligned with the order card; rating left column is a stack of badge, chip, Change and note; phone nav has no Plan link.
- Not tested: a real touch phone. Not built: a 500MB upload service. Demand for the $25 plan is untested. No sale is claimed.
SECURITY: the GitHub token, Vercel token, Coarena keys were pasted in chat again. Revoke and rotate them.

---

## CHAT 12 UPDATE (2026-11-14): playable example game added, re-score 7.5/10. NO MONEY MADE YET, LIVE SITE NOT REDEPLOYED
Pushed to GitHub after the game task. Short chat, low effort by request.
- Budget: /v1/limits at start: planner used 0.12 (left 4.88), worker 0 (left 5). Fresh DAILY allowance (usd_per_day 5, resets 00:00 UTC). Ledger not zeroed. This chat spent about 1.06 on the planner (one 8-image review). Worker not used.
- Already in the repo before this chat (found by git log): gold shapes, kind icons, rating labels, animated hand with sparkles, asset source dropdown, Clean UI prompt (step 26).
- NEW: site/play/ "Coin Hop", a small playable Three.js game built from src3d/game.js (npm run build:3d also builds site/play/game.bundle.js). Models are Kenney "Starter Kit 3D Platformer" (CC0, kit code MIT). site/play/ASSETS.md lists every file and licence. Linked from #assets as "play Coin Hop". Tested in headless Chromium: loads, 0 console errors, a bot steered to the flag and won with 5 of 7 coins. NOT tested on a real touch phone; the touch pad is untested beyond rendering.
- Task 3 (plan checkout words), task 5 (hide prompts): NOT done, the owner decision line in the prompt was BLANK again. Nothing invented. hide-decision.json still false.
- Redeploy: NOT done, no Vercel token was given this chat. Live site is still the old build. The extra Coarena keys are saved in /home/user/.coarena.env only and are NOT added to Vercel env.
- Stripe: the string pasted ("khcx-tgpc-...") does not look like a Stripe key (Stripe secret keys start sk_ or rk_). Not stored anywhere, not used. Use a Stripe Payment Link instead; no secret key is needed in the site.
- Planner review 8 (docs/22-FABLE-REVIEW-8.md, local build): 7.5/10, professional 7, beginner 7.5, alive 8, money-ready 6. Defects: phone home CTA text clipped and a dead gap, plan screen shape behind the sample card, assets list cut mid-row and Coin Hop buried as a text link, goal chip truncated and diamond glued to Weak, hand pointer floats off the kind cards and PC icon reads as code.
- tools/duo/shoot.cjs flow is stale (Next button not found on new screens); use tools/duo/shot-one.cjs per route. tools-env needs a node_modules link: ln -s /home/user/node_modules /home/user/tools-env/node_modules.
SECURITY: GitHub token, Coarena keys and the Stripe-like string were pasted in chat. Revoke and rotate.

---
## CHAT 10 UPDATE (2026-11-14): DEPLOYED on Vercel, game-type screen, free assets screen. NO MONEY MADE YET
Pushed to GitHub after each task. Live: https://polish-quest-sigma.vercel.app (Vercel account goodboykitty2-6858, project polish-quest).
- Budget: /v1/limits at start showed planner used 0 (left 5) and worker used 0 (left 5): a fresh DAILY allowance (usd_per_day 5, resets 00:00 UTC). Ledger not zeroed. Spent about 0.17 on the planner (one review). Worker not used, I edited by hand.
- Deploy: vercel.json (CSP headers, output site/, build runs build:3d), api/coach.js, api/rate.js, api/assets.js wrap the same functions/api/*.js code. Keys (extra1 and extra2) are Vercel env vars COARENA_API_KEY and _2, never in the repo. Cloudflare config still works too.
- Live tests: home 200. /api/coach real reply (one of four calls fell back to offline text, the page handles it), empty question 400, GET offline 200. /api/rate real reply, also from the browser button. /api/assets returns CC0 Poly Haven results. PayPal link https://paypal.me/goodboycat/25USD redirects (301, 301) to paypal.com/paypalme/goodboycat/25USD and returns 200. A bot cannot see the amount, so a human should still click it.
- New #kind screens (one question each: PC or Mobile, 3D / 2D / menu game, look: low poly / stylized / pixel) between the scan check and the goal. Choice is saved on the scan (platformId, kindId, styleId). Next button plus quiet Skip.
- New #assets screen (nav: Free assets): Tools, Models and art, Sound, Icons, each with the stated licence in a pill (Mixamo marked free account, NOT open source; Blender marked GPL; game-icons needs credit), Poly Haven CC0 search through /api/assets (server side), and a button that copies an asset and mobile performance prompt (site/js/assets-data.js PQ.assetPrompt). The mobile 3D prompt gives goals (about 3000 to 6000 triangles per character, batching, atlas, bones, compressed textures) and says they are goals, not measured facts. The question "is there a prompt for low poly mobile": there was NOT one before, there is now.
- Rating: eyebrow "Your score", one gold button, quiet "See the plan" link, "More" renamed "Report and AI opinion". Overview: one selected chapter (gold border), "Step 0: paste these rules first", Fix Kit lead says what it is. Small text now 15px and lighter grey (#C3CAD9). #plan fits 1280x720 and shows a sample task card (title, bright prompt box, done-when) on the right; hidden on narrow screens. Phone nav hides Plan and Privacy so it no longer collides with Pip.
- Hide prompts: owner decision line was BLANK again. tools/hide-decision.json unchanged (false). Nothing moved.
- Planner review 7 (docs/20-FABLE-REVIEW-7.md, live site): 7.5/10, professional 7, beginner 8, alive 6, money-ready 6. Fixed after it: Next button on #kind, licence pills, "Sample task (invented)" label. NOT fixed: bright lit rotating shape everywhere (home, kind, assets still dark), icons in the kind cards, phone hand overlaps the button edge, Weak / Needs work labels, plan checkout wording (delivery time, refund, upload link).
- Robot checks: fit.cjs all screens fit at 4 sizes, overlap test 0, 0 console errors on live.
Known gaps (be honest):
- NOT done: a playable game made from MIT assets (the owner asked "run on browser and play it, create a game"). No time was spent on it. Do it as its own task if still wanted.
- NOT done: Mixamo, Godot, Blender, Atlas are links with honest licence labels only. Mixamo has no public API and is not open source, so it cannot be fetched. Only Poly Haven is searched live.
- Offer still promises things only the owner can do (delivery time, who writes the plan, refund). Those config fields stay empty.
- Master prompts still public in site/ and in repo history (owner decision pending).
- Demand for the $25 plan is untested. No sale is claimed.
OWNER DECISIONS STILL WAITING: hide the 26 prompts or keep free; repo private or public; guarantee yes/no; which game is the real sample; is the sale real and quotable; delivery time and who writes the plan.
SECURITY: the GitHub token, the Vercel token, and six Coarena keys were pasted in chat. Revoke the GitHub and Vercel tokens and rotate the keys. Tokens were kept outside the repo in /home/user/.gh-token and /home/user/.coarena.env.

---
## CHAT 9 UPDATE (2026-11-13): money path now matches the product. STILL NOT DEPLOYED, NO MONEY MADE
Pushed to GitHub after each task. Robot checks at the end: 0 console errors, Pip overlap test 0 hits (15 screens x 5 sizes), every screen fits at 4 sizes (tools/duo/fit.cjs; the plan card on a 360x640 phone scrolls a little, it does not hide buttons), lint 26 prompts 0 leaks, no key or token in the repo.
- Budget: /v1/limits at start: planner used 0.64 (left 4.36), worker 0, extra1 0.06, extra2 0. It is a DAILY allowance (usd_per_day 5, resets 00:00 UTC), so the ledger was NOT zeroed. This chat spent about 0.30 on the planner (two screenshot reviews). Worker not used: I edited the code by hand.
- Owner decisions: the decision line in the prompt was BLANK. I made no choice for the owner. Deploy path, hide prompts, repo private, guarantee, sample game, sale-is-real all stay open (below).
- Product: the site now sells ONE thing: a plan written for the buyer's game (tasks in order, one ready prompt per task, a done-check) that the buyer runs themselves. "I play your build and send 10 fixes" is gone from the site.
- First screen: "Stuck on how to make your game better?" with a line about the FREE score and steps. Nav has a new "Plan" link.
- Offer card: one card on its own #plan screen (picture site/assets/art/review-card.png, price $25, what you get, 3-step how-it-works, sample link, text link for questions, one plain note). The grey "Ask for a human review" sentence was removed from #rating, #overview, #fix, #ads, #done. Pip never covers the card (overlap test).
- #sample: now one task per screen (why, a short prompt in a bright box, done-when), clearly labelled invented. #enough: no offer, honest text, button to #plan. Copied report: renamed "checklist", says the paid plan is a separate product.
- Hide prompts: tools/hide-decision.json {"hidePrompts": false}. tools/lint-prompts.cjs now scans site/ for 372 distinctive master phrases. false = prints a NOTE (354 found in data.js and prompts-1..4.js), true = exits 1. Tested both ways. Nothing was moved out of site/ because the owner has not decided.
- Planner re-score (Fable 5.2): review 5 (docs/17) 6/10 money-ready 4. Fixed. Review 6 (docs/18) 7/10: professional 7, beginner 7, alive 6, money-ready 5. That review was taken BEFORE the last #plan fixes (heading, one even how-it-works row, 15px light notes, no duplicate title). No third review was bought.
Known gaps (be honest):
- Not deployed. Task 4 (deploy, test coach and rate live, click the PayPal link) is blocked on the owner choosing own Cloudflare (cf-byok-deploy) or Genspark hosted (gsk-hosted-deploy).
- The offer promises things only the owner can do: delivery time (config DELIVERY_TEXT is empty, so the card says only "The plan comes by email"), who writes the plan, an address for the buyer to send the game to (card says "Email me your game or a link", the mailto link is below the card). No guarantee text and no quote on the site.
- Master prompts are still public in site/ and in the public repo history. The 26 free steps are generic, the paid plan is by hand. The owner must say whether to hide them.
- Planner still lists: the dark wireframe polyhedron fills half of home, overview, plan and sample on desktop (alive 6); the rating screen bottom row has three links and a vague "More"; overview shows two highlighted chapters and an unexplained "Ground rules" pill and "Fix Kit"; small grey text is dim.
- The $25 demand is untested. PayPal link https://paypal.me/goodboycat/25USD is not clicked by a human. Analyzer reads code only.
OWNER DECISIONS WAITING: (1) deploy: own Cloudflare or Genspark hosted. (2) hide the 26 prompts or keep them free. (3) repo private or public. (4) guarantee yes/no (only if you can refund every time). (5) which of your games is the real sample. (6) is the sale real and quotable. (7) delivery time and who writes the plan, in words that are true.
SECURITY: the GitHub token and six Coarena keys were pasted in chat again. Revoke the token and rotate the keys. The token was kept in /home/user/.gh-token outside the repo for one-off pushes, never in a remote.

---

## CHAT 8 UPDATE (2026-11-13): art finally drawn, named overview, score gem, Pip docked, functions re-tested. STILL NOT DEPLOYED, NO MONEY MADE
Pushed to GitHub after every task. Robot checks at the end: 0 console errors, 0 failed requests, every screen fits at 4 sizes (tools/duo/fit.cjs), Pip overlap test 0 hits over 14 screens x 5 sizes (tools/duo/overlap.cjs), lint 26 prompts 0 leaks, no key or token in repo, history or served files.
- Budget: /v1/limits at start showed planner used 0.32 (left 4.68), worker, extra1, extra2 used 0 (left 5). Daily allowance, resets 00:00 UTC. This chat spent about 1.30 on the planner (one plan, one screenshot review). Worker was not run: I edited the code by hand. ledger.json note updated.
- Planner brainstorm of the owner's "Why nobody is paying" notes is in docs/14-PLAN-CHAT8.md (model advice, unverified). Pushed before building.
- Art (owner rule followed this time): 6 chapter icons and a plan-card picture drawn as procedural Three.js 3D, 3 variants side by side in docs/art-sheet.png, screenshot, variant A cut to site/assets/art/ch-1..6.png and review-card.png. Rebuild with node tools/art3d/build.cjs. review-card.png is cut but NOT used on any screen yet.
- 3D gem: on #rating the object is now an icosahedron whose 20 faces map to the 7 areas and light from slate to gold by area score (setAreas), hover on a bar flashes its faces (focusArea). It sits in the right gutter, never behind text, and is hidden on phones. docs/gem-states.png shows low, mixed, high.
- Overview: chapter picker with icon, name and done count, plus the named steps of the chosen chapter. One footer line "Next: N. name" on every size. On phones the chapter name shows above the list.
- Pip: docked in the header on phones, bubble not shown on phones, so it cannot cover content. Desktop Pip bottom right passes the overlap test. Before the fix the test found 22 overlaps.
- Functions: coach.js and rate.js run under wrangler pages dev with a git-ignored .dev.vars (extra1 and extra2 keys). Good request 200 with a real model reply, empty question 400, bad goal 400, bad JSON 200 offline, GET 200 offline, no key 200 offline with canned text. Scripts: tools/duo/fn-test.sh, tools/duo/fn-nokey.mjs. Never run on real Cloudflare or a phone.
- Planner re-score (docs/15-FABLE-REVIEW-4.md): 7/10, professional 7, beginner 7, alive 6, money-ready 5 (scored BEFORE the last fixes, no second review was bought). Fixed after it: three plain labels Weak / Needs work / Good on one row, second opinion and copy report behind a single More link, phone chapter name, no gem behind the phone header.
Known gaps (be honest):
- The money path is the weak part. The site still sells "I play your build and send you 10 fixes" (a human review). The owner's own notes say devs want to do it themselves and the one buyer paid for an AI plan with one prompt per task. Offer card, #sample, #enough and the report text do not describe that product yet. Needs an owner decision (below).
- "Ask for a human review ($25)" is still a grey sentence on #rating, #overview, #fix. Planner wants a proper card (what you get, turnaround, price), not shown before a step is tried. The review-card picture is ready for it.
- Master prompts are public: site/js/prompts-*.js is shipped to every visitor and the GitHub repo is public with full history. Hiding the 26 prompts needs an owner decision (below).
- The notes say one person paid, this file said no money made. Owner must say which is true before any quote or "first buyer" line goes on the site. No quote is used.
- Phone: gem hidden, polyhedron backdrop hidden except on home. Not tested on a real phone.
- Analyzer reads code only, cannot tell fun. Pattern matching can miss ads loaded by code it did not read.
- PayPal link https://paypal.me/goodboycat/25USD still unverified by a human click.
OWNER DECISIONS WAITING: (1) deploy to your own Cloudflare (cf-byok-deploy) or Genspark hosted (gsk-hosted-deploy). (2) Hide the 26 prompts (show step names, reasons and done-checks free, sell the tailored plan) or keep generic prompts free. (3) Make the repo private or accept the prompts are already public. (4) Guarantee only if you can refund every time. (5) Which of your own games becomes the real sample plan. (6) Is the sale real, may it be quoted.
SECURITY: the GitHub token and all four Coarena keys were pasted in chat again. Revoke the token and rotate the keys.

---

## CHAT 7 UPDATE (2026-11-13): analyzer accuracy, evidence view, mark wrong, re-scan compare, report, chapters, sample review, price. STILL NOT DEPLOYED, NO MONEY MADE
Pushed to GitHub after every task. Checked by robot (0 console errors, 4 test zips reach #rating, all screens fit one screen on 1280x720, 1366x640, 390x844, 360x640, lint 26 prompts 0 leaks, secrets scan clean).
- Budget: /v1/limits at start showed planner used 0.21 left 4.79, worker/extra1/extra2 used 0 left 5. It is a DAILY allowance (usd_per_day 5, resets 00:00 UTC), so ledger note was updated, not zeroed. This chat spent about 0.39 (planner, one review). Worker and duo.mjs were NOT run: I edited the code by hand.
- Analyzer: ad detection now strips comments first (JS, C, Python/GDScript, HTML), so the word "interstitial" in a comment no longer triggers. Tested with a zip that had it only in comments (no ads) and one real AdMob call (found). scan.ads.where lists files per ad kind.
- Evidence view: on #rating each area opens to a list of every feature behind it with Seen / Maybe / Could not see and the file that showed it (files come from scan.evidence).
- Mark wrong: each row has "Mark wrong" or "It is there". Correction is saved (scan.overrides, localStorage) and the score changes. Undo button restores. Tested: 0.0 -> 0.9, survives reload.
- Copy the report: plain text with score, every finding, ads verdict, steps to do first, and the line that it reads code only.
- Re-scan compare: dropping the same game name again keeps goal, ticked steps and corrections and shows "Compared with your last scan". Logic is in screens-steps.js begin() (NOT app.js startScan, which is dead code for the file input).
- Overview now has 6 named chapters (Foundation, Controls and screens, Game feel, Depth and sound, Story, Ship it) with done counts.
- Sample review screen #sample (3 made-up fixes, clearly labelled made-up) and store page checklist #store (6 items) for priced games. Offer card links to the sample.
- Price tag: REVIEW_PRICE '$25' and BUY_URL https://paypal.me/goodboycat/25USD (paypal.me amount link, UNVERIFIED that it opens right: owner please click it). Contact mailto:goodboykitty2@gmail.com.
- Planner re-score (docs/12-FABLE-REVIEW-3.md): 6/10, money-ready 4/10. Fixed after it: Weak/OK/Good now look different, second-opinion and export became quiet links, disabled button is calm, Pip clearance on rating. Not fixed: 3D object still dark and idle, overview tiles show numbers only (chapter names help), Pip can still sit over content on other screens.
Known gaps (be honest):
- No new procedural art or icons this chat. The owner rule (draw realistic procedural art, show side by side, screenshot, extract PNGs) was NOT followed this time. Do it next chat for: chapter icons, a review card art, a gem that reacts to score.
- The coach and rate functions were not re-run this chat (no .dev.vars in the fresh clone). They were tested in chat 6 only. Never run on Cloudflare or a real phone.
- Analyzer reads code only. Cannot tell fun, or whether a feature works. Ad detection is still pattern matching, now minus comments, and can miss ads loaded by code it did not read.
- Offer says "I play your build and send you 10 fixes": the owner must really do it. No sale is guaranteed. $25 demand is untested.
- Not deployed: waiting for the owner to choose own Cloudflare account (cf-byok-deploy) or Genspark hosted. Either way COARENA_API_KEY (and _2, _3) must be host env vars, never in the repo.
- REVOKE the GitHub token and rotate all four Coarena keys: they were pasted in chat again.

---

## CHAT 6 UPDATE (2026-11-13): ad intent, honest "good enough", PayPal + email wired. STILL NOT DEPLOYED, NO MONEY MADE
Done and checked (robot: 0 console errors, 0 failed requests, 6-7 colors, no small text; 4 test zips still reach #rating; lint 26 prompts, 0 leaks; secrets scan clean):
- Old request check: hand pointer, coach function, scan/overview/phone/step layout, offer block were already done in chat 5 (kept, re-verified). Hand visibly points at Copy on #ads in the screenshot.
- Brainstorm saved in docs/11-BRAINSTORM.md (written by the Fable 5.2 planner, unverified). Pushed before building.
- Ad intent: detect.js now fills scan.ads (ad kit names, rewarded vs interstitial vs banner mentions, start-up looking files). It reads code only. site/js/ads.js gives PQ.adsReview() (free-with-ads goal gets rewarded-only guidance, fixed-price goal with ads gets a warning, others only if ad code is found) and PQ.renderAdsPrompt() (copy-paste prompt: list every ad, turn off full-screen and banner, add one optional rewarded button at a natural pause, reward always paid). New screen #ads sits between #rating and the steps. Six fair-ad rules are behind a tap.
- New screen #enough ("Is the game good enough?", reached from #done): honest answer, a 5-step playtest, then the offer card. It does not promise quality or sales.
- Rating wording made more honest ("Could see" instead of "Not found"; "cannot tell if it is fun").
- Owner links set in config.js: contact mailto:goodboykitty2@gmail.com, pay https://paypal.me/goodboycat (provider PayPal). REVIEW_PRICE still empty, so no price shows. Overview now shows the one-line offer so it fits one screen.
- functions/api/coach.js and rate.js: try COARENA_API_KEY, then _2, then _3 if one is out of allowance (401/402/429). Replies cut off by the token limit are trimmed to whole sentences or fall back to canned. rate.js max_tokens 420. Tested under wrangler pages dev: real replies, empty question 400. Local keys are in git-ignored .dev.vars.
- Budget: /v1/limits showed used 0 / left 5 on all four keys (usd_per_day 5, resets 00:00 UTC), so the daily allowance is real. ledger.json reset. This chat spent about 0.1 USD in total.
Known gaps (be honest):
- Planner did not re-score this build. My own rating: about 6.5/10 (see chat reply). Analyzer = code checklist only; it cannot judge fun, feel, or whether code works.
- Ad detection is word matching. A game can name "interstitial" in a comment, or hide ads behind code it did not read.
- No emoji-free check was run on prompts text beyond the old lint. Three.js gem still looks dim (docs/10 defects 4-5 open). Overview is still 26 plain squares (no chapters). Not tested on a real phone or on Cloudflare itself.
- Production needs env COARENA_API_KEY (and _2, _3) set in the host. Never put them in the repo.
- Offer text says "I play your build and send you 10 fixes". Owner must really do that. No sale is guaranteed.
- Ideas still open from docs/11: evidence view (file per finding), mark-wrong button, re-scan compare, export report, store page checklist, sample review.
- REVOKE the GitHub token and rotate all four Coarena keys: they were pasted in chat.

---

## CHAT 5 UPDATE (2026-11-12): pointer, coach function, layout and offer done. STILL NOT DEPLOYED, NO MONEY MADE
Done and checked in screenshots (tools/duo/shots/final, shots/zips; robot: 0 console errors, 0 failed requests, 6-7 colors, no text under 14px):
- Hand pointer rewritten (site/js/guide.js, css/guide.css). Art is procedural: tools/art/hand-sheet.html draws 3 variants side by side, node tools/art/build-hand.cjs screenshots them, the glove variant was cut to site/assets/art/hand.png. Hand image + pulsing yellow ring + label beside the hand. It stops on every route change and the home tour now starts on first load (it did not before: app.js renders before guide.js loads). Tours show once per browser (localStorage pq_tour); PQ.guide.replay() exists but no button calls it yet.
- functions/api/coach.js written and run under wrangler pages dev with a git-ignored .dev.vars: a real question got a real Coarena answer (HTTP 200, about 2.3 s, cost $0.0067). Empty question gives 400, bad JSON / GET / missing key / API error give HTTP 200 with a canned reply and offline:true. mascot.js aborts after 8 s and falls back to its own canned tip. The key is only in env.COARENA_API_KEY (secrets scan of repo: clean).
- Scan rows are a 3-column grid; overview is 9 tiles x 3 rows (7 columns on phone) in one screen with a legend; phone content is vertically centered with --actions-h measured from the real actions bar; step screens have numbered circles, Copy becomes Copied and ghost, Next becomes primary.
- css/screens.css and css/guide.css were never linked before (that is why the old hand and tiles looked wrong). Now linked in index.html. Old css/fix.css deleted.
- site/js/offer.js: PQ.offer('card'|'line') renders only when BUY_URL or CONTACT_URL in config.js is a https: or mailto: link. ?offer=1 previews it with placeholder links and the text "Preview only". Shown on #done, below the tiles on #overview (fits one screen), one line on #fix. A #done screen was added (it was missing).
- Test zips (unity, godot, phaser, mystery) dropped through the real file input: all reach #scan with correct rows, no errors (tools/duo/zips.cjs).
Known gaps (be honest):
- On the scan screen with an unsure engine the hand sits over a few chips because the card scrolls. Not fixed.
- Planner (Fable 5.2) did not re-score this build; the screenshots were checked by me only. Last planner score was 6/10.
- The hand art is a flat procedural illustration, not photo-real. Pip is still the simple SVG gem face. Gem toning-down (task 8 in docs/07) not done.
- BUY_URL, CONTACT_URL, REVIEW_PRICE are still empty: the owner must supply real links. No offer shows to real visitors until then.
- Never run on Cloudflare itself; only wrangler pages dev. Not tested on a real phone.
- Budget: /v1/limits showed used 0 / left 5 USD on both keys (a DAILY allowance, resets 00:00 UTC), so tools/duo/ledger.json was reset. This chat used $0.0067. The duo agents were not run.
- Docs 07 plan is the planner's own and is untested: no sale is guaranteed, demand at the proposed 25 dollars is unknown.
- REVOKE the GitHub token pasted in chat (https://github.com/settings/tokens), and consider rotating both Coarena keys, since they were pasted in chat too.

---

## CHAT 4 UPDATE (2026-11-12): UI REBUILT, NOT FINISHED, NOT DEPLOYED
Everything below this block describes the OLD pixel-art UI (deleted, still in git history at e0bb59c). The logic modules (zip.js, detect.js, data.js, core.js, prompts-*.js, store.js) are unchanged and still used.
- New UI: dark wizard, one screen at a time, Three.js gem, hand pointer, mascot Pip. Built by two Fable 5.2 agents (tools/duo). Planner score 6/10.
- Broken or missing: hand pointer looks wrong, functions/api/coach.js (free API) not written, offer block empty, overview tiles overflow, scan rows run together, never run on Cloudflare.
- Full facts: docs/06-REBUILD-REPORT.md. Next tasks: docs/07-PLANNER-FINAL-PLAN.md. Prompt for the next chat: docs/08-NEXT-CHAT-PROMPT.md.
- Spend: planner $3.84, worker $4.44 of the 90% line $4.50 each (Coarena may reset daily, check /v1/limits).
- Repo layout changed: site/ is the deliverable (wrangler pages dir), functions/ for Pages Functions, src3d/ for Three.js source, tools/duo/ for the agents harness. The old Hono template (src/, vite) was removed.
- REVOKE the GitHub token pasted in chat.

---


Project: static website for indie game devs. Drop game zip (read in browser, never uploaded) -> ordered AI prompts.
Repo: https://github.com/Goodboycat/polish-quest   Local: /home/user/webapp   Push: git push with a fresh token typed by the user (never saved in the repo)
Deliverable site folder: site/  (pure static, no external requests, no libs, CSP blocks network)
Rules: no emojis in the game-style UI (use PNG art). Mobile landscape first. Never invent facts. $0 budget.

## DONE
- [x] Step 0: repo created, skeleton, this file
- [x] Step 1: research saved in docs/00-RESEARCH-NOTES.md (fees, hosting, Genspark API = none found, Sonnet 5.5 confirmed)
- Tools ready: playwright+chromium in /home/user/tools-env (node), PIL, push helper ~/pushnow.sh

- [x] Step 2: art engine tools/art/*.js, node tools/build-art.cjs (screenshot) + python3 tools/slice.py -> site/assets (92 PNGs: 77 icons + 15 art/frames). 'hand' icon removed (looked rude) -> 'tap'.

- [x] Step 3 DONE: prompt library complete = site/js/data.js, core.js, prompts-1.js [1-9], prompts-2.js [10-18], prompts-3.js [19-22], prompts-4.js [23-26], prompts-fix.js (6 Fix Kit prompts: bug, undo, resume, regress, softlock, savesafe). Script load order in index.html: data, core, prompts-1, 2, 3, 4, fix. Lint: node tools/lint-prompts.cjs (26 prompts, 6 fix, 0 leaks). Fix Kit item = {id,title,icon,blurb,params[{key,label,options[{id,label,text}]}],goal,input,steps,dont,done}; UI passes params {kind,when,where,note...}. Original plan: files planned: site/js/data.js (engines/genres/features/devices/protect), core.js (render engine), prompts-0..3.js, prompts-fix in prompts-3.js.
  Final order (26 numbered + P0): 1 audit+memory, 2 structure+safety, 3 smoke test+debug view(ADDED), 4 performance, 5 purpose+goal, 6 controls, 7 phone layout+fullscreen(ADDED), 8 smooth UI, 9 notification log, 10 combat feel, 11 learn by playing, 12 pointer tutorial, 13 earned abilities, 14 short goals, 15 economy, 16 variety, 17 VFX, 18 audio(ADDED), 19 cinematics, 20 dialogue, 21 finisher, 22 emotional payoff, 23 retention, 24 final perf, 25 final quality, 26 release pack(ADDED). Fix Kit: one bug, undo, resume, regression, softlock, save safety.
  Prompt body format: GOAL / LOOK AT FIRST / BUILD / DO NOT TOUCH / DONE WHEN / QUICK TEST / FINISH. Build items can carry has:'featureKey' -> tagged [ALREADY THERE - CHECK ONLY] or [CHECK FIRST].

## NEXT (in order)
- [x] Step 4 DONE: site/js/zip.js (own parser, native DecompressionStream + own inflate fallback, tested stored/deflate/utf8/7z/cut files) + site/js/detect.js (PQ.detect.scan(file,{onProgress}) -> scan result; PQ.detect.sample()). Tested on synthetic unity/phaser/godot/web/mystery zips. Scan result has questions[] for UI when unsure.
- [x] Step 5 DONE: site/index.html, privacy.html, css/style.css, js/{config,store,ui,view-home,view-scan,view-quest,view-trust,view-review,app}.js, _headers, fonts (Press Start 2P, OFL, local). Tests: node tools/e2e.cjs (screens at 4 sizes -> tools/out/shots) and node tools/e2e-func.cjs (66 checks, http + file:// offline, all pass). Serve for tests: pm2 start ecosystem.config.cjs (python http.server on site/, port 3000). Playwright lives in /home/user/tools-env (reinstall: npm i playwright && npx playwright install chromium).
- [x] Step 6 DONE: docs/01-PUBLISH-AND-GET-PAID.md, 02-FIRST-CLIENT.md, 03-MONEY-PLAN.md, 04-MARKETING-30-DAYS.md
- [x] Step 7 PARTLY: real-zip stress test (tools/real-zips.cjs): 250 MB Godot demo collection (4071 files, 139 projects) scans in ~1 s, warns 'multi-project'; Phaser template, MDN canvas workshop (fixed: plain web game with inline canvas script), mozdevs tiles all ok. e2e-func 66/66 pass (http + file:// offline). Fixed: floating Log dock covered content on landscape phones.
- [x] Step 8: dist-zip/polish-quest-site.zip (upload this folder CONTENTS to Cloudflare Pages) + polish-quest-docs.zip
- [x] Step 9 (chat 3, 2026-11-11): toast moved to top bar at all sizes; slim prompt-sheet footer on landscape; detector fixed on real Unity/LOVE/Ren'Py/RPG Maker zips; prompts 0-8 read against Tiny Boatball and fixed (see docs/05-HANDOFF-NEXT-CHAT.md for the full list); docs 01-04 verified against official pages and corrected; e2e-func 66/66; dist-zip rebuilt.
- [ ] NEXT: see docs/05-HANDOFF-NEXT-CHAT.md (section NEXT). Short version: test one full RPG Maker MV/MZ game; have the user run prompts 1-4 in a real AI tool and report breakage; update fee numbers after sale 1; REVOKE the GitHub token.
- API answer for the user: the site uses no API. The Genspark LLM proxy refuses Free-plan accounts (tested live). Free credits are not cash.
- Rebuild fixtures in a fresh sandbox: python3 tools/make-fixtures.py ; chromium needs: sudo npx playwright install-deps chromium

## NOTES
- GitHub token was pasted in chat by user -> tell user to REVOKE it at the end.
- LUMEN/game/tools/github.sh does not exist in sandbox (said so to user).

## DESIGN DECISIONS (so a new chat does not re-decide)
- Site = classic <script> files (NO ES modules) so index.html also works from file:// (airplane test).
- Zip reader = own parser + DecompressionStream('deflate-raw'), reads only central directory + needed text files via File.slice.
- Prompt library = site/js/prompts-*.js, placeholders {{TOKEN}} auto-filled by engine; no braces ever shown to user.
- 22 core prompts in the user's exact order + 4 ADDED (smoke test, settings/phone layout, audio, release pack) + Fix Kit (6 helper prompts). (Core-only toggle DROPPED: later prompts refer to earlier numbers, hiding some would break references. The 4 ADDED prompts (3,7,18,26) get an EXTRA tag in the UI instead.)
- Art: tools/art/*.js drawn on canvas -> tools/art-sheet.html -> playwright screenshot -> PIL slice -> site/assets/{art,icons}/*.png. Icons exported at 128px (4x of 32). Show at 32 or 64 css px only.
- Screens (single page): Title/Drop, Scan result (character sheet), Quest log, Trust (test-it-yourself + watchdog), Custom review. Landscape phone = left rail nav.
- config.js holds BUY_URL / CONTACT_URL (empty by default -> honest 'not open yet').
