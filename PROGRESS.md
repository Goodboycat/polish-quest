# POLISH QUEST - PROGRESS (read this first in any new chat)

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
