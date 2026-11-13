# 11. Brainstorm (Fable 5.2 planner, 2026-11-13)

Asked: accurate analyzer, ad intent, 'is it good enough', what gets the product toward 10/10. Written by the model, not verified. No sales or market claims are made.

POLISH QUEST BRAINSTORM

A. After finishing Polish Quest, is the game good enough?

Not necessarily. Finishing Polish Quest means the game has the things polished games usually have: saving, settings, feedback, a pause menu, a clean first minute. It does not mean the game is fun, because a checklist cannot measure fun, and reading code cannot either. A finished quest makes a good game feel finished and makes a weak game's real problems easier to see. The only way to know if it is good enough is to watch real people play it, which is why the site should say so plainly and point to playtesting (and the human review) as the next step.

B. Making the analyzer more accurate without lying

Six checks possible from zip contents in the browser:

1. Ad SDK presence: search file names, manifests and source for known SDK identifiers (AdMob, Unity Ads, AppLovin, ironSource, and web portal SDKs such as CrazyGames or Poki).
2. Interstitial versus rewarded: count calls and class names containing "interstitial" versus "rewarded", and flag ad calls found in startup or first-scene scripts.
3. Save system: look for PlayerPrefs, localStorage, file writes, JSON serialization or engine save APIs, and whether both a save and a load call exist.
4. Settings and accessibility: volume controls, audio bus or mixer use, key rebinding, fullscreen toggle, colour or text size options.
5. Feedback and juice signals: screen shake, particles, tweens, sound effect calls tied to input or hit events, counted against the number of audio files actually in the zip.
6. Structure and hygiene: pause handling, a title or menu scene, a tutorial or first-level scene, controller input support, leftover debug logs, TODO comments, placeholder asset names, and price or purchase SDK identifiers.

Each finding should show its evidence (file name and line) and a confidence label: found, not found, or unclear. "Not found" must be worded as "we could not see it", never "it is missing".

Three things it can never know:

1. Whether the game is fun, fair or well paced.
2. Whether the code actually runs and the feature works as intended (present in code is not the same as working in play).
3. How the game looks, sounds and feels, and whether anyone will buy it.

C. Twelve ideas toward 10/10, ordered by value for a beginner

1. Evidence view: every rating line shows the file and line that caused it. EFFORT medium, MONEY no.
2. "What this score means" honesty panel beside the rating: code read only, cannot judge fun. EFFORT small, MONEY no.
3. Ad intent path: if ads are detected or chosen, add rewarded-only prompts and flag forced interstitials, ads in the first minutes and ads that block play. EFFORT medium, MONEY no.
4. Progress saved in the browser, so the user can leave and return to the same prompt. EFFORT small, MONEY no.
5. Re-scan and compare: drop a new zip, see which items changed from not found to found. EFFORT medium, MONEY no.
6. "Mark wrong" button on each finding, so the user can correct the detector and the score updates. EFFORT small, MONEY no.
7. Playtest kit: a printable script and five questions for watching a friend play, offered at the end. EFFORT small, MONEY no.
8. Sample report of a human review shown on the offer card, so buyers see exactly what they get. EFFORT small, MONEY yes.
9. Offer placement at the honest moment: after the answer to "is it good enough", offer the human review as the thing code reading cannot do. EFFORT small, MONEY yes.
10. Exportable report (text or PDF) with rating, evidence and remaining prompts. EFFORT medium, MONEY no.
11. Engine-specific prompt wording (Godot, Unity, web) based on detection. EFFORT large, MONEY no.
12. Store page readiness checklist for fixed-price games: description, screenshots list, trailer beats. EFFORT medium, MONEY yes, as an add-on to the review.

D. The five to build first

1. Honesty panel (idea 2): it is tiny, and every other accuracy claim depends on the user trusting the site's limits.
2. Evidence view with confidence labels (idea 1): this is what makes the analyzer accurate rather than merely confident.
3. Ad intent path (idea 3): it is a direct owner request and protects players from the worst beginner mistake.
4. Sample review plus offer placement (ideas 8 and 9, shipped together): this is the shortest path to the first 25 dollars, because it sells the one thing the tool admits it cannot do.
5. Saved progress (idea 4): 26 prompts take more than one sitting, and users who return are the ones who finish and buy.