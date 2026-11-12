# 7. Planner final plan (written by Fable 5.2, planner key, 2026-11-12)

## VERDICT
SCORE 6/10
- **Good:** the desktop home is clean and professional. One accent, Inter, concise copy, a tasteful gem, and Pip does not block the page. The robot reports 0 errors, 6 colors and no small text.
- **Broken, hand pointer:** the hand is black on a dark background and has no ring. Its label is unstyled text at the left edge ("Looks right? Go" at x=8, y=682). The stale "1. Copy this" label stays on #overview. Nothing shows on home. The owner's main request is still unmet.
- **Broken, free AI:** `functions/api/coach.js` does not exist, so the coach always returns canned tips.
- **Broken, layout:**
  - Scan rows run together ("NameMoon Cat Runner"), and "Change" wraps on phone.
  - Overview tiles are about 180x64px and overflow the screen. Done, current and upcoming look the same.
  - Phone content is stuck to the top with a large empty gap below it.
- **Broken, money:** `BUY_URL` and `CONTACT_URL` are empty, so no offer renders anywhere. The site cannot earn today.

## NEXT TASKS
1. **Rewrite the hand pointer** (`js/guide.js`, `css/guide.css`; make sure `guide.css` is linked in `index.html`).
   - Elements, all appended to `body`:
     - `.pq-hand`: `position:fixed; left:0; top:0; z-index:60; pointer-events:none; width:40px; height:40px`. SVG hand with fill `#F2F4F8` and stroke `#0B0D12` 1.5px.
     - `.pq-ring`: `position:fixed; pointer-events:none; border:2px solid #FFC53D; border-radius:14px`.
     - `.pq-label`: `position:fixed; pointer-events:none; background:#FFC53D; color:#0B0D12; font:650 14px/20px Inter; padding:6px 10px; border-radius:8px; white-space:nowrap`.
   - Positioning:
     - Find the target with `document.querySelector('[data-t=…]')` and read `getBoundingClientRect()`.
     - Hand: `transform:translate(r.left+r.width/2-8px, r.bottom-6px)` with `transition:transform .5s`. An inner element bobs with `translateY` 0 to 6px over 1s, infinite.
     - Ring: target rect grown by 6px on each side.
     - Label: 8px above the ring, clamped to 8px from the viewport edges.
     - Reposition on `resize`.
   - Behaviour:
     - If the target is missing, retry 10 times at 200ms, then skip it.
     - `stop()` hides all three elements. Call it on every `pq:route` before starting the tour for the new route.
     - Advance on target click or after 4s.
   - Tours (unchanged from the spec):
     - home: `[data-t=zip]` "Drop your zip here", `[data-t=sample]` "Or try an example"
     - scan: `[data-t=next]` "Looks right? Go"
     - first step: `[data-t=copy]` "1. Copy this", `[data-t=next]` "2. Done? Tap here"
     - `[data-t=mascot]` "Stuck? Ask me"
   - Add `data-t=zip` to the home primary button if it is missing.

2. **Create the coach server function** (`functions/api/coach.js`, Cloudflare Pages `onRequestPost`; check the fetch in `js/mascot.js`).
   - Read JSON `{q, step, engine}`. Trim `q` to 200 characters. Reject an empty `q` with 400.
   - `fetch('https://coarena.ai/api/v1/chat/completions')` with header `Authorization: Bearer ${env.COARENA_API_KEY}`.
   - Body: `model:'claude-fable-5-2'`, `max_tokens:160`, and a system message: "You are Pip, a coach for beginner indie game devs. Answer in at most 3 short plain sentences."
   - Return `{reply}`. On any error return `{reply:null}` with status 200.
   - In `mascot.js`: POST to `/api/coach` with an 8s `AbortController`. On `null` or failure show the canned tip.
   - The key must not appear in any site file.

3. **Fix the scan rows** (`js/screens-steps.js` or wherever the scan screen lives, `css/screens.css`).
   - `.scan-row{display:grid; grid-template-columns:136px 1fr auto; gap:16px; align-items:center; min-height:52px; border-bottom:1px solid #2A3040}`
   - Label: `.muted`, 14px. Value: 17px, weight 600, `overflow-wrap:anywhere`. "Change": `.link`, `white-space:nowrap`.
   - Phone (max-width 600px): `grid-template-columns:104px 1fr auto`.
   - Wrap the rows in `.card` with padding `8px 20px`.

4. **Fix the overview tiles and progress count** (`js/screens-more.js`, `css/screens.css`).
   - `.tiles{display:grid; grid-template-columns:repeat(9,48px); gap:8px}`. Phone: `repeat(7,1fr)`, 4 rows, with a 44px minimum height.
   - `.tile{height:48px; padding:0; text-align:center; border-radius:12px; font-weight:600}`
   - States:
     - Done: `border:1px solid #FFC53D; color:#FFC53D`, with a "✓" before the number.
     - Current: `background:#FFC53D; color:#0B0D12`.
     - Upcoming: `background:#151923; color:#A9B1C3; border:1px solid #2A3040`.
   - Remove the stray light border on tile 13 (probably a focus or hover style). Keep the focus ring only on `:focus-visible`.
   - Add a muted legend line under the H1: "Filled = you are here. Outlined = done."
   - Tile 0 does not count toward the 26. The top progress line is done/26.
   - Everything must fit in 100dvh with no scroll.

