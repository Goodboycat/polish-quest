Read PROGRESS.md (top block, chat 10), docs/20-FABLE-REVIEW-7.md, docs/18-FABLE-REVIEW-6.md. Run "sudo npx playwright install-deps chromium" or chromium will not start.
Live site: https://polish-quest-sigma.vercel.app (Vercel, account goodboykitty2-6858). Redeploy with: cd /home/user/webapp && VERCEL_TOKEN=... npx vercel --prod --yes (token goes in /home/user/.coarena.env as VERCEL_TOKEN, never in the repo).
Order:
1) Bright lit gold rotating shape on every screen (home, kind, assets, overview), about 120px on phone. Put a simple gold line picture in each #kind card; keep cards one height; selected card gold border plus tick, no shift.
2) Rating: "Weak" accent colour with diamond, "Needs work" muted; goal row on one line as a chip; "See the plan" and "Report and AI opinion" same quiet white link on one row. Phone: move the Start here hand 12px above the button.
3) #plan checkout: state delivery time, refund line and where the buyer sends the game, ONLY with words I give below. Do not invent any.
4) Add a small playable browser game made with Three.js and CC0 or MIT assets (Kenney or Quaternius), shown on the site as a "made with these free assets" example, with an ASSETS.md list of every asset and licence. Test it in the browser.
5) Apply my hide-prompts decision (tools/hide-decision.json) and move the 26 prompts out of site/ if yes.
6) Planner re-score with fresh screenshots of the live site (max 8 images per request). Rate out of 10 and give the next prompt. Push after every task.
My decisions: hide prompts = ; repo private = ; guarantee = ; sample game = ; sale is real and quotable = ; delivery time = ; who writes the plan = .
