# 5. Handoff for the next chat (written 2026-11-11)

Read PROGRESS.md first, then this file. Do not redo anything listed under DONE.

## Setup in a fresh sandbox (took about 3 minutes)
1. Clone the repo to /home/user/webapp (the old copy may be missing).
2. `python3 tools/make-fixtures.py` (builds /tmp/dt zips and /tmp/zt/junk.zip). Do NOT unzip anything into /tmp/zt, it deletes test fixtures.
3. Playwright is not kept between sandboxes: `mkdir -p /home/user/tools-env && cd /home/user/tools-env && npm init -y && npm i playwright && npx playwright install chromium`, then `sudo npx playwright install-deps chromium`.
4. `pm2 start ecosystem.config.cjs` serves site/ on port 3000.
5. Tests: `node tools/e2e-func.cjs` (66 checks), `node tools/e2e.cjs` (screens at 4 sizes into tools/out/shots), `node tools/lint-prompts.cjs`.
6. New tools this chat: `node tools/real-zips.cjs a.zip b.zip` now also prints engine reason, genre words and the features it found. `node tools/dump-prompts.cjs file.zip outdir` writes all 27 prompts exactly as the site renders them.

## DONE in this chat
### Task 1: layout (landscape 844x390, then portrait)
- The Log toast no longer covers content. It now appears in the top bar at every screen size (it used to float over the page next to the Log button). Checked in landscape and portrait screenshots.
- Prompt sheet on landscape: button bar is one slim row (36 px buttons instead of 44+), header is slimmer, and the text above the bar fades out instead of being cut in half. Portrait keeps big 44 px buttons.
### Task 2: detector on real zips (all downloaded from GitHub, none invented)
| Engine | Project | Result now |
|---|---|---|
| Unity | Unity-Technologies/PhysicsExamples2D (4 projects in one zip) | Unity, Neon Shooter, shooter, warns "4 separate projects" |
| Unity | albertobeta/2D-SpaceShooter | Unity, shooter, name asks the user (no real name in files) |
| Unity | gubicsz/Solitaire | Unity, name Solitaire, was "sim", now card |
| Unity | oussamabonnor1/Rocket_Ride_Unity2D | Unity, Rocket Ride, genre asks the user (honest) |
| LOVE | sacemakesgame/Tiny-Boatball | LOVE, now named from conf.lua: "Tiny Boatball!" |
| LOVE | zzxzzk115/GoldMiner-Rebirth | LOVE, "GoldMiner GameShell" (from conf.lua), genre asks |
| Ren'Py | pass-by-reference/renpy-space-invaders | Ren'Py, "Space Invaders" (from options.rpy), shooter |
| Ren'Py | Imavoyc/Sakuranouta-RenPy-Part1 | Ren'Py, "Sakuranouta part1", narrative (was "other") |
| RPG Maker | RMEx/AlmostHeroic (VX Ace) | was "unknown", now RPG Maker, name from Game.ini, note that its scripts are not readable by AI |
| RPG Maker | MikanHako1024/RPGMakerMV_MiniGame_CatchGold (plugin only) | RPG Maker (js/plugins) |
Fixes made in site/js/detect.js: ignore Unity Assets/Plugins code, Lua helper libraries (hump, lume, toolkit/lib...), the Ren'Py default screens/gui/options files and error-handler boilerplate; read names from conf.lua, options.rpy, Game.ini, System.json; recognise .rvdata2/.rxdata and js/plugins.js as RPG Maker; Ren'Py leans to "story"; "I am sure about the genre" now needs at least one clear word, not only vague ones (room, floor, seed, run).
STILL WEAK (be honest with users): 
- One unzipped RPG Maker MV/MZ full game was never tested (I could not find a small, legal one). Only the plugin repo and a VX Ace project were tested. Ask the user for one.
- A zip with a Chinese-named RPG Maker 2000-style project (zxsean/MyRpgmaker) is still "unknown engine". That is correct to ask about, but add an `.ini`/`RPG_RT.exe` rule if users send these.
- Genre is often "I am not sure, tap the answer". That is intended. Do not make it guess more.
### Task 3: prompts 1-8 read against Tiny Boatball (a real LOVE game)
Problems found and fixed in site/js:
1. Prompt 0 said "LOVE (Lua) (Lua)". Fixed in core.js.
2. Prompt 1 told the AI to run `git init` and also said "no git yet, ask me": it contradicted Prompt 2 which owns git setup. Now Prompt 1 only makes a plain folder copy.
3. Prompts 2 to 26 assumed the zip scan is still true. After Prompt 2 git exists, but the prompt kept saying "Git was not found". Now it says: if a repo exists, commit; if still none, ask.
4. Prompt 6 and 7 (touch controls, phone layout) were marked "already in the game" for a PC-only game, because the word "touch" matched a mouse-pointer line in boilerplate. Now: the scan ignores boilerplate, and if touch is not proven the prompt first asks "Should this game run on phones at all?" and no longer says "HEADS UP, mostly done".
5. Prompt 5 said a goal system exists because the word "goal" appeared in physics code for a ball game (sports goals). "goal" alone no longer counts; "quest, mission, objective, milestone, achievement" do.
6. The "do not edit" list for Tiny Boatball was empty. Now it lists toolkit/lib/.
Not done: I could not run the prompts through an AI (no usable AI API from this account), so "where the AI breaks things" is NOT measured. The fixes above come from reading the prompt text against the real files, not from watching an AI run them.
### Task 4: claims in docs 01 to 04 (written into the docs themselves)
- VERIFIED: Cloudflare Pages free limits (500 builds, 20,000 files, 25 MiB per file, 100 projects). Cloudflare Developer Platform terms (they name Pages) do not ban commercial sites. Master terms 2.2.1(a) bans reselling access or signing up for a third party, so do not host client sites on your account.
- VERIFIED: Cloudflare says domains are sold at cost. `.com` = US$10.46 for registration and renewal (cfdomainpricing.com, a tracker that copies Cloudflare, 2026-11-11). Some search results show higher numbers. Check the dashboard.
- VERIFIED: itch.io payment page matches all numbers in doc 01 (10% default share, $0.30 + 2.9%, $5 minimum, 7 days, 10-14 day review, $3 identity fee, 30% withholding for non-US without tax number).
- VERIFIED: itch.io quality guidelines forbid ads on other people's pages and boards; self-promotion belongs on the Release announcements board. They also say not to make "unrealistic statements about what your project can accomplish".
- CORRECTED: the docs said "r/gamedev bans self-promotion" and "r/indiegames bans AI-made games". r/gamedev's guidelines page allows sharing tools for developers and sends game promotion to weekly threads. For r/indiegames I found NO source, so the claim was removed and marked unknown.
- NOT VERIFIED: live Reddit sidebars (Reddit blocks scripts with 403). Read them by hand.
- NOT FOUND: a "no payment card data on free plans" rule from a search snippet. Not repeated.

