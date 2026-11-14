/* Prompts 23-26: retention, final performance, final quality, release pack */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var P = PQ.PROMPTS = PQ.PROMPTS || [];
  var MEM = 'PROJECT_MEMORY.md';

  P.push({
    n: 23, id: 'retain', title: 'Retention', icon: 'p_retain', rules: [10],
    goal: function (c) {
      return 'Find the moments where players quit ' + c.name + ' and give them a real reason to continue right there. Use evidence, not a guess. No tracking, no tricks, no guilt.';
    },
    look: [
      'Evidence of where players stop. The AI cannot see this by itself. Ask me what I know: where testers quit, what friends said, what I saw on a stream or a video, store page comments. If I know nothing, say so and use the fallback below.',
      'The first 5 minutes, the first 30 minutes and the end of one run or session. Walk through each one in the code and list the "dead moments": nothing to do, nothing new, a wall, a slow part, a loss with no lesson.',
      { f: 'goals', t: 'The short goals from Prompt 14 and the main milestones from Prompt 5. Retention reasons should plug into these, not into a new system.' },
      'What the player sees right after a loss, after finishing a goal, and right after loading the game.'
    ],
    build: [
      'Write a RETENTION MAP in ' + MEM + ': a table with the moment, why a player might quit there, and the reason to continue. Mark each row "evidence" (I told you) or "guess" (you think so). Never present a guess as a fact.',
      'ASK ME to pick the top 3 quit risks to fix. Wait for my answer. Do not fix the rest.',
      'For each chosen moment, add ONE reason to continue that fits the game: a visible next step (a goal that is already half done), a small unfinished thing the player can see, a near reward, or a "one more try" that starts in one tap after a loss.',
      'After a loss or the end of a session, show what the player gained (a tiny bar or icon, no text wall) and the single next thing to try, with a one-tap button to go again. The loss must teach something (Prompt 11).',
      'Make coming back easy: when the game loads, put the player back where they were, with the next goal showing. Never make them dig through menus.',
      { f: 'saveVersion', t: 'Save whatever the new reasons need (a bump of the save version and an upgrade step for old saves).' },
      'Add a tiny LOCAL notes log, off by default, that I can switch on while testing: it records the time and the state when the game is closed or lost (for example "lost in room 3 after 4 minutes"). It stays on the device, is never sent anywhere, and I can copy it by hand. Without it I have no evidence.'
    ],
    dont: [
      'Do not add any network call, analytics, tracking, account or outside service. Evidence comes from playtests and the local notes log only.',
      'Do not use dark tricks: no fake countdown timers, no guilt messages, no daily-login punishments, no fake scarcity, no pressure to spend.',
      'Do not make the game easier or change rewards without telling me. If a quit is caused by difficulty, tell me and let me decide.',
      'Do not fix more than the three moments I picked.'
    ],
    done: [
      'The retention map exists and is honest about which rows are evidence and which are guesses.',
      'Each of the three chosen moments has a reason to continue, and I can see it in play.',
      'After a loss, a new attempt starts in one tap and shows the next thing to try.',
      'Nothing was sent anywhere. The notes log is local and off by default.'
    ],
    test: [
      'Lose on purpose three times in a row. Each time you should want to press the one-tap button again.',
      'Close the game in the middle of a goal and open it again. You should land where you left off with the goal visible.',
      'Give the game to one new person for 10 minutes. Note where they put it down. Add that to the retention map as evidence.',
      'Check that no new network request appears while playing (use the browser network view if the game runs in a browser).'
    ]
  });

  P.push({
    n: 24, id: 'perf2', title: 'Final performance check', icon: 'p_perf2', rules: [11],
    goal: function (c) {
      return 'Now that every feature is in, prove ' + c.name + ' is still stable on the weakest phone. Target: ' + c.device.rule + ' Fix only what got worse since Prompt 4. Add nothing new.';
    },
    look: [
      'The baseline numbers you wrote in ' + MEM + ' during Prompts 3 and 4.',
      'Everything added since: the notification log, pointer, goal tracker, cinematics, dialogue, finisher, audio manager, VFX pool, notes log.',
      'The busiest moment of the game (the most objects, effects and sound at once) and the heaviest screen.',
      'Any new thing created inside the per-frame loop since Prompt 4.'
    ],
    build: function (c) {
      var items = [
        'Ask me to measure on the real phone (' + c.device.label + ') and give you the numbers. If I cannot, say so and write "not measured on a phone" next to every number you record. Do not invent phone numbers.',
        'Measure these five cases and write them next to the baseline: a normal minute of play, the busiest moment, a cinematic, a finisher, and 10 minutes of play in a row (phones slow down when they get hot).',
        'Compare with the baseline. List only what got worse by a clear amount and what it costs (frames per second, worst stall, memory if available).',
        'Fix the worst regression first, measure again, then the next. One fix at a time. Stop when the target is met.',
        'Check again for anything created every frame (objects, lists, texts, closures) in the code added since Prompt 4, and change it to be created once and reused.',
        { f: 'pooling', t: 'Check that the particle pool, the floating numbers and the audio voices stay under their fixed maximums during the busiest moment.' },
        { f: 'lowEnd', t: 'Check that the low-effects or low-end mode really helps. Measure with it on and off. If the frame rate drops, it should switch on by itself.' },
        'Check memory over 10 minutes. If it keeps growing, something is not being released. Find it.',
        'Check load time: how long from tap to first playable frame. Write the number down. Remove anything that loads before it is needed.'
      ];
      c.engine.perf.slice(0, 2).forEach(function (x) { items.push('Engine check: ' + x); });
      items.push('Write the final numbers, what you fixed and what you left alone in ' + MEM + '.');
      return items;
    },
    dont: [
      'No new features.',
      'Do not lower the game rules, speed or difficulty to get better numbers.',
      'Do not cut art or effects unless the numbers show it is needed. Tell me first and let me decide.',
      'Do not say "smooth" without a number next to it.'
    ],
    done: function (c) {
      return ['Final numbers are in the memory file next to the baseline, marked clearly as measured on a phone or not.', 'The target for ' + c.device.label + ' is met, or I have been told exactly what is missing and what it would cost to fix.', 'The busiest moment and 10 minutes of play show no new stalls.'];
    },
    test: [
      'Play the busiest moment on the real phone with the debug view open. Watch the frame rate.',
      'Play for 10 minutes without stopping, then check again. Note whether the phone got warm.',
      'Turn the low-effects mode on and play the same moment. It should be clearly smoother.'
    ]
  });

  P.push({
    n: 25, id: 'quality', title: 'Final quality check', icon: 'p_trophy', rules: [12, 13],
    goal: function (c) {
      return 'Go through ' + c.name + ' once more from the eyes of a brand new player and check every one of the 19 rules honestly. Fix only small problems. Write down the rest.';
    },
    look: [
      'The 19-row table from Prompt 1 and the "Seen but not fixed" list in ' + MEM + '.',
      'The smoke test, and whether it still passes.',
      'The first 60 seconds as a new player: what is confusing, what is boring, what is loud, what is ugly.',
      'Every screen the player can open (title, pause, settings, goals, end screen) on a small phone screen held sideways.'
    ],
    build: [
      'Run the smoke test and report each step as passed, failed or "I could not run this, please check by hand". Never write passed for a step you did not run.',
      'Re-do the 19-row audit. For each rule write: good, partial or missing, with the file or screen as evidence. Compare to the first table and show what improved.',
      'Run the "weird situations" checks: pause during a cinematic, pause during a finisher, rotate the phone, switch apps and come back, lose the connection (the game must not care), tap a lot very fast, open two popups, load an old save, load a missing or damaged save.',
      'Do a text sweep: find any block of text a player has to read, any tutorial text, any emoji used as an in-game icon, and any popup in the middle of the screen. Report them. Fix the small ones.',
      'Check the basics a beginner needs: sound can be muted in one place, effects can be reduced, every button can be hit with a thumb, nothing important is only a color (also use a shape or an icon).',
      'Sort all open problems into three lists in ' + MEM + ': FIX NOW (small and safe, do them one at a time with a checkpoint after each), LATER (real but big), and WON\'T FIX (and why).',
      'Fix the FIX NOW list, one item at a time. If a fix breaks something, undo it and move the item to LATER.',
      'Write a short honest "state of the game" at the top of the memory file: what is good, what is rough, what a player will notice first.'
    ],
    dont: [
      'Do not start big redesigns. Big things go to the LATER list.',
      'Do not add features.',
      'Do not hide a problem to make the table look good.',
      'Do not rewrite systems that pass.'
    ],
    done: [
      'The smoke test result is honest, with each step marked passed, failed or "check by hand".',
      'The 19-row table is updated, with evidence, and I can see what improved.',
      'FIX NOW is empty. LATER and WON\'T FIX are written down with reasons.'
    ],
    test: [
      'Hand the game to someone who has never seen it. Say nothing. Watch for 5 minutes and write down where they got stuck.',
      'Play the full first run on the weakest phone, in landscape, with sound on.',
      'Load a save made earlier in this project (before the save changes) and check it still works.'
    ]
  });

  P.push({
    n: 26, id: 'cleanui', title: 'Clean UI pass', icon: 'p_smooth', rules: [20, 3],
    goal: function (c) { return 'Make every screen of ' + c.name + ' clean. AI tools tend to add filler text, placeholder text and duplicate buttons. Find them and remove them. This prompt changes how screens look and read. It must not change what the game does.'; },
    look: [
      'Every screen, menu, popup and HUD element in the game. Write a short inventory per screen: the words shown, and every button or control.',
      'Buttons or controls that do the same thing on the same screen (two Play buttons, a Back and a Close side by side, a Menu icon and a Menu button).',
      'Words that tell the player nothing: "Welcome to the game!", "Click here", "Loading, please wait" on a 1-second load, lorem ipsum, TODO, test labels, repeated headings, a title that repeats the button below it.',
      'Text that explains something the player can already see, or that a hand pointer or an icon could show.',
      'Leftover debug text, placeholder names, emoji used as icons, and numbers that are not used for anything.'
    ],
    build: [
      'Write the inventory first and show it to me. Mark each item KEEP, MERGE or REMOVE and give the reason in four words or fewer. Wait for my OK before changing anything.',
      'After my OK, remove every REMOVE item. For MERGE items keep ONE control and make sure it still does the job of both.',
      'Rule for buttons: one button per action on a screen. If an action must be reachable in two places, the second one must be on a different screen, not beside the first.',
      'Rule for words: a heading is at most 4 words. A button is 1 to 3 words and starts with a verb. A line of help text is one short sentence. If a screen has more than 20 words in total, ask me which to cut.',
      'Keep anything required for safety or law (age notices, save warnings, credits). Do not shorten those without asking me.',
      'Check that the spacing, font sizes and button sizes of what remains are consistent, using the shared UI timing and styles from the earlier prompts. Do not add new styles.',
      'Write a "Clean UI rules" section in ' + MEM + ' with the rules above, so later prompts follow them. Add a line to the smoke test: no two visible buttons on one screen share the same label.'
    ],
    dont: [
      'Do not change game rules, balance, controls or saved data.',
      'Do not add new screens, new text or new buttons while cleaning. This prompt only removes and merges.',
      'Do not delete anything required for safety or law, and do not remove a control the player needs to leave a screen.',
      'Do not use emoji characters as icons.'
    ],
    done: [
      'I have seen the inventory and approved the list before anything was changed.',
      'No screen has two buttons that do the same thing, and no placeholder or filler text is left.',
      'The game plays exactly as before. The smoke test passes, including the new duplicate-label check.',
      'The memory file has the Clean UI rules.'
    ],
    test: [
      'Open every screen and read it out loud. Anything you skip over while reading can probably go.',
      'On each screen, point at each button and say what it does. If two answers are the same, one of them is a duplicate.',
      'Play the first 5 minutes. Nothing should feel missing.'
    ]
  });

  P.push({
    n: 27, id: 'release', title: 'Release pack', icon: 'p_release', rules: [12],
    goal: function (c) {
      var ed = c.engine.ed ? ' Part of this project is edited in the ' + c.engine.label + ' editor, so for those parts only guide me with exact clicks. Do not claim you changed them.' : '';
      return 'Get ' + c.name + ' ready to ship: a clean build that is tested, the debug tools hidden, honest credits, and the files a store page needs. Nothing is uploaded or published by you.' + ed;
    },
    look: [
      function (c) { return 'How the game is built and exported for players today (' + c.engine.label + '). If you are not sure of the exact export steps for this engine and version, say "I am not sure" and point me to the official docs. Do not invent menu names.'; },
      'Every asset in the game (art, sound, music, fonts, plugins, libraries) and where it came from. List the ones with no known source or license.',
      'Everything meant for testing only: the debug view, the notes log, test shortcuts, console prints, test saves.',
      'The game version number, if any, and where it is shown.'
    ],
    build: [
      'Hide or remove the test-only tools from the player build (debug view open key, test shortcuts, notes log switch, console prints). Keep them in the development version.',
      'Add a version number in one place and show it small in the settings or title screen. Use it in the save version notes too.',
      'Write CREDITS.md listing every asset, library and font with its source and license. For anything with no known source, mark it "UNKNOWN - owner must check". Never guess a license.',
      'Make the release build the way the engine normally does it. Run the smoke test on the BUILD, not on the editor or the dev run. Say plainly if you could not run the build yourself and tell me the exact steps to check it by hand.',
      'Check the size of the build and list the five biggest files. Tell me if any look too big for a phone and offer ideas, but change nothing without asking.',
      'Check that the game still works with no internet (airplane mode) and makes no network calls. Report what you found.',
      'Write a short README for players: what the game is, how to play in two lines, the controls for touch and keyboard, and the weakest phone it was planned for. Only write what is true and what was checked.',
      'Prepare store text for me to edit: a one-line pitch, a short description, a list of features that are really in the game, and a list of screenshots worth taking (no invented claims, no awards, no numbers I did not give you).',
      'Write a CHANGELOG.md summarizing what Prompts 1 to 26 changed, in plain words.',
      'Make a final checkpoint named with the version number. Do not publish or upload anything.'
    ],
    dont: [
      'Do not upload, publish, tag a public release or post anywhere.',
      'Do not claim a license, award, rating or performance number that was not checked.',
      'Do not remove the debug tools from the development version, only from the player build.',
      'Do not change gameplay.'
    ],
    done: [
      'The player build has no debug tools showing, and the smoke test passed on the build (or I was told exactly what to check by hand).',
      'CREDITS.md, README, CHANGELOG.md and the store text drafts exist, and nothing in them is invented.',
      'Every asset with an unknown source is flagged for me to check.',
      'A final checkpoint with the version number exists.'
    ],
    test: [
      'Install or open the release build on the weakest phone from a fresh start (no saved data). Play the first 5 minutes.',
      'Switch on airplane mode and play again. Nothing should change.',
      'Read CREDITS.md and check each flagged asset yourself before you publish.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
