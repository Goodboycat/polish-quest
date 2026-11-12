# 8. Prompt for the next chat (secrets are placeholders here on purpose; the chat reply has the Coarena keys)

You are continuing the Polish Quest rebuild. Repo: https://github.com/Goodboycat/polish-quest (branch main). Work in /home/user/webapp.
Read, in order: PROGRESS.md, docs/06-REBUILD-REPORT.md, docs/07-PLANNER-FINAL-PLAN.md, tools/duo/spec/REQUIREMENTS.md and CONTEXT.md.

Owner goal: Polish Quest is a website that helps indie game developers finish their game. It should earn the owner the first 25 US dollars. It reads a game zip in the browser and gives ordered prompts for an AI coding tool.
Owner complaints about the old site: not professional, too much text, not beginner friendly, pixel text hard to read, everything shown at once instead of one full screen at a time, too many colors, looked dead. Owner wants: Three.js, a hand-pointer visual tutorial (not reading), a talking mascot that never pauses the page, the free Coarena API used inside the site (server side only), step-by-step feel. Owner allows deleting and rebuilding anything.
Rules: no emojis in UI; never put a key in the repo or browser code; never invent facts or sales numbers; be honest about what is unverified.

Two agents, both claude-fable-5-2 ("Fable 5.2"), via OpenAI-compatible base https://coarena.ai/api/v1 (NOT /api; that returns HTML):
- PLANNER key: <COARENA_KEY_PLANNER>  (thinks, uses Playwright screenshots, analyses, orders)
- WORKER key: <COARENA_KEY_WORKER>  (writes the files)
Put them in /home/user/.coarena.env as COARENA_KEY_PLANNER=... and COARENA_KEY_WORKER=... (chmod 600). GitHub token for pushing: <PASTE A FRESH GITHUB TOKEN HERE; revoke the old one>. Push with a one-off URL, never store it in the remote.
Budget: each key is $5. Stop and push when a key reaches 90% ($4.50). Coarena's /v1/limits shows usd_per_day 5, resetting 00:00 UTC, so it may be a daily allowance. Check GET https://coarena.ai/api/v1/limits with each key first and tell the owner what you see. tools/duo/ledger.json holds the cumulative spend from the last chat (planner $3.84, worker $4.44); reset it only if limits shows a fresh allowance.

Setup (about 3 minutes): clone the repo; `npm i`; Playwright lives outside the repo: `mkdir -p /home/user/tools-env && cd /home/user/tools-env && npm i playwright esbuild three && npx playwright install chromium && sudo npx playwright install-deps chromium`. The harness is tools/duo (node tools/duo/duo.mjs resumes from state.json; node tools/duo/shoot.cjs NAME takes screenshots; it needs shoot.cjs's Playwright path /home/user/tools-env). Optional: `curl -fsSL https://atomicagent.io/install | sh` (atomic-agent 0.7.0); its fusion config is in docs/06 but it has no per-key stop, so the duo harness is the safer driver.

Do next, in this order (details and exact CSS in docs/07):
1. Rewrite the hand pointer (js/guide.js, css/guide.css): visible hand, ring, styled label, stops on route change.
2. Create functions/api/coach.js (Cloudflare Pages Function) calling Coarena with env.COARENA_API_KEY, max_tokens small, canned fallback with HTTP 200; test it with `wrangler pages dev site` and a .dev.vars file (git-ignored).
3. Fix scan rows, overview tiles (must fit one screen), phone layout, step screens.
4. Make the offer block render when PQ_CONFIG.BUY_URL / CONTACT_URL are set; ask the owner for real links. Do not fake them.
5. Re-run the robot, view the screenshots yourself, and confirm zip drop still works with 3 test zips (python3 tools/make-fixtures.py builds /tmp/dt/*.zip).
6. Update PROGRESS.md and docs, commit, push, and tell the owner to revoke the GitHub token.
Do not call the site finished until you have looked at the screenshots and the hand pointer visibly points at a button. Do not deploy until the owner picks a path (own Cloudflare account or Genspark hosted). Also tell the owner honestly: nothing yet guarantees any sale; the plan in docs/07 is untested.
