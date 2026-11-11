/* Prompts 1-9. Each: n, id, title, icon, rules[], goal, look[], build[], dont[], done[], test[]
   Strings or functions(ctx). Build items may be {f:'featureKey', t:'text'} so the scan can tag them. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var P = PQ.PROMPTS = PQ.PROMPTS || [];
  var MEM = 'PROJECT_MEMORY.md';

  P.push({
    n: 1, id: 'audit', title: 'Audit and memory file', icon: 'p_audit', rules: [12, 13],
    goal: function (c) { return 'Learn what ' + c.name + ' really is today, and write it down in a file called ' + MEM + ' so you never lose track, even if this chat is cut. This prompt changes NO game code. The only file you create is ' + MEM + '.'; },
    look: [
      'The project folder: list the top-level files and folders, and the main entry point (the file where the game starts).',
      'How the game starts, and in what order its systems start. Write the order down as a list.',
      'Where each of these lives, if it exists: input, player, enemies or opponents, UI, saving, audio, scenes or levels, and anything that spawns objects.',
      function (c) { return c.memoryFile ? 'An existing notes file was found (' + c.memoryFile + '). Read it first. Copy its useful facts into ' + MEM + ' and never delete it.' : 'No notes file was found. You are creating the first one.'; },
      'How the game is run and tested today, and whether it has any automated tests.'
    ],
    build: [
      function (c) { return 'Create ' + MEM + ' at the project root with these sections: PROJECT FACTS (name, type, engine, how to run, weakest phone: ' + c.device.label + '), PROTECTED FILES (copy the list from the ground rules), SYSTEMS MAP (one line per system: what it does and which file), START ORDER, PROMPT STATUS (a checklist of all 26 prompts, all unchecked except Prompt 1 when you finish), SMOKE TEST (empty for now, created in Prompt 3), KNOWN BUGS, SEEN BUT NOT FIXED, DECISIONS, CHANGE LOG.'; },
      'Audit the game against the 19 rules. Write a table in the memory file with 19 rows. For each rule write: missing, partial or good, plus the file or screen that is your evidence. If you cannot find evidence, write "not sure" and say what you would need to check. Do not guess.',
      'Write down the 5 biggest risks you can see (for example: something that is created every frame, a file that does too many jobs, a save with no version number, a system used before it starts).',
      'Propose which prompts can be shortened or skipped because the game already does them well. Do not skip anything yet. Just write the proposal and let me decide.',
      'Ask me up to 5 short questions about anything you could not tell from the files. Wait for my answers before you finish.'
    ],
    dont: [
      'Do not change, move, rename or delete any game file.',
      'Do not fix anything you find. Only write it in the memory file.',
      'Do not start Prompt 2.'
    ],
    done: [
      MEM + ' exists, has every section, and the 19-row table is filled in with evidence.',
      'git status (or a folder compare) shows that the memory file is the only new or changed file.',
      'I have answered your questions.'
    ],
    test: [
      'Open ' + MEM + ' and check that the facts at the top match what you know about your game (name, engine, how to run).',
      'Pick two rows of the 19-row table and check the evidence yourself. If one is wrong, tell the AI.'
    ]
  });

  P.push({
    n: 2, id: 'structure', title: 'Structure and safety', icon: 'p_structure', rules: [12],
    goal: 'Make the game safe to change: every system starts before anything uses it, the code is split into small parts, saves have a version number, and we have a way to go back if something breaks.',
    look: [
      'The START ORDER you wrote in the memory file. Find any place where something is used before it exists or is ready.',
      'Any file that does many different jobs (for example input, movement, enemies and UI all in one file). List the worst three.',
      'How saving and loading work today, and what happens if the save is missing, empty or from an older version of the game.',
      'Any place where one error would stop the whole game.'
    ],
    build: [
      { f: 'git', t: 'Make sure version history exists. If git is not set up, ask me before running git init. Then make the first commit named "Before Polish Quest".' },
      'Fix the start order only if you found a real problem: make one clear boot step that starts each system in a fixed order. Do not reshape anything else.',
      'For the worst file you found, split out ONE small part into its own module, behind the same behavior. Stop after one. Do not refactor the rest.',
      { f: 'saveVersion', t: 'Give the save data a version number. Write a small "upgrade old save" step, so an old save still loads after later prompts add fields.' },
      { f: 'saveSystem', t: 'Make loading safe: if the save is missing or damaged, start a fresh game instead of crashing, and keep the last good save as a backup copy.' },
      'Add one small place to log errors so a problem shows up as a short readable line instead of a silent failure.',
      'Write the rule "one task, one checkpoint" at the top of the memory file: after every task, update the memory file and save a checkpoint.'
    ],
    dont: [
      'No big rewrites. No renaming things across the project.',
      'Do not change how the game plays.',
      'Do not delete old saves. Do not edit a player\'s real save data while testing. Use a copy.'
    ],
    done: [
      'The game starts, plays and saves exactly like before.',
      'An old save (or none at all) still loads without a crash.',
      'There is a checkpoint I can go back to.'
    ],
    test: [
      'Start a new game, play one minute, save, close, open again and load. Everything should be as you left it.',
      'Delete or rename the save on a copy of the project and start the game. It should start fresh and not crash.'
    ]
  });

  P.push({
    n: 3, id: 'smoke', title: 'Smoke test and debug view', icon: 'p_smoke', rules: [11, 12],
    goal: 'Create a 60-second check that tells us fast whether the game still works, and a small hidden debug view that shows speed and counts. Every later prompt will use these. This is the step that stops "fix one thing, break three".',
    look: [
      'The main loop of the game and the places where objects are created and removed.',
      'The most important things a player does in the first minute: start, move or act, get hurt or lose, score, pause, restart.',
      function (c) { return 'Whether a debug or FPS display already exists. ' + (PQ.featureState(c, 'fpsView') === 'found' ? 'The scan thinks one does.' : 'The scan did not find one.'); }
    ],
    build: [
      'Write a SMOKE TEST in the memory file: 8 to 12 steps a human can do in about 60 seconds. Each step has an action and the expected result (start game, move, act, take a hit, pause, resume, restart, save, load, go back to title). Put in the steps that matter to this game.',
      'If the engine and project allow it, add ONE small automated check (for example a script that starts the game and confirms it reaches the first screen without errors). If you cannot run it yourself, say so and do not claim it passed.',
      { f: 'fpsView', t: 'Add a debug view that is hidden by default and opens with one tap or one key in a corner of the screen. Show: frames per second, the time one frame takes in milliseconds, and the number of active objects. Keep it light so it does not slow the game.' },
      'Add a "perf marker" line to the memory file: a place where we write numbers measured on the weakest phone (frames per second, worst stall, memory if available).',
      'Record the numbers on this computer and say clearly that they are not phone numbers. Phone numbers must be measured on a real phone.'
    ],
    dont: [
      'Do not change how the game plays.',
      'Do not leave the debug view visible for players.',
      'Do not write "passed" for a step you could not run.'
    ],
    done: [
      'The smoke test is in the memory file and a human can finish it in about a minute.',
      'The debug view opens and closes with one tap or key, and is hidden by default.'
    ],
    test: [
      'Do the smoke test yourself, with a timer. If it takes more than two minutes, ask the AI to shorten it.',
      'Open the debug view, close it, and check that nothing stays on screen.'
    ]
  });

  P.push({
    n: 4, id: 'perf', title: 'Performance first', icon: 'p_perf', rules: [11],
    goal: function (c) { return 'Make ' + c.name + ' stable on the weakest phone BEFORE adding anything new. Target: ' + c.device.rule; },
    look: [
      'The numbers in the memory file from Prompt 3. If there are no phone numbers yet, ask me to measure on the real phone first and wait.',
      'Everything that runs every frame. List what it creates, allocates or searches for.',
      'Everything that is drawn, and whether similar things are drawn together or one by one.',
      'How big the images and sounds are, and whether any are loaded again and again.'
    ],
    build: function (c) {
      var items = [
        'Measure first. Write the baseline numbers (frames per second, worst stall) in the memory file. Fix only what the numbers point at, one fix at a time, and measure again after each fix.',
        'Find anything created inside the per-frame loop (new objects, lists, texts, effects) and change it to be created once and reused.'
      ];
      c.engine.perf.forEach(function (x) { items.push(x); });
      items.push({ f: 'pooling', t: 'Anything that spawns often (bullets, enemies, particles, floating numbers) should come from a reusable pool, not be created and destroyed.' });
      items.push({ f: 'delta', t: 'Movement and timers must use elapsed time, not frame count, so the game runs at the same speed on a slow phone.' });
      items.push({ f: 'lowEnd', t: 'Add a low-end mode (automatic or one tap) that reduces effects and resolution first, and never changes how the game plays.' });
      items.push('Write the before and after numbers in the memory file.');
      return items;
    },
    dont: [
      'No new features in this prompt.',
      'Do not change the game rules, speed or difficulty to get better numbers.',
      'Do not trade looks for speed unless the numbers show it is needed. Tell me first.'
    ],
    done: function (c) { return ['The memory file shows before and after numbers measured on a real phone that matches: ' + c.device.label + '.', 'No new stalls in the first 5 minutes of play.', 'The game plays the same as before.']; },
    test: [
      'Play five minutes on the real phone with the debug view open. Look for sudden stalls.',
      'Play with the phone plugged in and then unplugged. Check again after 10 minutes, because phones slow down when they get hot.'
    ]
  });

  P.push({
    n: 5, id: 'purpose', title: 'Purpose and goal', icon: 'p_purpose', rules: [13],
    goal: function (c) { return 'Give ' + c.name + ' a purpose a player can understand without reading: one sentence, a main goal with milestones, a small progress tracker, and a real ending.'; },
    look: [
      'What the player does most of the time, and what makes them stop or keep going.',
      function (c) { return PQ.featureState(c, 'goals') === 'none' ? 'There is no goal or quest system in the scan. You may be creating the first one.' : 'The existing goal, quest or achievement system. Reuse it. Do not make a second one.'; },
      'Whether the game has an ending today, and what happens at the last moment.'
    ],
    build: [
      'Ask me: "What is this game about in one sentence?" If I am not sure, offer three options based on what the game already does. Save my answer in the memory file as PURPOSE.',
      'Define the main goal and 3 to 5 milestones along the way. Save them in the memory file. Each milestone must be something the player can see and feel.',
      { f: 'goals', t: 'Add a small progress tracker that shows the main goal and the next milestone. Keep it tiny and in a corner. It must never cover the middle of the screen.' },
      'Check that everything in the game serves the goal. List anything that does not, and ask me whether to keep it. Do not delete anything yourself.',
      { f: 'story', t: 'Create a real ending: a clear last moment, a short result screen, and a way to start again. The ending can be simple now. Prompts 19 to 22 will make it stronger.' },
      'Show the goal in the game without a text wall: one short line at the start and then the tracker.'
    ],
    dont: [
      'Do not add new game systems. Only goal, milestones, tracker and ending.',
      'Do not write long text. One short line at most for the goal.'
    ],
    done: [
      'I can say the game\'s purpose in one sentence, and the memory file has it.',
      'A player can see how far they are toward the goal, and the game can actually be finished.'
    ],
    test: [
      'Hand the game to someone for two minutes and ask what they think they are trying to do. If they cannot say, the goal is not clear yet.',
      'Reach the ending (use a debug shortcut if the AI added one) and check the result screen and restart.'
    ]
  });

  P.push({
    n: 6, needs: 'touch', id: 'controls', title: 'One-tap controls', icon: 'p_controls', rules: [4],
    goal: 'Every button works with one tap. Nothing needs two taps, a long press or a precise aim. Several actions can happen at the same time.',
    look: [
      'Every button and interactive spot in the game, including pause, restart, back to title, popups and menus.',
      'How input is read today (touch, mouse, keyboard, gamepad) and whether actions block each other.',
      'How big each tap target is on a small screen.'
    ],
    build: [
      function (c) { return PQ.featureState(c, 'touch') === 'none' ? 'The scan found NO touch input. FIRST ask me: "Should this game run on phones at all?" If I say no, only check mouse, keyboard and gamepad, and tell me which steps below you are skipping. If I say yes, tell me what it would take, and do not start a port inside this prompt.' : (PQ.featureState(c, 'touch') === 'found' ? 'Phone touch input exists. Check it works before you change anything.' : 'The scan is not sure about touch input (it saw a hint, not proof). Find out for yourself whether touch works, and tell me what you found before you change anything.'); },
      'Make a list in the memory file of every button and what it does. Mark any that need more than one tap.',
      { f: 'touch', t: 'Make sure every action works by touch with one tap. Targets should be big enough for a thumb (guidance from Apple and Google is roughly 44 to 48 pixels at normal size). Do not make controls overlap.' },
      { f: 'pause', t: 'Pause, restart and back to title must each work with ONE tap. No "are you sure" popups for pause. For restart and back to title, prefer a short undo moment over a confirm popup.' },
      'Tapping outside any popup closes it. Check every popup, one by one.',
      'Let actions overlap: moving, dashing and attacking (or the equivalent in this game) must work at the same time, with several fingers if on a phone.',
      { f: 'gamepad', t: 'If gamepad or keyboard support exists, keep it working. Do not remove it.' },
      'Remove or avoid anything that needs a hover, a right-click or a double-click as the only way to do something.'
    ],
    dont: [
      'Do not change what each action does, only how it is triggered.',
      'Do not move controls to cover important parts of the play area.'
    ],
    done: [
      'Every button in the list works with one tap.',
      'Every popup closes when I tap outside it.',
      'Two actions at once work on a phone.'
    ],
    test: [
      'Tap every button in the list once. None should need a second tap.',
      'Open each popup and tap outside it.',
      'On a phone, hold move with one thumb and tap an action with the other.'
    ]
  });

  P.push({
    n: 7, id: 'layout', title: 'Phone layout and fullscreen', icon: 'p_layout', rules: [4, 11],
    goal: function (c) { return 'Make ' + c.name + ' fit and feel right on phones, especially in landscape: nothing is cut off by the notch, nothing scrolls or zooms by accident, and the screen is used well.'; },
    look: [
      'How the game scales to different screen sizes and shapes.',
      'What happens when the phone is rotated, and when the browser or system bars appear or disappear.',
      'Whether any control or text can be hidden under a notch, a rounded corner or the system gesture area.',
      'Whether the page or app can scroll, bounce or zoom while playing.'
    ],
    build: [
      function (c) { return PQ.featureState(c, 'touch') === 'none' ? 'The scan found NO touch input. FIRST ask me: "Should this game run on phones at all?" If I say no, only check mouse, keyboard and gamepad, and tell me which steps below you are skipping. If I say yes, tell me what it would take, and do not start a port inside this prompt.' : (PQ.featureState(c, 'touch') === 'found' ? 'Phone touch input exists. Keep it working.' : 'The scan is not sure about touch input. Find out whether touch works today, and tell me before you change anything.'); },
      { f: 'fullscreen', t: 'Make the play area scale to fit the screen without stretching. Keep the correct shape. Pick one clear rule (fit inside, with bars) and use it everywhere.' },
      'Landscape first: place controls at the left and right edges, away from the middle where the action is. Keep a safe margin from the screen edges and the notch.',
      'Respect the safe areas the system tells you about. Keep important buttons out of the corners that are cut or rounded.',
      'Stop accidental page scroll, pull-to-refresh and pinch zoom during play (only if the game runs in a browser or webview). Use the correct engine setting for it.',
      'Text must stay readable on a small phone. If any text is smaller than comfortable, make it bigger or remove it.',
      'Add a rotate hint ONLY if the game truly needs one orientation. Make it a small picture, not a sentence.'
    ],
    dont: [
      'Do not change the game design or the play area size itself.',
      'Do not hide anything the player needs.'
    ],
    done: [
      'In landscape on a small phone nothing is cut off and nothing overlaps.',
      'Rotating the phone does not break the layout.',
      'The page does not scroll or zoom by accident.'
    ],
    test: [
      'Open on a real phone in landscape. Check each corner and the middle.',
      'Rotate to portrait and back. Check again.',
      'If you can, test one phone with a notch and one without.'
    ]
  });

  P.push({
    n: 8, id: 'smooth', title: 'Smooth UI', icon: 'p_smooth', rules: [3],
    goal: 'Every popup, button, counter and screen change uses the SAME timing and the SAME easing. Nothing snaps or pops in. Only move and fade things, so it stays smooth on weak phones.',
    look: [
      'Every UI element that appears, disappears, changes number or moves.',
      'Any place that jumps instantly, or uses a different speed than its neighbors.',
      'Any animation that changes size of layout, blur, shadows or filters, which are heavier on weak phones.'
    ],
    build: [
      'Pick ONE short duration and ONE easing curve and define them in one place as shared settings (for example UI_TIME and UI_EASE). Everything below uses them. Write the chosen values in the memory file.',
      'Popups: they fade and move a little into place, and fade out the same way. Nothing appears instantly.',
      'Buttons: a quick press response (a small scale or brightness change) using the same timing.',
      'Counters: numbers roll to the new value with the same timing instead of jumping. Keep the roll short.',
      'Screen changes: fade or slide with the same timing.',
      'Use only position, scale and transparency changes. Avoid animating things that force the layout to be recalculated, and avoid heavy filters on weak phones.',
      'Add a "reduce motion" switch that turns movement down to short fades. It must be easy to find.',
      { f: 'settings', t: 'If there is a settings screen, add the reduce-motion switch there. Otherwise keep it small and near pause.' }
    ],
    dont: [
      'Do not change what the UI does or says.',
      'Do not make animations long. Slow UI feels worse than snappy UI.',
      'Do not add new animation styles. Use the shared timing and easing only.'
    ],
    done: [
      'Every UI element I can find uses the shared timing and easing.',
      'Nothing pops in or snaps out.',
      'Reduce-motion works.'
    ],
    test: [
      'Open and close every popup quickly three times. It should always feel the same.',
      'Watch a counter change. It should roll, not jump.',
      'Turn on reduce-motion and check that movement becomes short fades.'
    ]
  });

  P.push({
    n: 9, id: 'notify', title: 'Notification log', icon: 'p_notify', rules: [2],
    goal: 'Nothing blocks the screen. Messages, rewards and warnings go into one small collapsible log in a corner. The center of the screen always stays clear.',
    look: [
      'Every message, popup, banner, reward screen and warning in the game today.',
      'Which ones cover the middle of the screen or pause the game.',
      { f: 'toast', t: 'The existing message system, if any. Reuse it.' }
    ],
    build: [
      'List every message type in the memory file (reward, warning, info, achievement, tip) and which ones currently block the screen.',
      { f: 'toast', t: 'Create ONE small log in a corner: new lines slide in with the shared UI timing, stay a moment, then fade into the log. Keep the log tiny when collapsed.' },
      'Make it collapsible with one tap: collapsed shows a small badge or the newest line; expanded shows the last few lines. Tapping outside closes it.',
      'Use a small icon per type (reward, warning, info) instead of long words. Use the game\'s art, not emoji.',
      'Move every message you found into the log. Messages that truly must stop the game (like game over) are the only exception, and they must still be closable with one tap.',
      'Cap how many lines exist and reuse the line objects so the log never grows or allocates every frame.',
      'Make sure the log never covers the controls, the player or the main action.'
    ],
    dont: [
      'Do not add new kinds of messages.',
      'Do not make the log loud. No sounds, shaking or flashing for it.',
      'Do not put the log in the middle or over the controls.'
    ],
    done: [
      'No message covers the center of the screen during normal play.',
      'The log opens and closes with one tap and holds the recent messages.',
      'Old messages are removed, so it never fills up.'
    ],
    test: [
      'Trigger a reward, a warning and an info message. All three should appear in the corner log.',
      'Spam many messages quickly. The log must stay small and the game must not slow down.',
      'Check the middle of the screen during the busiest moment of play. It should be clear.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
