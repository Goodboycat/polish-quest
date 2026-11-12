# 3D scene notes (task f1_r2)

- Source: `src3d/scene.js`. Build: `npm run build:3d` -> `site/js/scene.bundle.js`. `index.html` already loads the bundle, so it was not changed.
- The task asked for Three.js from jsdelivr / unpkg. That conflicts with the hard rules (CSP `script-src 'self'`, no external CDN), so Three.js is bundled from the installed `three` package. Nothing requests `/js/vendor/`.
- Pixel ratio is capped at 1.5 (hard rule), not 2.
- `window.PQ3D` exists as soon as the bundle runs: `start(canvas)`, `setMood(m)`, `setProgress(p)`, `pulse()`. None of them throw. The scene starts itself on DOMContentLoaded with the first `<canvas>` if the app did not call `start`.
- `body.no3d` is set until the first frame has rendered, and stays set if WebGL is missing (the canvas is hidden).
- The scene listens to `pq:route` and sets the mood. `setMood` ignores repeats, so it is safe if the app also calls it.
- Canvas sizing is set from JS (`element.style`), so it fills the screen even if the CSS is missing.
