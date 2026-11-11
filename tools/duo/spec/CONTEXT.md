# Facts about the existing code (do not re-discover; these modules stay and keep working)
Static site in site/ (classic <script> files, global namespace window.PQ). Served by Cloudflare Pages; functions/ holds Pages Functions.
Kept logic modules (do NOT edit, do NOT delete): site/js/zip.js, detect.js, data.js, core.js, prompts-1.js .. prompts-4.js, prompts-fix.js, store.js, config.js.
They must be loaded in this order before your UI scripts:
  config.js, data.js, core.js, prompts-1.js, prompts-2.js, prompts-3.js, prompts-4.js, prompts-fix.js, zip.js, detect.js, store.js
Old UI files you may delete/replace: site/js/ui.js, view-*.js, app.js, css/style.css, index.html, privacy.html, and old art in site/assets/art, site/assets/icons (pixel art, owner dislikes it).
Fonts available: site/assets/fonts/inter-latin-wght-normal.woff2 (variable Inter, use font-family 'Inter' via @font-face), press-start-2p (do not use for text).

## API of the kept modules
- PQ.detect.scan(file, {onProgress(stage, frac)}) -> Promise<scan>; stages: list, manifests, read, think, done. Rejects with Error(message) in plain words.
- PQ.detect.sample() -> scan for the made-up example game (scan.isSample = true).
- scan = { name, nameSure, engineId, engineSure, engineWhy, engineAlts[], genreId, genreSure, genreAlts[], features{key:'found'|'maybe'|'none'},
           protect[] (files not to touch), memoryFile, entry, stats{files,read,bytes,skipped}, notes[], questions[], deviceId }
  scan.engineSure/genreSure false => the UI must ask the user (chips). Set scan.engineSure=true etc. after the user answers.
- PQ.ENGINES / PQ.GENRES / PQ.DEVICES = arrays of {id,label,...}. PQ.DEFAULT_DEVICE. engineId 'unknown' and genreId 'other' mean "not known".
- PQ.makeCtx(scan) -> ctx (ctx.name, ctx.engine.label, ctx.genre.label, ctx.device.label). PQ.MODEL = 'Claude Sonnet 5.5' (the AI coding tool the PROMPTS tell the user to use; keep as is).
- PQ.PROMPTS = 26 items {n, id, title, icon, rules[], goal(ctx) ...}; PQ.STEP_COUNT = 26.
  Titles: 1 Audit and memory file, 2 Structure and safety, 3 Smoke test and debug view, 4 Performance first, 5 Purpose and goal, 6 One-tap controls, 7 Phone layout and fullscreen,
  8 Smooth UI, 9 Notification log, 10 Combat feel, 11 Learn by playing, 12 Pointer tutorial, 13 Earned abilities, 14 Short goals, 15 Economy, 16 Variety, 17 VFX with purpose, 18 Sound and music,
  19 Story cinematics, 20 Dialogue, 21 Finisher moments, 22 Emotional payoff, 23 Retention, 24 Final performance check, 25 Final quality check, 26 Release pack.
- PQ.renderPrompt0(ctx) -> string (Ground Rules, paste first in every chat). PQ.renderPrompt(p, ctx) -> string (full prompt text, long, plain text with line breaks).
- PQ.FIXKIT = items {id,title,icon,blurb,params[{key,label,options[{id,label}]}]}; ids: bug, undo, resume, regress, softlock, savesafe. PQ.renderFix(item, ctx, params{kind..., note}) -> string.
- PQ.lint(text) -> [] when clean (check before copying).
- PQ.store.load() -> {v:1, scan, done:{n:true}, core}; PQ.store.save({scan, done, core}); PQ.store.clear(). localStorage on this device only.
- PQ.coverage(p, ctx) -> {ratio, tracked, found}: how much of a prompt the scan thinks already exists. ratio>=0.6 && tracked>=2 means "mostly there, check only".
- UI helpers you write yourself; the old PQ.ui is gone if you delete ui.js.

## Hard technical rules
- CSP (set in site/_headers AND in a <meta> in index.html; you MAY edit both): no inline <script>, no inline style="" attributes in markup, no setAttribute('style'). element.style.prop = ... in JS is fine.
  Allowed: scripts/styles/images/fonts from 'self', img data:, connect-src 'self' (needed for /api/coach). Keep object-src 'none', frame-ancestors 'none', form-action 'none'.
- No innerHTML with any text that came from the zip or the user. Use textContent / createElement. SVG: use createElementNS or static SVG files in site/assets.
- No emojis in the UI. No external CDN, no external fonts, no analytics.
- Three.js: write src3d/scene.js using `import * as THREE from 'three'` (installed). The harness runs `npm run build:3d` (esbuild, IIFE) -> site/js/scene.bundle.js. Expose window.PQ3D = { start(canvas), setMood(name), pulse() ... }. Must work with prefers-reduced-motion, must stop rendering when tab hidden, cap devicePixelRatio at 1.5, and fall back silently (no errors) when WebGL is missing.
- /api/coach: Cloudflare Pages Function in functions/api/coach.js, `export async function onRequestPost({request, env})`. Calls https://coarena.ai/api/v1/chat/completions with Authorization Bearer env.COARENA_API_KEY, model 'claude-fable-5-2', max_tokens <= 350, reasoning_effort 'low'. Input = {question, step, gameName, engine, genre} only, all trimmed to short lengths. NEVER send zip contents or file lists. Returns {reply}. On 401/402/429/5xx/missing key/network error: return {reply: <helpful canned answer for that step>, offline:true} with HTTP 200 so the UI never breaks.
  The free key has only 5 dollars per day shared by every visitor: keep prompts tiny, and make the site fully usable with the canned answers.
- Privacy honesty: Coarena stores prompts it receives. The privacy page and the coach box must say plainly: "Your zip never leaves your device. Only a short question you type to the coach is sent to an AI service (Coarena)."
- Accessibility: body text >= 16px, contrast >= 4.5:1, buttons >= 44px tall, visible focus ring, prefers-reduced-motion respected, all controls keyboard reachable.

## Test contract (the screenshot robot depends on these; keep them)
Robot opens / on 1280x720 and 390x844, then:
 1. screenshot of first screen.
 2. clicks [data-t=sample] (the "try the example game" button on the first screen). Screenshot.
 3. up to 4 times clicks [data-t=next] (the main forward button on each screen) with a screenshot after each.
 4. visits #overview (all-steps map), #fix (fix kit), #privacy (privacy/trust), each screenshot.
 5. visits #step/1; if an element [data-t=mascot] exists, clicks [data-t=coach-open] (opens the coach question box) and screenshots.
 The robot also reports: console errors, failed requests, text under 14px, number of distinct colors, horizontal overflow, whether a <canvas> exists and window.PQ3D exists, window.PQ.guide exists (hand pointer API), and [data-t=mascot] exists.
 Robot mocks POST /api/coach with {reply:'MOCK: ...'}.
Routing: hash routes. '' or #home, #scan (confirm what was found), #step/N (N=0 for ground rules, 1..26), #overview, #fix, #privacy, #done.
