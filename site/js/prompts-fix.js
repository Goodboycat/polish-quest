/* Fix Kit: helper prompts for debug and polish days. Not part of the numbered order.
   Each: id, title, icon, blurb, params[{key,label,options[{id,label,text}]}], note (free text allowed), goal, input, steps, dont, done.
   Functions get (ctx, params). params may be empty: every function must still make sense. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var F = PQ.FIXKIT = PQ.FIXKIT || [];
  var MEM = 'PROJECT_MEMORY.md';

  function pick(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function noteLine(params, label) {
    var n = params && params.note ? String(params.note).trim() : '';
    return n ? label + ': ' + n.replace(/\s+/g, ' ').slice(0, 600) : '';
  }
  function compact(a) { return a.filter(function (x) { return x; }); }

  /* 1. One bug */
  F.push({
    id: 'bug', title: 'Fix one bug', icon: 'f_bug',
    blurb: 'One bug, one fix, one checkpoint. Stops fix-one-break-three.',
    params: [
      { key: 'kind', label: 'What kind of problem?', options: [
        { id: 'crash', label: 'It crashes or freezes', text: 'The game crashes or freezes.' },
        { id: 'wrong', label: 'It does the wrong thing', text: 'Something in the game does the wrong thing.' },
        { id: 'visual', label: 'It looks wrong', text: 'Something looks wrong on the screen.' },
        { id: 'input', label: 'A button or control fails', text: 'A button or control does not work like it should.' },
        { id: 'slow', label: 'It runs slow', text: 'The game runs slow or stutters.' },
        { id: 'sound', label: 'Sound is wrong', text: 'The sound is wrong, missing or too loud.' }
      ] },
      { key: 'when', label: 'How often?', options: [
        { id: 'always', label: 'Every time', text: 'It happens every time.' },
        { id: 'sometimes', label: 'Sometimes', text: 'It happens only sometimes, so a cause may be hard to see.' },
        { id: 'once', label: 'Only once so far', text: 'It happened only once so far.' }
      ] },
      { key: 'where', label: 'Where does it happen?', options: [
        { id: 'phone', label: 'Only on my phone', text: 'It happens on the phone and I am not sure about the computer.' },
        { id: 'both', label: 'Phone and computer', text: 'It happens on both phone and computer.' },
        { id: 'pc', label: 'Only on the computer', text: 'It happens on the computer and I am not sure about the phone.' }
      ] }
    ],
    goal: function (c, p) {
      return 'Fix exactly ONE bug in ' + c.name + ' without changing anything else. Find the real cause first. Do not stack guesses.';
    },
    input: function (c, p) {
      var kind = pick(F[0].params[0].options, p.kind);
      var when = pick(F[0].params[1].options, p.when);
      var where = pick(F[0].params[2].options, p.where);
      return compact([
        kind ? kind.text : 'There is a bug. I will describe it below.',
        when ? when.text : '',
        where ? where.text : '',
        noteLine(p, 'In my words')
      ]);
    },
    steps: [
      'Restate the bug in one sentence and ask me ONE question if anything is unclear. If I wrote nothing, ask me what I see, what I expected, and the steps to make it happen. Wait for my answer.',
      'Read ' + MEM + ' first (systems map and "Seen but not fixed"). Check whether this bug is already listed.',
      'Find a way to make the bug happen on demand. Write the exact steps. If you cannot make it happen, say so and tell me what to try or what to look at (the engine console or log), instead of guessing.',
      'Find the ROOT CAUSE. Say what it is in plain words and point to the file and the lines. Say how sure you are. If you are not sure, say "I am not sure" and list the two most likely causes.',
      'Tell me the smallest change that fixes the cause, and which files it touches. Wait for my OK only if the change touches more than two files or any system the memory file calls risky.',
      'Make that one change. Do not tidy, rename, reformat or improve anything nearby.',
      'Check the fix: repeat the steps from step 3. Then run the smoke test from ' + MEM + ' to make sure nothing else broke. Say plainly which steps you could not run yourself.',
      'If the fix did not work or broke something else, UNDO your change completely and tell me. Do not add a second fix on top.',
      'Add the bug, its cause and its fix to a "Bugs fixed" list in ' + MEM + '.'
    ],
    dont: [
      'Do not fix any other bug in this chat. Write other bugs in "Seen but not fixed" and leave them.',
      'Do not rewrite a system to fix a small bug.',
      'Do not hide an error by catching it and ignoring it. A hidden error is not a fix.',
      'Do not change settings, difficulty or numbers to dodge the bug.'
    ],
    done: [
      'I can repeat the steps and the bug no longer happens.',
      'The smoke test still passes (or I was told what to check by hand).',
      'Only the files the fix needed were changed, and the cause is written in the memory file.'
    ]
  });

  /* 2. Undo */
  F.push({
    id: 'undo', title: 'Undo the last change', icon: 'f_undo',
    blurb: 'Something broke after a prompt. Go back safely, without losing good work.',
    params: [
      { key: 'how', label: 'How far back?', options: [
        { id: 'last', label: 'Just the last change', text: 'Undo only the last change or checkpoint.' },
        { id: 'prompt', label: 'The whole last prompt', text: 'Undo everything the last prompt did.' },
        { id: 'known', label: 'Back to a checkpoint I name', text: 'Go back to a specific checkpoint that I will name.' }
      ] }
    ],
    goal: function (c, p) {
      return 'Take ' + c.name + ' back to a state that worked, without destroying anything that is not part of the problem. Show me what will be lost BEFORE you do anything.';
    },
    input: function (c, p) {
      var h = pick(F[1].params[0].options, p.how);
      return compact([h ? h.text : 'Go back to the last checkpoint that worked.', noteLine(p, 'What broke')]);
    },
    steps: function (c) {
      var hasGit = PQ.featureState(c, 'git') === 'found';
      var head = hasGit ? [
        'Show me the list of recent checkpoints (git log, one line each) and the current state (git status). Do not change anything yet.',
        'Tell me which checkpoint you think is the last good one and why. If you are not sure, ask me.',
        'Show me exactly which files and which changes will be lost if we go back (a short summary of the difference). Wait for my OK.',
        'If there are uncommitted changes, first save them somewhere safe (a new branch or a stash with a clear name) so nothing is lost for good. Tell me how to get them back.',
        'Go back by making a NEW commit that reverses the bad changes (git revert) when possible, so history is kept. Only use a harder reset if I clearly ask you to, and explain the risk first.'
      ] : [
        'Git was not found in this project. Do NOT guess. Tell me first whether a backup folder exists (for example backup-prompt-N) and let me confirm which one is good.',
        'Compare the backup with the current project and show me which files differ. Wait for my OK.',
        'Before replacing anything, copy the current broken state into a new folder named broken-state-copy so nothing is lost for good.',
        'Restore only the files that differ and are part of the problem. Do not copy over the memory file ' + MEM + ' without merging.'
      ];
      var tail = [
        'Run the smoke test from ' + MEM + ' and report each step as passed, failed or "check by hand".',
        'Update ' + MEM + ': what broke, what was undone, and which prompt should be redone later in a smaller way.',
        'Suggest ONE smaller way to try the same prompt again, in smaller steps.'
      ];
      return head.concat(tail);
    },
    dont: [
      'Do not delete anything for good without asking me first.',
      'Do not use force commands (like a hard reset or forced push) unless I clearly ask and you have explained the risk.',
      'Do not rewrite history that has been shared.',
      'Do not try to fix the problem in this chat. Go back first. Fixing is a separate step.'
    ],
    done: [
      'The game works like it did at the checkpoint, and the smoke test agrees.',
      'Nothing was lost that I did not approve, and the broken state is saved somewhere I can find it.',
      'The memory file says what happened.'
    ]
  });

  /* 3. Resume */
  F.push({
    id: 'resume', title: 'Resume after a cut chat', icon: 'f_pause',
    blurb: 'The chat got cut or the AI forgot. Rebuild the context fast.',
    params: [
      { key: 'state', label: 'What do you remember?', options: [
        { id: 'knowprompt', label: 'I know which prompt I was on', text: 'I know which prompt I was on. I will name it below.' },
        { id: 'unsure', label: 'I am not sure where I stopped', text: 'I am not sure where I stopped.' },
        { id: 'midtask', label: 'It stopped in the middle of a change', text: 'The chat was cut in the middle of a change, so some files may be half done.' }
      ] }
    ],
    goal: function (c) {
      return 'Rebuild what you need to continue ' + c.name + ' safely. You do not remember the earlier chat. Everything you need is in the files. Do not guess about anything that is not written there.';
    },
    input: function (c, p) {
      var s = pick(F[2].params[0].options, p.state);
      return compact([s ? s.text : 'The last chat was cut.', noteLine(p, 'The last thing I remember')]);
    },
    steps: function (c) {
      var hasGit = PQ.featureState(c, 'git') === 'found';
      return [
        'Read ' + MEM + ' completely, first. Tell me in 5 lines: what the game is, the engine, which prompts are done, the last thing recorded, and the protected files. If the file is missing, say so and stop. Ask me whether to start with Prompt 1.',
        hasGit ? 'Run git status and look at the last 10 checkpoints (git log). Tell me if there are uncommitted changes. Those may be from the cut chat.' : 'Git was not found. Look at the file dates to guess which files changed last, and say it is only a guess.',
        'If there are uncommitted or half-done changes: list them, say what each one seems to be for, and ask me whether to KEEP them, FINISH them or UNDO them. Do not decide yourself. Do not delete anything.',
        'Run the smoke test from ' + MEM + ' (or ask me to do it by hand) and tell me whether the game still works now.',
        'Tell me where we are and what the next step is, in the order of the prompt list. Say clearly what you could not check.',
        'Wait for me to say go. Do not start the next prompt on your own.'
      ];
    },
    dont: [
      'Do not assume you know what happened in the cut chat.',
      'Do not redo prompts that the memory file marks as done.',
      'Do not delete or overwrite half-done work before I decide.',
      'Do not start the next prompt until I say so.'
    ],
    done: [
      'I got a short, correct summary and I agree with it.',
      'Half-done changes (if any) have a decision from me.',
      'The game runs, or I know exactly what is broken.'
    ]
  });

  /* 4. Regression */
  F.push({
    id: 'regress', title: 'Something that worked broke', icon: 'f_frame',
    blurb: 'It used to work. Find which change broke it, then fix only that.',
    params: [
      { key: 'area', label: 'What stopped working?', options: [
        { id: 'move', label: 'Movement or controls', text: 'Movement or controls stopped working right.' },
        { id: 'ui', label: 'A menu or button', text: 'A menu, popup or button stopped working right.' },
        { id: 'save', label: 'Saving or loading', text: 'Saving or loading stopped working right.' },
        { id: 'fx', label: 'Looks or effects', text: 'Looks or effects changed or broke.' },
        { id: 'audio', label: 'Sound', text: 'Sound stopped working right.' },
        { id: 'feel', label: 'The game feels different', text: 'The game feels different (slower, harder, floatier or heavier) and I did not mean it to.' }
      ] },
      { key: 'since', label: 'When did it last work?', options: [
        { id: 'recent', label: 'A prompt or two ago', text: 'It worked a prompt or two ago.' },
        { id: 'long', label: 'Many prompts ago', text: 'It worked many prompts ago.' },
        { id: 'never', label: 'Not sure it ever did', text: 'I am not sure it ever worked.' }
      ] }
    ],
    goal: function (c) {
      return 'Find which change broke something that used to work in ' + c.name + ', then repair ONLY that. Prove the cause. Do not guess.';
    },
    input: function (c, p) {
      var a = pick(F[3].params[0].options, p.area), s = pick(F[3].params[1].options, p.since);
      return compact([a ? a.text : 'Something that used to work stopped working.', s ? s.text : '', noteLine(p, 'What I see')]);
    },
    steps: function (c) {
      var hasGit = PQ.featureState(c, 'git') === 'found';
      return [
        'Read ' + MEM + ': which prompts are done and which files each one changed. The suspects are the prompts after the last time it worked.',
        'Write the exact steps to see the problem. Ask me ONE question if you cannot.',
        hasGit ? 'Find the change that broke it by checking earlier checkpoints one at a time (a bisect by hand: test the middle checkpoint, then go earlier or later). Always put the project back to the latest state when you are done, and tell me before you switch checkpoints.' : 'Git was not found. Use the backup folders and the "files changed" lists in ' + MEM + ' to find the first prompt that touched this area. Say it is a likely cause and not proof.',
        'Name the change that broke it and say why. Show the old lines and the new lines.',
        'Fix the break in the smallest way that keeps what the later prompt was trying to do. If the two goals cannot both be kept, tell me and let me choose.',
        'Run the steps again, then run the smoke test. Say plainly what you could not run.',
        'Add a line to ' + MEM + ' under "Watch out": what broke, which change did it, and how to avoid it. Add a smoke test step for this area if it is missing, so it is caught next time.'
      ];
    },
    dont: [
      'Do not revert whole prompts unless I agree. Fix the break itself.',
      'Do not touch anything outside the broken area.',
      'Do not change numbers to hide a feel change. Find what changed the feel.'
    ],
    done: [
      'I know which change broke it, in plain words.',
      'The area works again and the later work is still there.',
      'The smoke test now covers this area.'
    ]
  });

  /* 5. Softlock */
  F.push({
    id: 'softlock', title: 'The game gets stuck', icon: 'f_phone',
    blurb: 'A softlock: the game runs, but the player cannot go on.',
    params: [
      { key: 'stuck', label: 'How is it stuck?', options: [
        { id: 'popup', label: 'A popup or screen will not close', text: 'A popup or screen will not close.' },
        { id: 'noinput', label: 'Taps or keys do nothing', text: 'Taps or keys do nothing, but the game is still running.' },
        { id: 'noexit', label: 'No way forward in a level', text: 'There is no way forward in a level or room.' },
        { id: 'goal', label: 'A goal can never finish', text: 'A goal can never finish.' },
        { id: 'black', label: 'Black or frozen screen', text: 'The screen goes black or freezes but the game seems to be running.' },
        { id: 'save', label: 'It is stuck after loading', text: 'It gets stuck after loading a save.' }
      ] }
    ],
    goal: function (c) {
      return 'Find why ' + c.name + ' can get into a state the player cannot leave, and make sure it can never happen again. Add a safe way out as a second layer.';
    },
    input: function (c, p) {
      var s = pick(F[4].params[0].options, p.stuck);
      return compact([s ? s.text : 'The player can get stuck.', noteLine(p, 'What I was doing')]);
    },
    steps: [
      'Ask me for the exact steps that lead to it, if I did not write them. Try them yourself. If you cannot make it happen, say so.',
      'Draw the state in words: what is on the screen, what the game thinks is happening (which popup or mode is active, what is paused, what input is blocked), and what is waiting for what.',
      'Find the ROOT CAUSE: usually something that waits for an event that never comes, a state that has no exit, two things blocking each other, or input being swallowed. Say it in plain words and point to the code.',
      'Fix the cause with the smallest change.',
      'Add a SAFE WAY OUT: a one-tap escape that always works (for example back or close on any popup, restart the room, back to title). It must obey the one-tap rule and must not lose the player\'s progress.',
      'Add a small watchdog to the debug view: if no input is accepted for a long time while the game claims to be running, write the active mode and popup into the local error log.',
      'Check all the other places that use the same pattern. List them. Do not change them yet. Write them in "Seen but not fixed" and ask me.',
      'Test: repeat the steps, then try to get stuck on purpose in two more ways. Run the smoke test. Say what you could not run.'
    ],
    dont: [
      'Do not just add a timer that closes things by itself. Find the cause.',
      'Do not change the level design or the rules.',
      'Do not fix the other places with the same pattern before I say so.'
    ],
    done: [
      'The steps no longer get the player stuck.',
      'There is a one-tap way out in every screen touched by the fix.',
      'The other places with the same pattern are written down for me.'
    ]
  });

  /* 6. Save safety */
  F.push({
    id: 'savesafe', title: 'Save safety check', icon: 'f_save',
    blurb: 'Make sure players never lose progress, even after updates.',
    params: [
      { key: 'issue', label: 'Is there a problem now?', options: [
        { id: 'none', label: 'No, I want a safety check', text: 'No problem yet. I want a safety check before I release or add more.' },
        { id: 'lost', label: 'Progress was lost', text: 'Saved progress was lost.' },
        { id: 'old', label: 'Old saves do not load', text: 'Old saves do not load after I changed the game.' },
        { id: 'corrupt', label: 'A save looks damaged', text: 'A save looks damaged or loads wrong values.' }
      ] }
    ],
    goal: function (c) {
      var has = PQ.featureState(c, 'saveSystem') !== 'none';
      return has
        ? 'Check that ' + c.name + ' saves safely: no lost progress, old saves still load after updates, damaged saves never crash the game.'
        : 'The scan did not find a save system in ' + c.name + '. First confirm that with me. If there really is none, ask me whether I want one before building anything.';
    },
    input: function (c, p) {
      var s = pick(F[5].params[0].options, p.issue);
      return compact([s ? s.text : 'I want a safety check.', noteLine(p, 'What happened')]);
    },
    steps: [
      'Read ' + MEM + ' and find the save code. List what is saved, where it is stored, and when a save happens.',
      'Check the save version: is there a number, and is there a step that upgrades older saves? If not, add them as the first change, in the smallest way.',
      'Make a test: take a copy of a save from an older checkpoint (or write one by hand) and load it with the current game. It must load, with sensible defaults for new fields. Tell me what happened.',
      'Test a missing save, an empty save, and a damaged save (cut it in half or add junk). The game must start fresh or from the backup, tell the player gently in the log, and never crash.',
      'Make saving safe against being cut in the middle (a phone call, closing the browser): write to a temporary copy first, then replace the real save only when the write is complete, and keep the last good save as a backup.',
      'Check that nothing important is saved only in memory (like unlocked abilities, goals, seen cinematics, pointers shown, settings). List what is missing and ask me before adding.',
      'If progress was lost for me, find out how, using the steps I gave, before changing anything. Do not guess.',
      'Write a "Save rules" section in ' + MEM + ': the current version number and what changed in each version. Add loading an old save to the smoke test.'
    ],
    dont: [
      'Do not delete or overwrite any existing save without my OK and a backup copy.',
      'Do not change what gets saved without telling me.',
      'Do not send saves anywhere. They stay on the device.'
    ],
    done: [
      'An old save, a missing save and a damaged save all load without a crash.',
      'The save has a version number and an upgrade step.',
      'Saving cannot leave a half-written save behind.',
      'The memory file lists the save rules and the smoke test covers loading an old save.'
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
