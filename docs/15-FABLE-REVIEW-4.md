# Fable 5.2 screenshot review (2026-11-13, shots: rescore2)

SCORE: 7
PROFESSIONAL: 7  BEGINNER: 7  ALIVE: 6  MONEY-READY: 5

TOP FIVE DEFECTS:
1. desktop-06-next-2 (rating): the status labels contradict the numbers. 3.8 out of 10 is labelled "OK" and 5.0 is "OK", while the headline says "Getting there". A beginner cannot tell whether 3.8 is fine or bad. Fix: use three plain labels tied to the score (Weak / Needs work / Good), and give the bar the same state by using a dim fill for weak and a full gold fill for good. Also make the "Weak" diamond and label sit on one line, aligned with the "OK" column; at the moment it is stacked and breaks the row.
2. desktop-06-next-2 and phone-06-next-2: there are too many competing actions on one screen: Change, the three rows ("Tap one to see why"), See all 7 areas, Ask for a human review, Start the steps, Ask the AI for a second opinion, and Copy the report. This is the old "everything at once" complaint coming back. Fix: keep the ring, one sentence, the three rows and "Start the steps". Move "second opinion" and "Copy the report" into a single "More" link. Move the $25 human review off this screen (see defect 5).
3. phone-04-goal-empty and phone-11-overview: the wireframe polyhedron sits behind the header and heading as dim clutter, with lines crossing "Polish Quest" and the nav. On the phone overview it also leaves a big empty band above "MAP" and dead space at the bottom. Fix: on phone, hide the polyhedron on every screen except home, or confine it to a fixed 120px slot below the header that never sits under text. Start the content directly under the header.
4. phone-11-overview: the six chapter tabs are icon-only with "0/4" counts, so the chapter names (Foundation, Story, Ship it) are gone. A beginner cannot tell what the drum or starburst icon means, and nothing names the selected chapter. Fix: show the selected chapter's name as a heading above the step list ("Foundation, 0 of 4"), or make the tabs a horizontally scrolling row of icon plus name pills.
5. desktop-06-next-2 and desktop-11-overview: "Still stuck? Ask for a human review ($25)" is the only money path, and it is a grey footnote that reads as an afterthought. It also appears before the user has even tried a step, where "Still stuck?" makes no sense. Fix: remove it from the rating and overview body text. Present it once as a proper card with what you get, who reviews, turnaround and price, shown after the rating's "See all 7 areas" or after a step is marked not working. Add a "Human review" item to the top nav.

Smaller points:
- Home: Pip's "Hi, I am Pip." bubble is nearly invisible grey on dark.
- Desktop goal screen: cards 1, 3 and 4 have empty bottoms because card 2's title wraps; align the titles on a common baseline. On goal-picked, the selected card's text shifts up 4px; keep the border width constant.
- Rating screen: "Change" floats far from the goal label, and the small coin icon is muddy at that size.
- Phone rating screen: "Copy the report" is gold while "Ask the AI for a second opinion" is white. Use one link style.

WHAT WOULD MOVE IT TO 9:
- Make the rating screen a single verdict: ring, one-sentence reason, three honestly labelled rows, one gold button. Everything else goes behind "More". The phone needs the same hierarchy with no stray gold links.
- Give the 3D a purpose. Replace the generic polyhedron with an object that reacts to state: it fills or brightens with the score, and it shows the chosen goal's trophy, coins, tag or stopwatch at large size on the rating screen. Never draw it behind text, on any screen.
- Build a real paid offer: a dedicated human review card or page with deliverables and price, reachable from the nav and offered at the moment of failure. Scattered "Still stuck?" footnotes do not do this job.
