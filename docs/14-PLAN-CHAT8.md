# Chat 8 brainstorm and plan (Fable 5.2 planner, 2026-11-13)

Written by the model from the owner notes. Unverified advice, no sales or market claims.

# Polish Quest: planner brief

## Blunt read first

The site sells the wrong product. The repo offer says "I play your build and send you 10 fixes" (a human review). The notes say devs rejected that and that the one sale came from the AI plan with one prompt per task. Until the offer card, sample and buy link describe the plan, polish work will not produce $25.

Two things I cannot verify:

- **The sale.** The notes say one person paid; the repo says "NO MONEY MADE". The owner must confirm which is true before any quote or "first buyer" line appears.
- **The traffic.** The site is "STILL NOT DEPLOYED", so the 100 and 500 visits went somewhere I cannot see.

## Brainstorm by note

| # | What it means for the site | Concrete change | Effort |
|---|---|---|---|
| 1 | There is no proof and no visible output. The free tool must carry the sale. | Replace the made-up #sample with a real plan from the owner's own game. Add no testimonials until real ones exist. Asking the people who passed is an owner action. | M |
| 2 | Devs want to do it themselves, so a done-for-you review is the wrong shape. | Rewrite the offer card, #sample and the copied report text to say "a plan you run yourself". Remove "I play your build" unless the owner keeps it as a separate offer. | S |
| 3 | The product is an ordered task list where each task is one prompt with a done-check. | The offer card states what you get, the turnaround and the price. The owner must time 3 orders and test the prompts in two AI tools (owner action). | S site, L owner |
| 4 | Anything in site/js is public. | Move the master prompts out of site/. Fulfil orders by hand first, and move to server-side later. | M |
| 5 | The 26 prompts are already exposed in the public repo and its history. | Make the repo private or rewrite its history. Extend the lint so it fails if master text appears in site/ or in the sample. | S-M |
| 6 | One sale is a signal. Trust and reach are the gaps. | Add a testimonial slot that stays hidden until a real, permitted quote exists. Outreach is an owner action. | S |
| 7 | The buyer's pain is the headline. | First screen reads: "Stuck on how to make your game better? Get a step-by-step plan with a ready prompt for every task." Track visits to sales. | S |
| 8 | "I don't know if I should" is about risk. | Offer a free first slice (diagnosis plus the first 3 tasks), show the sample on the page, and add a guarantee only if it will be honoured. Asking the hesitaters is an owner action. | M |
| Summary | All of the above, with no price testing yet. | Keep $25 fixed. Count visits and orders honestly. | S |

## Owner decisions

- **D1. The 26 steps.** The free tool currently gives the prompts away. The options are:
  - a) Hide all prompt text and keep only the step names, the reasons and the score free.
  - b) Keep the generic prompts free and sell only the tailored plan.

  I recommend (a). The notes call the prompts the thing clients pay for, and the planner doc is still the deliverable. The cost is that the free tool becomes diagnosis only.
- **D2. Repo privacy.** Make the repo private (if Cloudflare Pages can still build from it), or keep it public and purge the history. In both cases, treat the prompts as already leaked.
- **D3. Guarantee.** Can you refund $25 through PayPal, every time, without arguing? If yes, the wording is: "If the full plan does not give you at least 5 tasks you would use, email me within 7 days and I refund you." If you are unsure, do not publish a guarantee.
- **D4. Free slice capacity.** The slice is hand-made at first. Decide how many you can do per week and the turnaround, and print both on the page.
- **D5. Sample game.** Decide which of your own games is used for the public sample.
- **D6. Buyer quote.** Confirm the sale is real and get written permission to quote it. Otherwise there is no quote.
- **D7. Hosting.** Choose your own Cloudflare account or Genspark hosting. This has been blocking deployment since chat 6.
- **D8. Security.** Revoke the GitHub token and rotate the four Coarena keys now. Click the paypal.me link to verify it opens correctly.

## Plan (owner's order, with payment changes inserted)

### 0. Pre-work: privacy

- **0.1 (S)** Rotate the keys and the GitHub token (D8).
  - Done-check: the old keys are rejected and the secrets scan is clean.
- **0.2 (M)** Move prompts-*.js out of site/ into private storage. The site keeps only step names, the chapter, a one-line reason and a done-check (per D1).
  - Done-check: a grep of site/ for distinctive master phrases returns 0 hits; the lint fails if one is added back; the 4 test zips still reach #rating.
