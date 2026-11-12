# Fable 5.2 screenshot review (2026-11-12, shots: v3)

SCORE: 6
PROFESSIONAL: 6  BEGINNER: 6  ALIVE: 6  MONEY-READY: 5

TOP FIVE DEFECTS:
1. Rating screen, phone (phone-04-goal-picked): the pointing hand and its "Then start the steps" label sit on top of the "Matters most first" chips. The third chip is hidden and the Pip "Hide" link collides with the chip row. Fix: on phone, anchor the hand inside the sticky button bar (or drop the label and only pulse the button). Never let the guide overlap content. Reserve bottom padding equal to the button bar plus the mascot's height.
2. Rating screen, desktop (desktop-04-goal-picked): the layout is broken and crowded.
   - The focus ring around "Start the steps" is a misaligned, oversized box hanging below the button. Fix: bind the ring to the button's bounds.
   - The hand overlaps the "Scored from code only" caption. Fix: move it clear of the text.
   - The icosahedron wireframe runs behind the bars and numbers and hurts readability. Fix: hide or strongly dim the 3D object on this screen, or put the bars on a solid panel.
   - This screen breaks the one-idea-per-screen rule: ring, seven bars, legend, chips, two buttons and a disclaimer all at once. Fix: show the ring, the verdict and the top three gold bars; put the rest behind "See all 7".
3. Rating content (both sizes): the scores do not look credible, and the priorities contradict the legend.
   - Four of seven bars read exactly 5.0 and the total is 5.0. That reads as a placeholder, not an analysis.
   - "Runs smoothly" is the lowest bar (1.3) and is grey, meaning not important, yet "4. Performance first" is the first chip under "Matters most first".
   - Fix: under each bar show the evidence, e.g. "Found: saves, audio. Missing: touch controls, tutorial." Make the chips follow one visible rule (lowest score times goal weight).
   - Fix: rename the headline from "Moon Cat Runner: Getting there" to something honest such as "Code checklist: 5.0 of 10", so nobody thinks the game was played.
4. Goal screen (desktop-03-next-1, desktop-08-goal, phone-08-goal): the flow and selection state are unclear.
   - "Free, with ads or purchases" appears pre-highlighted before the user chooses. The hand points at it, which biases the pick.
   - There is no Continue button, only "Back". On phone the only sticky button is "Back", so the primary action slot holds the exit.
   - The selected card shifts its text up a few pixels compared with its neighbours.
   - Fix: start with nothing selected and add a gold "Continue" that is disabled until a pick is made. Keep card padding identical in both states. Point the hand at the card row, not at one card.
5. Home and All steps (desktop-01-home, phone-01-home, desktop-09-overview): the hero art is weak and the step map is confusing.
   - The 3D object is a dark, generic icosahedron that says nothing about games or polish. On phone it is a nearly invisible ghost behind the nav, above a band of empty space. The page still looks half dead.
   - Step numbering starts at "0" while the caption says "1 of 26 done".
   - Step 22 has an unexplained white outline, and the legend "Filled = you are here. Outlined = done" does not cover it.
   - The tiles are numbers only, so a beginner cannot tell what any step is.
   - Fix: replace the hero with a lit, recognisable object (a rough gem being polished into a shining one, tied to the rating). Number the steps 1 to 26, show step titles on hover or tap, and remove or explain the stray outline.

WHAT WOULD MOVE IT TO 9:
- Make the rating trustworthy and goal-specific. Give per-bar evidence of what the scan found and what is missing. Make the weighting change visibly when the goal changes. For the ads/purchases and fixed-price goals, add a money row (store page, ads or purchase hooks, analytics, saves) so the owner sees what blocks earning.
- Enforce one screen, one decision, with zero overlaps. The guide hand, the mascot and the 3D backdrop each need a reserved zone on phone and desktop. The focus ring must be pixel-aligned, and every screen needs a single clear gold primary action.
- Give the 3D a job. A bright hero object should react to progress: dull at a low rating, more polished as steps complete. Pip should react to the score, not just caption it. That replaces the dim decorative wireframe sitting behind the text.
