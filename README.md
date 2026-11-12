# Polish Quest
Website for indie game developers. Drop your game zip (read in your browser, never uploaded) and get ordered prompts for your AI coding tool, one screen at a time.

- Site: `site/` (static) plus `functions/` (Cloudflare Pages Functions, the coach API is NOT written yet).
- 3D scene: `src3d/scene.js`, bundle with `npm run build:3d` into `site/js/scene.bundle.js`.
- Local run: `npx wrangler pages dev site --port 3000` (needs `.dev.vars` with COARENA_API_KEY, git-ignored).
- Agents harness: `tools/duo/` (planner and worker, 90% budget stop, screenshot robot).
- Status, report and next steps: `PROGRESS.md`, `docs/06-REBUILD-REPORT.md`, `docs/07-PLANNER-FINAL-PLAN.md`, `docs/08-NEXT-CHAT-PROMPT.md`.
