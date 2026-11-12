**Product promise:** "Drop your game. Get the next prompt. Paste. Repeat." One decision per screen, one accent-colored button per screen.

**Palette (dark, 1 accent only):**
- bg `#0B0D12`
- surface `#151923`
- line `#2A3040`
- text `#F2F4F8`
- muted `#A9B1C3`
- accent `#FFC53D` (text on accent `#0B0D12`)
- No red, green or blue anywhere. Errors use text color plus an accent border.

**Type:** Inter variable only (`@font-face` from `assets/fonts/inter-latin-wght-normal.woff2`).
- h1: 44/48 weight 750 (phone 30/36)
- h2: 24/30 weight 650
- body: 17/26
- small: 14/20 (nothing below 14px)
- kicker: 14px, uppercase, letter-spacing .08em, accent

**Spacing and shape:** 8px grid. Radius 14px. Buttons 52px tall, radius 12px. Focus ring `2px solid #FFC53D`, offset 3px.

**Layout:**
- Every screen is 100dvh with no page scroll; only inner panels scroll.
- Top bar, 56px: wordmark "Polish Quest" on the left; links "All steps" (#overview), "Fix Kit" (#fix), "Privacy" (#privacy) on the right.
- A 3px accent progress line sits under the bar (done/26).
- Content column: max 560px, left aligned at `max(24px, 8vw)`, vertically centered.
- The 3D canvas is fixed behind everything. On desktop the gem sits in the right half. On phone it sits top-center at opacity .35.
- The actions row sits at the bottom of the column. On phone it is fixed to the bottom, full width.

**Flow:** home -> (scanning, inline) -> #scan -> #step/0 -> #step/1 .. #step/26 -> #done.

**Screens (exact copy):**
- **home**
  - Kicker: "For indie game developers"
  - H1: "Make your game feel finished."
  - Lead: "Drop your game's zip. Get 26 copy-paste prompts for your AI coding tool, in the right order."
  - Primary button: "Choose your game .zip" (the whole screen also accepts a dropped file)
  - Ghost button [data-t=sample]: "Try the example game"
  - Muted line: "Your zip never leaves your device."
  - If progress is saved, the primary becomes "Continue {name}, step {n}", with a ghost "Start over".
  - While scanning, the buttons are replaced by a progress bar and one line per stage: "Listing files", "Finding the engine", "Reading the code", "Working out the plan", "Ready".
- **scan**
  - Kicker: "Check"
  - H1: "Is this your game?"
  - Four rows (Name, Engine, Type, Weakest device), each showing the value and a "Change" button that opens chips.
  - Unsure rows open automatically with "I am not sure. Pick the closest."
  - Next [data-t=next]: "Yes, start"
- **step/0**
  - Kicker: "Before step 1"
  - H1: "Ground rules"
  - Lead: "Paste this first in every new chat. It stops the AI from breaking your game."
- **step/N**
  - Kicker: "Step N of 26"
  - H1: the prompt title
  - Three numbered lines: "1 Copy the prompt", "2 Paste it into your AI tool and let it finish", "3 Play your game, then come back"
  - Buttons: "Copy prompt" [data-t=copy], "Done, next step" [data-t=next], text link "Read the prompt" (opens a scroll panel)
  - Copy is the accent button until copied; then it reads "Copied" and Next becomes the accent button.
  - If coverage says mostly there, show the tag: "Your game mostly has this. The prompt only checks."
- **done**
  - H1: "All 26 done. Ship it."
  - Followed by the offer block.
- **overview**
  - H1: "All steps"
  - A grid of 27 numbered tiles (0-26) showing done, current, or upcoming; tap to jump.
- **fix**
  - H1: "Something went wrong?"
  - Six buttons, one per Fix Kit item. Tapping one shows its options as chips plus "Copy fix prompt".
- **privacy**
  - H1: "Your game stays with you."
  - Three short lines, including verbatim: "Your zip never leaves your device. Only a short question you type to the coach is sent to an AI service (Coarena)."

**3D scene (`window.PQ3D`):**
- One low-poly gem (flat-shaded icosahedron, `#1C2230`) with accent edge lines and about 180 dust points.
- It gets polished as the user advances: `setProgress(0..1)` raises the shine, the edge glow, and the dust orbit.
- Moods:
  - `home`: slow spin, rough
  - `scan`: fast spin, dust pulled inward
  - `step`: calm
  - `done`: bright, with a burst
  - `quiet`: dim, for overview/fix/privacy
- `pulse()` gives a short scale pop, used on copy and on next.
- Fallback when WebGL is missing: `body.no3d` shows a CSS radial accent glow.

**Hand pointer (`PQ.guide`):**
- API: `point(sel,{text,ms})`, `sequence([{sel,text}])`, `stop()`.
- A fixed SVG hand glides to the target and bobs. The target gets an accent ring and a small label (max 5 words).
- `pointer-events:none`, so it never blocks.
- It advances when the user clicks the target or after 4s.
- First-visit tours, remembered in localStorage `pq_tour`:
  - home: zip button "Drop your zip here", sample "Or try an example"
  - scan: next "Looks right? Go"
  - first step: copy "1. Copy this", next "2. Done? Tap here"
  - mascot: "Stuck? Ask me"
- The tour stops on route change.

**Mascot "Pip" ([data-t=mascot]):**
- An inline SVG gem-creature (dark body, accent outline, two eyes, a mouth that moves while talking).
- Fixed bottom-right, 72px on desktop; 56px on phone, placed above the actions bar.
- Speech bubble: max 260px, `aria-live=polite`, 1-3 short lines per screen, auto-advancing every 4.5s and then fading.
- No backdrop and no focus trap; the page stays fully usable.
- A "Hide" button shrinks Pip to a 44px dot (remembered).
- Clicking Pip [data-t=coach-open] opens the coach panel (320px, non-modal):
  - three quick chips: "What do I do here?", "The AI broke my game", "Can I skip this?"
  - an input (max 200 characters) and "Ask"
  - the reply
  - the privacy sentence, verbatim
- The coach posts to `/api/coach`; any failure shows a canned tip.

**Offer block (monetisation):**
- Shown only when `PQ_CONFIG.BUY_URL` or `CONTACT_URL` is non-empty.
- Card title: "Want a human to check your game?"
- Text: "I play your build and send you the 10 fixes that matter most, as ready-to-paste prompts."
- Primary: "Get a review, {REVIEW_PRICE}" -> BUY_URL
- Ghost: "Ask first" -> CONTACT_URL
- Shown on #done, at the bottom of #overview, and as one line on #fix ("Still stuck? A human can look.").
- Pip mentions it once, at step 5.
- No fake urgency and no fake reviews.

**Why beginners stay:** they never see 26 things. They see one step, one button, a hand showing where to tap, and a helper to ask.

**Shared code contract (`PQ.app`, built in t1):**
- `el(tag, attrs, children)`: `attrs.text` sets textContent, `attrs.class`, `attrs.on = {click: fn}`, `attrs.data = {t: 'next'}`; any other key becomes an attribute.
- `screen(name, fn(root, param))`: registers a screen.
- `go(hash)`, `state {scan, done, core}`, `save()`, `ctx()`, `toast(text)`, `copy(text)` -> Promise<boolean>.
- `frame(root, {kicker, title, lead})` -> `{body, actions}`.
- After each render the app dispatches `document` CustomEvent `'pq:route'` with detail `{name, param}`.
- CSS classes: `.btn`, `.btn-primary`, `.btn-ghost`, `.link`, `.chip` (`aria-pressed`), `.card`, `.kicker`, `.lead`, `.muted`, `.tag`, `.stack`, `.row`, `.actions`, `.panel`, `.field`, `.tiles`, `.tile`, `.bar`, `.hidden`.