5. **Fix phone layout** (`css/app.css`, `css/pip.css`).
   - At max-width 600px, the content column is `display:flex; flex-direction:column; justify-content:center; min-height:calc(100dvh - 56px - var(--actions-h,84px))`.
   - The gem canvas sits in the top 40% of the screen at opacity .35. Give the content `padding-top:120px` on home so the headline is not over the gem.
   - Top bar links: `gap:12px; font-size:14px`.
   - Pip sits at `bottom:calc(var(--actions-h) + 12px)`. Set `--actions-h` from the real actions height on each `pq:route`. Ground rules has three stacked items and needs this.

6. **Fix step screens** (`js/screens-steps.js`, `css/screens.css`).
   - Numbered lines: `.num{display:inline-grid; place-items:center; width:28px; height:28px; border-radius:50%; border:1px solid #FFC53D; color:#FFC53D; font:650 14px Inter; margin-right:12px}`. Rows have a 12px gap.
   - "Read the prompt": a `.link` inside `.actions`, after the buttons, with no indent.
   - Step 0 shows only the lead, with no 1-2-3 list.
   - After copy: Copy reads "Copied" and becomes `.btn-ghost`; Next becomes `.btn-primary`.
   - `.btn-ghost{border:1px solid #A9B1C3; color:#F2F4F8}` for contrast.

7. **Make the offer block always reachable** (`js/config.js`, `js/screens-more.js`).
   - Keep the rule: render the card only when a URL is set.
   - Add a top comment in `config.js`: "Set BUY_URL, CONTACT_URL, REVIEW_PRICE to turn on the offer".
   - With `?offer=1` in the URL, render the card with placeholder `#` links so the owner can preview it.
   - Check that the card appears on #done, at the bottom of #overview (below the tiles, within 100dvh), and as the one line on #fix.
   - Pip's line at step 5: "Want a human to check it? See All steps."

8. **Tone down the gem** (scene source and `scene.bundle.js`, only if budget is left).
   - Desktop gem: about 360px across, centered at 72% of the width.
   - Draw the edge lines once (`EdgesGeometry`, opacity .6).
   - `quiet` mood at opacity .4.
   - Keep the gem out of the bottom-right 360x420px area while the coach panel is open.

## APPEAL PLAN
- One screen holds one action with one yellow button. The user never has to choose between two things.
- The hand points at the exact button with a label of 5 words or fewer, so nothing has to be read to get started.
- "Try the example game" lets the user see the whole flow before trusting the site with their own zip.
- The scan screen names their engine and game type back to them. This shows the prompts are for their game and are not generic.
- Ground rules come first, with the line "It stops the AI from breaking your game". This addresses a beginner's biggest fear.
- Each step has the same three lines (copy, paste, play). The repetition builds confidence.
- The gem visibly gets shinier and the top line fills, so progress is felt without reading.
- The Fix Kit is always one tap away, so a broken build is not a dead end.
- Pip answers "What do I do here?" in 3 sentences without stopping the flow.
- Progress is saved. "Continue {name}, step {n}" brings the user back the next day.

## FIRST 25 DOLLARS
- **What to sell:** one human review, as already written in the offer block: "I play your build and send you the 10 fixes that matter most, as ready-to-paste prompts."
- **Price:** 25 US dollars, so a single sale meets the goal. Set `REVIEW_PRICE:'$25'`. Whether indie devs will pay this is unverified. If there are clicks but no sales, test a lower price.
- **Where:** a hosted checkout link (for example Gumroad, Lemon Squeezy or a Stripe Payment Link) as `BUY_URL`, and an email or form link as `CONTACT_URL`. I have not verified fees or whether these services are available in the owner's country.
- **Owner must do by hand:**
  - Create the checkout product and paste both URLs into `js/config.js`.
  - Set `COARENA_API_KEY` in the host's environment settings.
  - Deploy on a host that runs `functions/` (Cloudflare Pages is assumed).
  - Actually do each review: about an hour of playing the build and writing 10 prompts.
- **Getting visitors:** the site has no traffic of its own. The owner must post it where beginner devs who use AI tools gather (itch.io community, game dev subreddits, Discord servers). An honest post with a short screen recording of the example game flow is the best format. Each community's self-promotion rules need checking first.
- **Trust:** keep the tool free. Do the first 2-3 reviews free in exchange for permission to show the before and after. Use no fake reviews and no fake urgency.
- **Unverified:**
  - That Coarena's free tier stays free, and what its rate limits are.
  - That the model id `claude-fable-5-2` works.
  - Demand at 25 dollars.
  - The coach function, which has never run.
