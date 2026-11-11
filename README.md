# Polish Quest
Static website for indie game developers. Drop your game zip (it is read in your browser, never uploaded) and get ordered prompts for your AI coding tool.

- Site: `site/` (pure static, no external requests). Open `site/index.html` or upload the folder contents to Cloudflare Pages.
- Download: `dist-zip/polish-quest-site.zip`
- Business docs: `docs/`
- Progress and next steps: `PROGRESS.md`
- Tests: `python3 tools/make-fixtures.py && node tools/e2e-func.cjs`; real zips: `node tools/real-zips.cjs file.zip`
