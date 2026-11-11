/* Prompts 19-22: cinematics, dialogue, finisher, emotional payoff */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var P = PQ.PROMPTS = PQ.PROMPTS || [];
  var MEM = 'PROJECT_MEMORY.md';

  P.push({
    n: 19, id: 'cinema', title: 'Story cinematics', icon: 'p_cinema', rules: [15],
    goal: function (c) {
      return 'Add short story moments to ' + c.name + ' at three places: the start, a few key turning points, and the ending. Build them inside the game from its own art and code. No video files. Characters sound different from each other. One tap skips. The game remembers what the player already saw.';
    },
    look: [
      { f: 'cutscene', t: 'Any cutscene, intro, title card or ending that already exists. List each one, how long it is and whether it can be skipped.' },
      { f: 'story', t: 'The story facts that already exist: the purpose sentence and main goal from Prompt 5, characters, names, an ending screen.' },
      'The milestones from Prompt 5. Each milestone is a candidate for a turning point.',
      'The art the game already has (characters, backgrounds, portraits). The cinematics may only use what exists, unless I say otherwise.',
      function (c) { return 'Where a ' + c.genre.label.toLowerCase() + ' game can safely pause for a few seconds (between rooms, levels, rounds or turns), so a story moment never lands in the middle of a hard moment.'; }
    ],
    build: [
      'If the game has no characters or story yet, STOP and ask me: who is the player, who else matters, what is the one-sentence purpose. Offer 3 short options to tap or copy. Wait for my answer before you write any story.',
      'Write the cast in ' + MEM + ': for each character a name, a voice (how they talk: short or long words, calm or loud, one habit) and a sound idea (a pitch or a rhythm for their text, using sounds the game already has). Two characters must never sound the same.',
      'Build ONE small cinematic runner. A cinematic is a list of beats written as data (who, what they say, what the camera does, how long to wait). The runner plays the beats using the shared UI timing from Prompt 8. Write lines as data so Prompt 20 can reuse them.',
      'Add black bars at the top and bottom that slide in and out. Only move and fade, so it stays smooth on the weakest phone.',
      'Make every cinematic skippable with ONE tap anywhere. Skipping must leave the game in exactly the same state as watching to the end (same flags, same rewards, same position). Test both.',
      { f: 'saveVersion', t: 'Remember what was seen. Add a list of seen cinematic ids to the save data, bump the save version and write the upgrade step so old saves still load. A seen cinematic is never forced again. Make a small replay icon only if I ask.' },
      'Write exactly three kinds: a START moment (about 15 to 20 seconds at most: who you are, what is wrong, what you want), 2 or 3 TURNING POINT moments (about 10 seconds each, tied to the milestones), and an ENDING (about 30 seconds at most, the real ending from Prompt 5).',
      'Play a cinematic only at a safe pause point. Never during danger. Never while another popup is open.',
      'If there is an audio manager (Prompt 18), use it for a quiet sound under the story. Do not add new sound files. Tell me where one would help.',
      'Build the scenes from the game\'s own art, moved with scale, position and fade only. Do not decode any video. Do not add heavy new art.'
    ],
    dont: [
      'Do not add video files or any video player.',
      'Do not add more than one start moment, three turning points and one ending.',
      'Do not make cinematics longer than the limits above. Short is the rule.',
      'Do not change gameplay rules, rewards or difficulty.',
      'Do not write dialogue boxes here. Prompt 20 does that.'
    ],
    done: [
      'The start, 2 or 3 turning points and the ending all play, in the right places.',
      'One tap skips every one of them, and the game state is the same either way.',
      'A cinematic that was seen never plays again, even after saving and loading.',
      'No video file was added, and the weakest phone still holds its frame rate during a cinematic.'
    ],
    test: [
      'Start a new game. Watch the start moment to the end. Then start another new game and skip it with one tap. Compare the two games: they must match.',
      'Save and reload after a turning point. It must not play again.',
      'Open the debug view on the weakest phone during a cinematic. The frame rate must not drop.',
      'Read the lines of two different characters out loud. They should not sound alike.'
    ]
  });

  P.push({
    n: 20, id: 'dialogue', title: 'Dialogue', icon: 'p_dialogue', rules: [16],
    goal: function (c) {
      return c.genre.id === 'narrative'
        ? 'Make the talking in ' + c.name + ' short, in character, and about what just happened, with a bottom box that fades in and never hides the art that matters. Lines must react to the player\'s choices.'
        : 'Give the characters of ' + c.name + ' short lines about what JUST happened, in a bottom box that never covers the action and fades in. Lines react to what the player chose.';
    },
    look: [
      { f: 'dialogue', t: 'The existing dialogue or text box, if any. How it is shown, how it advances, and how long the longest line is.' },
      'The cast and voices you wrote in ' + MEM + ' in Prompt 19.',
      function (c) { return 'The events in the game that deserve a reaction. Write them as a list (for example: ' + c.genre.impact + ', a goal finished, a loss, a big pickup, a choice made).'; },
      'The notification log from Prompt 9. Dialogue is a character talking. The log is the game reporting. Keep them separate.'
    ],
    build: [
      { f: 'dialogue', t: 'Build ONE bottom dialogue box (or reuse the existing one). It sits in the bottom part of the screen, respects the phone safe area (notches and rounded corners), is at most two lines tall and is mostly see-through. The center of the screen stays clear.' },
      'Fade the box and each line in and out using the shared UI timing from Prompt 8. Nothing snaps or pops. Move and fade only.',
      'Keep lines short: about 12 words or fewer. A tap finishes the line, another tap closes it. During play the box closes by itself after a few seconds.',
      'Trigger lines from game EVENTS (the list you made), not from a fixed timer. A line must be about what just happened, not generic chatter.',
      'Write 3 different lines per event per character, in each character\'s own voice. Never repeat the same line twice in a row. Remember the last line used.',
      'Make lines react to choices: store a few choice flags in the save data (bump the save version and write the upgrade step) and let later lines depend on them.',
      'Limit it: at most one line at a time, a short quiet time between lines, and drop old lines instead of queueing a pile. Never let the dialogue block input or pause the game during play.',
      'Reuse the dialogue box for the lines of the cinematics from Prompt 19 so there is one system, not two.',
      function (c) { return c.genre.id === 'narrative' ? 'This is a story game, so the text is the game. Keep the box readable, but still leave the art visible, and let a tap always move forward.' : 'During hard moments of play, show only a very short line (about 5 words) or none at all. A line must never hide ' + c.genre.threat + '.'; }
    ],
    dont: [
      'Do not cover the center of the screen or the player.',
      'Do not write long speeches or explain rules with dialogue. Learning happens by playing (Prompt 11).',
      'Do not freeze play to show a line unless a cinematic is running.',
      'Do not put system messages (rewards, warnings) in the dialogue box. They go to the log.'
    ],
    done: [
      'Characters react to real events with short lines in their own voices.',
      'The box fades in at the bottom, never covers the action, and never blocks input.',
      'A choice made earlier changes a later line.',
      'The same line never plays twice in a row.'
    ],
    test: [
      'Trigger the same event five times. The lines should vary and never repeat back to back.',
      'Make a choice, then trigger a later event. The line should show that the game remembers.',
      'Play a hard moment. The box should be tiny or absent and should never hide danger.',
      'Rotate a phone or use a notch phone. The box must stay inside the safe area.'
    ]
  });

  P.push({
    n: 21, id: 'finisher', title: 'Finisher moments', icon: 'p_finisher', rules: [18],
    goal: function (c) {
      return c.genre.combat
        ? 'Give ' + c.name + ' a few finisher moments: build-up, a slow-motion beat, a camera push and heavier effects, tied to the story. Only for the big moments (a boss, a turning point, the ending). Never on a normal kill. Always skippable.'
        : 'Give ' + c.name + ' (' + c.genre.label + ') a few finisher moments for its biggest beats (for example ' + c.genre.crisis + ' being beaten, or the final goal). Build-up, a slow-motion beat, a camera push and heavier effects, tied to the story. It has no fighting, so a finisher is about the biggest payoff, never an everyday event. Always skippable.';
    },
    look: [
      'List the big moments (3 to 5 at most): the ending, the biggest milestones from Prompt 5, the turning points from Prompt 19, and ' + 'the crisis moments from Prompt 16.',
      { f: 'hitstop', t: 'The hit-pause and slow-motion tools that already exist (Prompt 10). Reuse them.' },
      { f: 'particles', t: 'The shared particle pool and its cap from Prompt 17. The finisher must use it, not a new one.' },
      'How time works in the game: does everything use the same time scale, or are some timers real time? A slow-motion beat must slow the game world only, not the UI and not the skip button.'
    ],
    build: [
      'Write the finisher list in ' + MEM + ': each big moment, why it is big, and what story setup came before it. If a moment has no setup, say so. It does not get a finisher until it has one.',
      'Build ONE finisher runner with four steps: BUILD-UP (a short readable charge: the world goes quieter, the focus narrows), SLOW BEAT (the game world slows down for about half a second, ease in and ease out), CAMERA PUSH (a quick eased zoom toward the moment, then back), HEAVY IMPACT (the biggest effect in the game, using the shared particle pool and its cap).',
      'Put the numbers (slow-motion strength, push amount, lengths) in the same settings object as Prompt 10. Give them a reduce-motion setting that turns the slow-motion and push into a short fade only.',
      'Slow only the game world. The UI, the log and the skip tap keep running at normal speed.',
      'Make it skippable with ONE tap. Skipping jumps to the result and leaves the game in the same state as watching it fully. Test both.',
      'Tie it to the story: play a line from the dialogue system (Prompt 20) and, if one exists, a short cinematic beat (Prompt 19). Use the audio manager for one big sound and a music shift (Prompt 18), with the sounds that already exist.',
      'Add a guard so a finisher can only start from the big-moment list, never from a normal event. Add a counter for finishers per run to the debug view. If it ever goes above the planned number, show a warning there.',
      'Never start a finisher while another one, a cinematic or a popup is running.'
    ],
    dont: [
      'Do not use a finisher on normal kills, normal wins or normal purchases.',
      'Do not make a finisher longer than about 4 seconds without a skip.',
      'Do not create new particle systems or per-frame objects.',
      'Do not change difficulty or rewards.'
    ],
    done: [
      'Each big moment has build-up, a slow beat, a camera push and a heavy impact, and each one tells the player something.',
      'Normal events never trigger a finisher (check the counter).',
      'One tap skips and the game state is identical either way.',
      'Reduce-motion turns it into a gentle version.'
    ],
    test: [
      'Play to a big moment and watch it all the way. Then repeat it and skip with one tap. Compare the results: they must match.',
      'Play five normal minutes. The finisher counter should still say zero.',
      'Turn reduce-motion on and trigger the moment again. It must be gentle.',
      'Run it on the weakest phone with the debug view open. The frame rate must hold.'
    ]
  });

  P.push({
    n: 22, id: 'payoff', title: 'Emotional payoff', icon: 'p_emotion', rules: [19],
    goal: function (c) {
      return 'Plan the big feelings of ' + c.name + ' on purpose: a loss, a sacrifice, a reunion and a victory (only the ones that fit this game). Set each one up first. Then pay it off with the cinematic, the finisher, a music shift and a quiet moment.';
    },
    look: [
      'The story and cast from Prompt 19 and the milestones from Prompt 5.',
      'What the player already has a reason to care about (a character, a place, a thing they built, a streak they kept).',
      'The big moments list from Prompt 21 and the sound map from Prompt 18.',
      function (c) { return 'Which of loss, sacrifice, reunion and victory could really fit a ' + c.genre.label.toLowerCase() + ' game without feeling forced. Not every game needs all four.'; }
    ],
    build: [
      'Write a payoff plan in ' + MEM + ' as a table with one row per beat (loss, sacrifice, reunion, victory). For each row: does it fit this game (yes or no), what is SET UP before it (at least two earlier moments), where it lands, and which tools pay it off (cinematic, finisher, music shift, quiet moment).',
      'ASK ME which beats to keep, change or drop. Wait for my answer. Do not add any dark or heavy content I did not approve. Keep the tone the game already has.',
      'Build the SET-UP first, for each approved beat. Plant small moments earlier in play so the player cares: show the character or thing, give it one small good moment, let the player do something for it. Use short dialogue lines (Prompt 20) and the log, not long scenes.',
      'Build the PAYOFF for each approved beat in this order: the setup is recalled in one small moment, the cinematic (Prompt 19), the finisher only if the beat is a true big moment (Prompt 21), a music shift (Prompt 18), then a QUIET MOMENT.',
      'The quiet moment: about 3 to 5 seconds where the music drops to almost nothing, the interface fades out, nothing flashes and nothing moves except the one thing that matters. A tap continues. Never put a reward screen on top of it.',
      'A loss must be fair and never feel like a trick. It must not erase the player\'s saved progress as a punishment.',
      'Make every payoff play once, remember it in the save data (bump the save version, write the upgrade step) and never repeat it in a way that cheapens it.',
      'If no music file exists for the shift, do not download one. Tell me exactly where a music change would be needed so I can provide it.'
    ],
    dont: [
      'Do not invent a loss, a death or a betrayal I did not approve.',
      'Do not make the player feel punished. Sad is fine. Cheated is not.',
      'Do not skip the set-up. A payoff with no set-up is just noise.',
      'Do not add new systems. Use the cinematic, finisher, audio and dialogue tools that already exist.'
    ],
    done: [
      'Each approved beat has at least two set-up moments before it and a full payoff after it.',
      'Every payoff ends with a quiet moment and a music shift, or a note telling me where music is needed.',
      'Payoffs play once and are remembered after saving and loading.',
      'I approved the plan before it was built.'
    ],
    test: [
      'Play from the start to the first approved beat. Ask yourself: did I care before it happened?',
      'Watch the payoff. The quiet moment should be clearly quieter than everything around it.',
      'Save and reload after a payoff. It must not repeat.',
      'Give the game to someone new and watch their face at the payoff. Do not explain anything.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