## The API question (the user's main question)
- The Polish Quest website uses NO API. It reads the zip in the browser and builds text prompts. The user pastes them into an AI tool by hand. That is why it costs $0 to run.
- Genspark API: I tested the Genspark LLM proxy from this free account. It replied: "Free-plan credits can't be used with the Genspark API / LLM proxy" and spent no credits. So with a Free plan there is NO usable API. (The sandbox also showed `gsk me` = plan free, 100 credits.) The API opens only after a paid plan or bought credits.
- Free Genspark credits are 100 per day up to a lifetime limit (Help Center). They are not cash. They cannot turn into $25 by themselves. They only pay for chat/agent work inside Genspark's own windows.
- So the plan with no API money: (1) the site stays free and needs no AI. (2) Use the free daily credits in the normal Genspark chat to do the first review by hand (doc 02). (3) The first $25 has to come from a real sale or from you. Plus costs $24.99 a month ($19.99 a month if billed yearly at $239.99). Refund is 72 hours in most countries, one refund per customer.
- Warning: Genspark terms say commercial use "may be limited to paid tiers in the future" and the Help Center lists commercial use under Plus and Pro. Charging a client while still on Free is a grey area. Tell the client the roadmap was written with AI help.
- The prompts name "Claude Sonnet 5.5". The user needs their own access to an AI coding tool that offers it. Nothing in this repo or sandbox gives them one.

## NEXT (in order)
1. Get one real unzipped RPG Maker MV or MZ game from the user and run `node tools/real-zips.cjs`.
2. Ask the user to run prompts 1 to 4 once in their own AI tool on one small game and bring back what the AI broke. Fix the prompt text then. Run `node tools/lint-prompts.cjs`.
3. After sale 1: replace "about" fee numbers in docs/03 and the About view.
4. Set BUY_URL / CONTACT_URL in site/js/config.js only when the user has real links.
5. REVOKE the GitHub token that was pasted in chat (twice now). It was never saved into the repo or the git config here.
