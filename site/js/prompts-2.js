/* Prompts 10-18 */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var P = PQ.PROMPTS = PQ.PROMPTS || [];

  P.push({
    n: 10, id: 'combat', title: 'Combat feel', icon: 'p_combat', rules: [7],
    goal: function (c) {
      return c.genre.combat
        ? 'Make every hit in ' + c.name + ' feel heavy: knockback, a very short hit-pause, and stretchy attacks. Enemies must be a real threat, not a punching bag.'
        : 'Make ' + c.name + ' (' + c.genre.label + ') feel heavy at the key moment: ' + c.genre.impact + '. It has no fighting, so "combat feel" here means action feedback: weight, a tiny pause, and a clear threat from ' + c.genre.threat + '.';
    },
    look: function (c) {
      return c.genre.combat ? [
        'How attacks, hits and damage work today: where hits are detected, what happens to the target and to the attacker.',
        'How enemies move, attack and react. Which ones are easy to ignore.',
        'What the player sees and hears on a hit. Count the layers (movement, flash, sound, shake).',
        'How long a hit lasts, and whether the player can tell what hit them.'
      ] : [
        'The key moment of play: ' + c.genre.impact + '. Where does it happen in the code?',
        'What the player sees and hears at that moment today. Count the layers (movement, flash, sound, number).',
        'What pushes back on the player today (' + c.genre.threat + ') and whether it is a real threat.'
      ];
    },
    build: function (c) {
      return c.genre.combat ? [
        { f: 'knockback', t: 'Knockback: a hit pushes the target away a short distance, and heavier hits push more. Use a short eased movement, not an instant jump.' },
        { f: 'hitstop', t: 'Hit-pause: freeze the action for a very short moment (about 2 to 5 frames) on a solid hit. Make it a setting so it can be tuned or turned off. Never freeze the UI or the log.' },
        'Stretchy attacks: a quick wind-up, a fast stretch on the hit frame, then a settle. Use scale and position only.',
        { f: 'shake', t: 'A small camera shake only on heavy hits, with a strength setting and a reduce-motion off switch. Never shake on every tap.' },
        'Make enemies a real threat: each enemy type gets one clear tell (a wind-up the player can read) and one real consequence. Test that a player who ignores them loses health.',
        'Give hits clear feedback in this order: the target reacts, a short flash, one sound, one number or icon if needed. Nothing more.',
        'Tune with settings, not magic numbers: put knockback, hit-pause and shake strength in one settings object and write the values in the memory file.'
      ] : [
        'Weight: make ' + c.genre.impact + ' land with a short eased movement and a tiny scale pulse (move and fade only).',
        { f: 'hitstop', t: 'A very short pause (about 2 to 4 frames) at the biggest moments only. Make it a setting that can be tuned or turned off.' },
        'Make the threat real: ' + c.genre.threat + ' must be able to cost the player something they care about. Check it is not possible to ignore it forever.',
        'Give feedback in a fixed order: the thing reacts, a short flash, one sound, one number or icon if needed. Nothing more.',
        'Put the strength values in one settings object and write them in the memory file.'
      ];
    },
    dont: [
      'Do not change damage numbers, health or difficulty beyond what a real threat needs. Tell me before you change any.',
      'Do not make effects that last long or cover the screen.',
      'Do not add new enemy types. Make the existing ones a real threat.'
    ],
    done: [
      'A hit feels heavier than before and I can tell why (movement, pause, flash, sound).',
      'Ignoring the threat costs the player something.',
      'Everything is tunable from one place and can be turned down.'
    ],
    test: [
      'Hit something ten times in a row. It should feel good the tenth time too, not annoying.',
      'Play on the weak phone with the debug view open. The frame rate must not drop on a hit.',
      'Turn reduce-motion on. The shake should stop.'
    ]
  });

  P.push({
    n: 11, id: 'learn', title: 'Learn by playing', icon: 'p_learn', rules: [6],
    goal: 'Remove the need to read. If a system can be beaten without understanding it, redesign it so understanding it is what wins.',
    look: [
      'Every system the player has to understand (for example timing, resources, enemy tells, combos, build choices).',
      'For each system: can the player win by ignoring it, mashing buttons or repeating one move? Write yes or no with the reason.',
      'Any place where the game uses a block of text to explain something.'
    ],
    build: [
      'Make a table in the memory file: system, how a player learns it today, can it be beaten without understanding (yes/no), what would make understanding the winning move.',
      'Pick the three worst systems (the ones that can be beaten without understanding). Propose one small redesign for each and ASK ME which to do. Do not start before I answer.',
      'For each approved redesign, make the correct play clearly the best play: the world answers the action (a visible cause and effect), mistakes cost something small and clear, good play is rewarded.',
      'Make the game teach through a safe first encounter: a moment where failing is cheap, and the lesson is obvious from what happens.',
      'Replace any wall of text with a picture, a motion or a moment in the game world. If a number is needed, show it as a bar or an icon.',
      'Add a small way to see "why": when the player fails, the log (not a popup) shows a tiny icon that points to the cause.'
    ],
    dont: [
      'Do not add tutorial text. The pointer tutorial is Prompt 12.',
      'Do not make the game harder just to feel deep. Make good play matter.',
      'Do not redesign more than the three systems we agreed on.'
    ],
    done: [
      'In the three redesigned systems, mashing or ignoring no longer wins.',
      'A new player can find the right move by playing, without reading.'
    ],
    test: [
      'Try to beat each redesigned system by mashing or repeating one move. It should fail.',
      'Give the game to a new player for five minutes and watch. Do not talk. Note where they get confused.'
    ]
  });

  P.push({
    n: 12, id: 'pointer', title: 'Pointer tutorial', icon: 'p_pointer', rules: [1],
    goal: 'Teach with a pointer, not with text. A hand or pointer goes to each part of the game one by one and shows what it is, only when the player is curious. Never a wall of steps.',
    look: [
      { f: 'tutorial', t: 'The existing tutorial or hints, if any. List every text step. Those get replaced, one at a time.' },
      'Every part of the screen the player needs to know about (controls, health or lives, goal, currency, key buttons).',
      'What "curious" means in this game: the player stopping, hovering or tapping near something, pausing, or failing at the same spot twice.'
    ],
    build: [
      'Build one tiny pointer component: a hand or arrow drawn from the game\'s own art, that moves to a target with the shared UI timing and gently pulses. Reuse one object, do not create it again each time.',
      'Show ONE target at a time. Never queue steps. The pointer shows what the thing is with a small picture or motion, not a sentence.',
      'Only trigger a pointer when the player is curious (they tapped near it, paused, or failed twice). Never interrupt play.',
      'Never block the game. The pointer fades if the player ignores it, and any tap dismisses it.',
      'Remember what the player has already been shown (put it in the save data, with a version) so nothing repeats.',
      'Add a small "show me again" spot for each thing, near pause. It must not use words, only the thing\'s icon.',
      'Remove or replace every old text tutorial step you listed.'
    ],
    dont: [
      'Do not add tutorial text, popups or step counters.',
      'Do not show a pointer during a hard moment of play.',
      'Do not change controls or rules.'
    ],
    done: [
      'No text tutorial remains.',
      'Pointers appear one at a time, only when the player is curious, and never repeat.',
      'The pointer never blocks play.'
    ],
    test: [
      'Start a new game and just play. A pointer should show up only after you pause or hesitate.',
      'Ignore a pointer. It should fade.',
      'Restart the game. Seen pointers should not come back.'
    ]
  });

  P.push({
    n: 13, id: 'earned', title: 'Earned abilities', icon: 'p_earned', rules: [5],
    goal: 'Abilities stay hidden until the player earns them. No locked buttons and no greyed-out icons. When one unlocks, a short pointer moment shows it.',
    look: [
      { f: 'abilities', t: 'Every ability, upgrade or unlock in the game. List when each becomes available and how it is shown today.' },
      'Any locked, greyed-out or "coming soon" buttons.',
      'What the player does right before they would be ready for each ability.'
    ],
    build: [
      'Write each ability in the memory file with: how the player earns it, and what they just learned that makes it make sense.',
      'Hide every unearned ability completely: no button, no slot, no grey icon, no label.',
      'Show a button only when the ability is earned. Use the shared UI timing to fade it in.',
      'When something unlocks, run a short pointer moment: the pointer from Prompt 12 goes to the new button, pulses once, and fades. No text and no popup.',
      'Add the earned state to the save data (with the save version) so abilities stay earned.',
      'Make sure the screen layout does not jump when a new button appears.'
    ],
    dont: [
      'Do not add new abilities.',
      'Do not change what abilities do or how they are earned, unless something is broken.',
      'Do not show a list of future unlocks.'
    ],
    done: [
      'A new game shows no locked or grey buttons.',
      'Each earned ability appears with a short pointer moment.',
      'Earned abilities survive saving and loading.'
    ],
    test: [
      'Start a new game and look at the screen. There should be nothing locked.',
      'Earn the first ability. The pointer shows it once.',
      'Save, close and load. The ability is still there and no pointer repeats.'
    ]
  });

  P.push({
    n: 14, id: 'goals', title: 'Short goals', icon: 'p_goals', rules: [14],
    goal: 'Always give the player one or two goals that take a few minutes. When one finishes, the next appears.',
    look: [
      { f: 'goals', t: 'The existing goal, quest or achievement system. Reuse it.' },
      'How long a player usually plays before they stop, and what they were doing.',
      'What the main goal and milestones are (from Prompt 5).'
    ],
    build: [
      'Create a small goal system (or extend the existing one) that always holds one or two active goals. Each goal should take about 2 to 5 minutes.',
      'Goals must come from what the player is already doing, and steer them toward the main goal. Make a pool of goal types and pick them by what the player has not tried yet.',
      'Show the active goals in the corner log or tracker, tiny, with an icon and a small progress bar. Not in the middle of the screen.',
      'When a goal finishes: a small reward, a line in the log, and the next goal slides in right away (shared UI timing).',
      'Never show a goal the player cannot start. Never show more than two.',
      'Save the goal state (with the save version).'
    ],
    dont: [
      'Do not add long goals or lists of goals.',
      'Do not make goals feel like chores. They must come from play.',
      'Do not add new reward types. Use what the economy already has.'
    ],
    done: [
      'There are always one or two goals, never zero and never more than two.',
      'Finishing one shows the next within a second.'
    ],
    test: [
      'Play for ten minutes. You should finish at least three goals, each in a few minutes.',
      'Save and reload in the middle of a goal. The progress is kept.'
    ]
  });

  P.push({
    n: 15, id: 'economy', title: 'Economy', icon: 'p_economy', rules: [9],
    goal: 'Money buys decisions, not more of the same. Even a rich player still has strategy.',
    look: [
      { f: 'economy', t: 'Every way the player earns and spends money, points or resources. Write them as a list of sources and sinks.' },
      'What the player buys today. Is it "more of the same" (bigger number) or a real choice?',
      'What a very rich player does. Can they buy everything and stop thinking?'
    ],
    build: [
      'Write the economy map in the memory file: sources, sinks, and what each purchase changes.',
      'Find purchases that are only "more of the same" (for example +10% damage again and again). Propose replacing each with a choice (two options where taking one makes the other worse or impossible, or a trade-off).',
      'ASK ME which replacements I approve. Wait for my answer.',
      'Add at least one sink that stays interesting when rich: a choice with a cost that cannot be bought away (limited slots, a trade-off, a risk, a long-term bet).',
      'Make prices follow the player\'s progress, so a rich player faces harder choices, not an empty shop.',
      'Show prices with an icon and a number. Keep shop text to a minimum.',
      'Do not change the amount of money in the game without telling me first.'
    ],
    dont: [
      'Do not add real-money purchases, ads or any outside payment.',
      'Do not remove existing items. Replace or reshape them only if I approve.',
      'Do not make the game grindy.'
    ],
    done: [
      'Each approved purchase is a decision, not just a bigger number.',
      'A very rich player still has a meaningful choice to make.'
    ],
    test: [
      'Use a debug shortcut (or edit a copy of the save) to be very rich. You should still have to choose.',
      'Play from the start and check that early money feels useful.'
    ]
  });

  P.push({
    n: 16, id: 'variety', title: 'Variety', icon: 'p_variety', rules: [8],
    goal: function (c) { return 'Make every run or season of ' + c.name + ' feel different: new discoveries, new behavior, a crisis or event (such as ' + c.genre.crisis + '), and steady progress.'; },
    look: [
      { f: 'procedural', t: 'Where randomness or generated content already exists. Reuse it.' },
      'What stays exactly the same every time you play.',
      'What the player discovers after the first 10 minutes. Is there anything new?'
    ],
    build: [
      'Write what changes between runs today, and what does not, in the memory file.',
      { f: 'procedural', t: 'Add a seed so a run can be repeated, with a way to see it. Different seeds must change something the player notices.' },
      'Add a small set of "twists" that change one rule or behavior for a run. Pick one at the start of a run and show it with an icon (no text wall).',
      function (c) { return 'Add a crisis or event moment partway through a run, for example ' + c.genre.crisis + '. It must be fair, readable and survivable.'; },
      'Add new behavior over time: existing enemies or obstacles gain a new trick as the run goes on. Do not add new art unless needed.',
      'Add a discovery: something the player can find that changes how they play next time. Save what has been discovered.',
      'Keep progress steady: each run should leave the player a little further along (a small permanent gain, unlock or record).'
    ],
    dont: [
      'Do not add many new systems. Use small twists on what exists.',
      'Do not make the game unfair. Every twist must be readable.',
      'Do not break saves.'
    ],
    done: [
      'Two runs in a row feel different in a way I can name.',
      'A crisis happens and can be survived.',
      'Something is saved as progress after each run.'
    ],
    test: [
      'Play three runs. Write down what was different each time.',
      'Use the same seed twice. It should repeat.'
    ]
  });

  P.push({
    n: 17, id: 'vfx', title: 'VFX with purpose', icon: 'p_vfx', rules: [17],
    goal: 'Every effect has four layers (wind-up, main effect, impact, lingering trail) and each layer tells the player something. No effect just for looks. Particles are reused and overdraw is capped.',
    look: [
      { f: 'particles', t: 'Every existing effect and particle. For each: what does it tell the player?' },
      'Which effects cover the screen or stack on top of each other.',
      'Where particles are created, and whether they are reused.'
    ],
    build: [
      'List every effect in the memory file with the information it gives. Mark the ones that give none.',
      'Remove or shrink effects that give no information.',
      'For each important action, define the four layers. Wind-up: warns what is about to happen. Main effect: shows what is happening. Impact: shows the result. Lingering trail: shows where it was or what is left. Keep each layer short.',
      { f: 'particles', t: 'Use ONE particle pool for the whole game with a fixed maximum, and reuse the particles. Nothing is created per frame.' },
      'Cap overdraw: limit how many big transparent effects can overlap, and fade the oldest first.',
      'Make colors tell meaning (for example one color for danger and one for reward) and keep them consistent.',
      'Add a "low effects" setting that cuts particles in half and removes the trails. Use it automatically on the weak phone if the frame rate drops.'
    ],
    dont: [
      'Do not add effects without a reason. Every effect must say something.',
      'Do not make effects hide the player or the threat.',
      'Do not create particles per frame.'
    ],
    done: [
      'Every effect that remains tells the player something.',
      'The particle count never goes above the cap and nothing is created per frame.',
      'Low-effects mode keeps the weak phone smooth.'
    ],
    test: [
      'Trigger the busiest moment of the game on the weak phone with the debug view open. The frame rate must hold.',
      'Turn low effects on and compare.'
    ]
  });

  P.push({
    n: 18, id: 'audio', title: 'Sound and music', icon: 'p_audio', rules: [17, 19],
    goal: function (c) { return 'Make the sound of ' + c.name + ' support the feel: every important moment has a sound, music can shift at big moments, and nothing is annoying or loud by surprise. Sound must also work on a phone, where it often starts muted until the player taps.'; },
    look: [
      { f: 'audio', t: 'Every existing sound and music file. List what plays when.' },
      'Whether sounds are loaded again and again, or all played at the same volume.',
      'What happens when the app goes to the background, or when the player has not tapped yet (phones often block sound until the first tap).'
    ],
    build: [
      'Write the sound map in the memory file: moment, sound, volume.',
      { f: 'audio', t: 'Make one audio manager that loads each sound once, reuses it, and limits how many play at the same time.' },
      'Start audio after the first tap (the game already needs one tap to start, so use it). Do not show a "tap to enable sound" popup.',
      'Pause audio when the game is paused or the app goes to the background, and resume it cleanly.',
      'Add a mute switch and a volume slider in one obvious place, remembered in the save. Keep sounds from being much louder than each other.',
      'Add music layers or a simple shift for big moments (used in Prompts 21 and 22). Do not add new music files unless I provide them. Tell me where music is needed.',
      'Do not use any sound or music file that is not mine or properly licensed. Ask me if you are not sure.'
    ],
    dont: [
      'Do not add loud surprises or constant sound.',
      'Do not download sound from the internet. Ask me.',
      'Do not change the game rules.'
    ],
    done: [
      'Every important moment has a sound, and the mute switch works.',
      'Sound starts after the first tap and stops when paused or in the background.'
    ],
    test: [
      'Open the game on a phone and tap once. Sound should start without a popup.',
      'Switch to another app and back. Sound should pause and resume.',
      'Play for five minutes with the debug view open. The frame rate should not change because of sound.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
