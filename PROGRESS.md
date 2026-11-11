# POLISH QUEST - PROGRESS (read this first in any new chat)

Project: static website for indie game devs. Drop game zip (read in browser, never uploaded) -> ordered AI prompts.
Repo: https://github.com/Goodboycat/polish-quest   Local: /home/user/webapp   Push: bash ~/pushnow.sh "msg"
Deliverable site folder: site/  (pure static, no external requests, no libs, CSP blocks network)
Rules: no emojis in the game-style UI (use PNG art). Mobile landscape first. Never invent facts. $0 budget.

## DONE
- [x] Step 0: repo created, skeleton, this file
- [x] Step 1: research saved in docs/00-RESEARCH-NOTES.md (fees, hosting, Genspark API = none found, Sonnet 5.5 confirmed)
- Tools ready: playwright+chromium in /home/user/tools-env (node), PIL, push helper ~/pushnow.sh

- [x] Step 2: art engine tools/art/*.js, node tools/build-art.cjs (screenshot) + python3 tools/slice.py -> site/assets (92 PNGs: 77 icons + 15 art/frames). 'hand' icon removed (looked rude) -> 'tap'.

- [~] Step 3 IN PROGRESS (data.js, core.js, prompts-1.js [1-9] DONE, prompts-2.js [10-18] DONE; next prompts-3.js [19-26 + fixkit]; lint: node tools/lint-prompts.cjs): files planned: site/js/data.js (engines/genres/features/devices/protect), core.js (render engine), prompts-0..3.js, prompts-fix in prompts-3.js.
  Final order (26 numbered + P0): 1 audit+memory, 2 structure+safety, 3 smoke test+debug view(ADDED), 4 performance, 5 purpose+goal, 6 controls, 7 phone layout+fullscreen(ADDED), 8 smooth UI, 9 notification log, 10 combat feel, 11 learn by playing, 12 pointer tutorial, 13 earned abilities, 14 short goals, 15 economy, 16 variety, 17 VFX, 18 audio(ADDED), 19 cinematics, 20 dialogue, 21 finisher, 22 emotional payoff, 23 retention, 24 final perf, 25 final quality, 26 release pack(ADDED). Fix Kit: one bug, undo, resume, regression, softlock, save safety.
  Prompt body format: GOAL / LOOK AT FIRST / BUILD / DO NOT TOUCH / DONE WHEN / QUICK TEST / FINISH. Build items can carry has:'featureKey' -> tagged [ALREADY THERE - CHECK ONLY] or [CHECK FIRST].

## NEXT (in order)
- [ ] Step 3: prompt library
- [ ] Step 4: zip reader + detector
- [ ] Step 5: UI + privacy + test-it-yourself + CSP
- [ ] Step 6: business docs
- [ ] Step 7: browser tests + screenshots + fixes
- [ ] Step 8: zip + download link + final report

## NOTES
- GitHub token was pasted in chat by user -> tell user to REVOKE it at the end.
- LUMEN/game/tools/github.sh does not exist in sandbox (said so to user).

## DESIGN DECISIONS (so a new chat does not re-decide)
- Site = classic <script> files (NO ES modules) so index.html also works from file:// (airplane test).
- Zip reader = own parser + DecompressionStream('deflate-raw'), reads only central directory + needed text files via File.slice.
- Prompt library = site/js/prompts-*.js, placeholders {{TOKEN}} auto-filled by engine; no braces ever shown to user.
- 22 core prompts in the user's exact order + 4 ADDED (smoke test, settings/phone layout, audio, release pack) + Fix Kit (6 helper prompts). Toggle core-only.
- Art: tools/art/*.js drawn on canvas -> tools/art-sheet.html -> playwright screenshot -> PIL slice -> site/assets/{art,icons}/*.png. Icons exported at 128px (4x of 32). Show at 32 or 64 css px only.
- Screens (single page): Title/Drop, Scan result (character sheet), Quest log, Trust (test-it-yourself + watchdog), Custom review. Landscape phone = left rail nav.
- config.js holds BUY_URL / CONTACT_URL (empty by default -> honest 'not open yet').
