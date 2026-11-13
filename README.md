# Polish Quest

Drop a game .zip (read in your browser, never uploaded). Get a code-checklist rating, ads guidance for your goal, and 26 ordered prompts for an AI coding tool.

- Site: `site/` (static, classic scripts). Functions: `functions/api/coach.js`, `rate.js` (Cloudflare Pages Functions).
- Run: `npm i && npm run dev` (wrangler pages dev). Put keys in git-ignored `.dev.vars`: `COARENA_API_KEY`, optional `COARENA_API_KEY_2`, `_3`.
- Config: `site/js/config.js` (contact, pay link, price).
- Tests: `node tools/lint-prompts.cjs`, `node tools/duo/shoot.cjs NAME`, `node tools/duo/zips.cjs`, `node tools/duo/adsflow.cjs`.
- Read `PROGRESS.md` first. Not deployed yet. The rating reads code only and does not judge fun. No sale is guaranteed.