- **0.3 (S-M)** Make the repo private or purge its history (D2).
  - Done-check: a logged-out browser cannot read any master prompt at any commit.

### 1. Skipped art

Follow the art rule: procedural and realistic, 2-3 variants side by side, screenshot them, the owner picks, then cut PNGs.

- **1.1 (M)** Six chapter icons: Foundation, Controls and screens, Game feel, Depth and sound, Story, Ship it.
  - Done-check: a variants screenshot is saved in docs; 6 PNGs are cut; they are legible at 32px on a 360-wide screen.
- **1.2 (M)** A picture for the offer card that shows what the buyer receives: a plan page with a task, a prompt and a done-check.
  - Done-check: variants are screenshotted; the picture never overlaps the price or the text at any of the 4 sizes.
- **1.3 (L)** A 3D gem with one facet group per area (7), each lit by that area's score. It sits in the right gutter on desktop and is hidden or static on phone.
  - Done-check: a Mark wrong correction visibly changes the lighting; there is zero overlap with the text column; it is no longer black on black.
- **1.4 (S)** Rewrite the offer card for the plan product: what you get, turnaround, $25, and links to the sample and the free slice. The made-up sample stays clearly labelled until 4.3 replaces it.
  - Done-check: no "I play your build" text remains unless the owner keeps that offer.

### 2. Overview tiles show step names

- **2.1 (M)** Show one chapter at a time with step names and progress. Give focus a style distinct from "done". The footer always shows the next undone step on both desktop and phone.
  - Done-check: a beginner can read what step 14 is without tapping; the footer is identical on desktop and phone; the page fits one screen at all 4 sizes.

### 3. Pip never covers content

- **3.1 (M)** Dock Pip in the header on phone and reserve a gutter for it on desktop. Add a robot overlap test that checks Pip's box against the text, buttons and price on every screen and size.
  - Done-check: 0 intersections across all screens at 4 sizes.

### 3b. First screen

- **3b.1 (S)** Add the pain headline from note 7, with one primary action ("Drop your game zip") and one quiet link ("See a sample plan"). Keep the "reads code only, nobody played it" note visible. Add no quote without D6.
  - Done-check: the headline, the action and the sample link are all visible without scrolling at 360x640.

### 4. Test the functions

- **4.1 (S)** Run `wrangler pages dev` with a local .dev.vars file that is gitignored. Exercise coach.js and rate.js with a good request, a bad request, a missing key and the rate limit.
  - Done-check: the functions return the expected statuses; no key appears in any response or in the bundle; 0 console errors.
- **4.2 (M)** Build the free slice flow. After the rating, show "Get your diagnosis and first 3 tasks free". It opens a prefilled email with the game name and the report, and shows the turnaround and the weekly limit (D4). Fulfilment is manual from the private prompts.
  - Done-check: the flow works on desktop and phone; the page says a person sends the slice and when.
- **4.3 (M, mostly owner)** Run the full process on the owner's own game (D5) and publish the result as #sample: the diagnosis and the full task list, with 3 tasks showing their full prompts. Add the owner's name and the note "for use on this game only".
  - Done-check: the lint finds no verbatim master text; the "made-up" label is removed only because the sample is now real; the owner has timed the run and recorded it.
- **4.4 (S, needs D3)** Add the guarantee line, or leave it out.

### 5. Deploy

- **5.1 (M, needs D7)** Deploy to Cloudflare Pages with the keys stored as host environment secrets.
  - Done-check: the live URL passes the robot run; both functions answer; it works on a real phone; the PayPal link opens at $25; the mailto link works.
- **5.2 (S)** Turn on Cloudflare Web Analytics and keep a manual log of orders.
  - Done-check: visits are visible. The owner records visits, slices requested and sales each week. No invented numbers go on the site.

### 6. Re-score

- **6.1 (S)** Take fresh screenshots of the live site and run the Fable review. The target is MONEY-READY 7 or higher, with defects 1 to 3 from review 3 closed.
  - Done-check: docs/13 is written and PROGRESS is updated with the honest gaps.

## Owner actions outside the site

- Ask the buyer what convinced him and what the plan was missing.
- Ask the Reddit hesitaters: "What would you need to see to feel sure?" Paste their replies into docs.
- Do 3 free slices, time them, and ask each person whether they would have paid.
- Keep the price fixed until a few hundred visits have seen the new first screen.
