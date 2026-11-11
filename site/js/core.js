/* Polish Quest - prompt render engine. Pure functions, no DOM, no network. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  PQ.PROMPTS = PQ.PROMPTS || [];   // filled by prompts-*.js
  PQ.FIXKIT = PQ.FIXKIT || [];

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  PQ.engineById = function (id) { return byId(PQ.ENGINES, id) || byId(PQ.ENGINES, 'unknown'); };
  PQ.genreById = function (id) { return byId(PQ.GENRES, id) || byId(PQ.GENRES, 'other'); };
  PQ.deviceById = function (id) { return byId(PQ.DEVICES, id) || byId(PQ.DEVICES, PQ.DEFAULT_DEVICE); };

  /* Build the context used by every prompt from the (editable) scan result. */
  PQ.makeCtx = function (scan) {
    scan = scan || {};
    var e = PQ.engineById(scan.engineId), gn = PQ.genreById(scan.genreId), d = PQ.deviceById(scan.deviceId || PQ.DEFAULT_DEVICE);
    return {
      name: (scan.name && String(scan.name).trim()) || 'my game',
      engine: e, genre: gn, device: d,
      protect: (scan.protect || []).slice(),
      features: scan.features || {},
      memoryFile: scan.memoryFile || '',
      entry: scan.entry || '',
      model: PQ.MODEL
    };
  };

  function st(ctx, key) { return (ctx.features && ctx.features[key]) || 'none'; }
  PQ.featureState = st;

  function tag(ctx, item) {
    if (typeof item === 'function') item = item(ctx);
    if (typeof item === 'string') return item;
    var s = item.f ? st(ctx, item.f) : 'none', t = typeof item.t === 'function' ? item.t(ctx) : item.t;
    if (s === 'found') return '[ALREADY IN THE GAME - check it works, do not rebuild] ' + t;
    if (s === 'maybe') return '[CHECK FIRST - something like this may already exist] ' + t;
    return t;
  }
  function val(ctx, v, params) { return typeof v === 'function' ? v(ctx, params) : v; }
  function list(ctx, arr, params) { return (val(ctx, arr, params) || []).map(function (x) { if (typeof x === 'function') x = x(ctx, params); return (x && typeof x === 'object') ? tag(ctx, x) : x; }); }

  /* How much of a prompt's build list the scan says already exists: 0..1 */
  PQ.coverage = function (p, ctx) {
    var items = (val(ctx, p.build) || []).filter(function (x) { return typeof x === 'object' && x.f; });
    if (!items.length) return { ratio: 0, tracked: 0, found: 0 };
    var f = 0; items.forEach(function (x) { var s = st(ctx, x.f); if (s === 'found') f += 1; else if (s === 'maybe') f += 0.5; });
    return { ratio: f / items.length, tracked: items.length, found: f };
  };

  function checkpointLine(ctx, p) {
    var label = 'Prompt ' + p.n + ': ' + p.title;
    if (st(ctx, 'git') === 'found')
      return 'Save a checkpoint: make a git commit with the message "' + label + '". If the commit fails, tell me why and stop.';
    return 'Save a checkpoint. Git was not found in this project, so ask me if I want you to run git init and commit. If I say no, tell me to copy the whole project folder to a new folder named backup-prompt-' + p.n + ' before we go on.';
  }
  function memName(ctx) { return 'PROJECT_MEMORY.md'; }
  PQ.memName = memName;

  function sec(title, lines, numbered) {
    if (!lines || !lines.length) return '';
    var out = title + '\n';
    lines.forEach(function (l, i) { out += (l.charAt(0) === ' ' ? '    ' + l.trim() : (numbered ? (i + 1) + '. ' : '- ') + l) + '\n'; });
    return out + '\n';
  }

  function protectLines(ctx) {
    var out = [];
    if (ctx.protect.length) { out.push('These files and folders must never be edited (read them if you must, never write):'); ctx.protect.forEach(function (x) { out.push('  ' + x); }); }
    else out.push('The scan found no protected files. Before you touch anything generated, third-party or binary, stop and ask me.');
    out.push(ctx.engine.risky);
    return out;
  }

  PQ.renderPrompt = function (p, ctx) {
    var cov = PQ.coverage(p, ctx), t = '';
    t += 'PROMPT ' + p.n + ' of ' + PQ.STEP_COUNT + ' - ' + p.title.toUpperCase() + '\n';
    t += 'Game: ' + ctx.name + ' (' + ctx.genre.label + ', ' + ctx.engine.label + ')\n';
    if (p.rules && p.rules.length) {
      t += 'Rules this serves: ' + p.rules.map(function (n) { var r = PQ.RULES[n - 1]; return n + ' ' + r.title; }).join(', ') + '\n';
    }
    t += '\n';
    if (cov.tracked >= 2 && cov.ratio >= 0.6)
      t += 'HEADS UP: the scan found most of this already in the game. Spend your first step only checking it. If it works, say so, update the memory file and skip to FINISH.\n\n';
    t += 'GOAL\n' + val(ctx, p.goal) + '\n\n';
    t += sec('LOOK AT FIRST (read only, change nothing yet)', list(ctx, p.look));
    t += sec('BUILD (small steps, in this order)', (val(ctx, p.build) || []).map(function (x) { return tag(ctx, x); }), true);
    var dont = list(ctx, p.dont).concat(['Anything outside this prompt\'s goal. If you spot another problem, write it under "Seen but not fixed" in the memory file and leave it.'], protectLines(ctx));
    t += sec('DO NOT TOUCH', dont);
    t += sec('DONE WHEN', list(ctx, p.done));
    t += sec('QUICK TEST (' + ctx.engine.run + ')', list(ctx, p.test), true);
    var fin = [
      'Update ' + memName(ctx) + ': mark Prompt ' + p.n + ' as done, list every file you changed, and write down anything you saw but did not fix.',
      checkpointLine(ctx, p),
      'Run the smoke test from ' + memName(ctx) + (p.n >= 3 ? ' and tell me what passed. Say plainly which steps you could not run yourself.' : ' if one exists yet. (It is created in Prompt 3.)'),
      'Tell me in plain words: what changed, how I can check it in 3 steps, and what is left. Then stop. ' + (p.n >= PQ.STEP_COUNT ? 'This was the last prompt. Do not start anything new.' : 'Do not start Prompt ' + (p.n + 1) + '.')
    ];
    t += sec('FINISH (always)', fin, true);
    return t.replace(/\n+$/, '\n');
  };

  PQ.renderPrompt0 = function (ctx) {
    var t = 'GROUND RULES - paste this first in every new chat about ' + ctx.name + '.\n\n';
    t += 'PROJECT\n';
    t += '- Game: ' + ctx.name + '\n- Type: ' + ctx.genre.label + '\n- Built with: ' + ctx.engine.label + ' (' + ctx.engine.lang + ')\n';
    t += '- How it runs: ' + ctx.engine.run + '\n';
    t += '- Weakest phone I must support: ' + ctx.device.label + '. ' + ctx.device.rule + '\n';
    t += '- Standard model for this project: ' + ctx.model + '\n';
    t += '- Memory file: ' + memName(ctx) + '. Read it first in every chat. Update it last.\n';
    if (ctx.memoryFile) t += '- A notes file already exists (' + ctx.memoryFile + '). Never delete it.\n';
    t += '\nFILES YOU MUST NEVER EDIT\n' + protectLines(ctx).map(function (l) { return (l.charAt(0) === ' ' ? '' : '- ') + l; }).join('\n') + '\n';
    t += '\nHOW WE WORK\n';
    [
      'One prompt at a time. I will paste the next one when I am ready. Never jump ahead.',
      'Small changes only. Never rewrite something that already works. If a system works, leave it alone.',
      'Look first, change second. Before you edit, tell me which files you plan to touch and why.',
      'Ask when you are not sure. Do not guess quietly. If you cannot tell what the game does, ask me.',
      'Never claim you tested something you did not run. If you cannot run the game, say so and tell me what to check by hand.',
      'Do not invent facts about the engine, its functions or its limits. If you are not sure, say "I am not sure" and look at the project files or the official docs.',
      'Do not add network calls, analytics, trackers, ads, accounts, login or outside downloads to the game. Keep it fully local unless I ask.',
      'Do not use emoji characters as in-game icons. They look different on every phone. Use drawn or imported art.',
      'After every prompt: update ' + memName(ctx) + ', save a checkpoint, run the smoke test (it exists after Prompt 3), and report in this format: what changed, how I check it in 3 steps, what is left.',
      'If something breaks, stop. Do not stack fixes. Tell me what broke and offer to undo the last change.',
      'Use the existing code style and names. Add new code in small separate modules. Do not reformat files you are not changing.'
    ].forEach(function (x, i) { t += (i + 1) + '. ' + x + '\n'; });
    t += '\nTHE 19 RULES (every prompt serves one or more of these)\n';
    PQ.RULES.forEach(function (r) { t += r.n + '. ' + r.title + ': ' + r.text + '\n'; });
    t += '\nORDER OF PROMPTS\n';
    PQ.PROMPTS.forEach(function (p) { t += p.n + '. ' + p.title + '\n'; });
    t += '\nPlease confirm you understood by replying with: the game name, the engine, the weakest phone, and the list of files you will never edit. Then wait for Prompt 1.\n';
    return t;
  };

  /* Fix Kit: params are tap choices from the UI, free text is optional. */
  PQ.renderFix = function (f, ctx, params) {
    params = params || {};
    var t = 'FIX KIT - ' + f.title.toUpperCase() + '\nGame: ' + ctx.name + ' (' + ctx.genre.label + ', ' + ctx.engine.label + ')\n\n';
    t += 'GOAL\n' + val(ctx, f.goal, params) + '\n\n';
    if (f.input) { var inp = f.input(ctx, params); if (inp && inp.length) t += sec('WHAT I SEE', inp); }
    t += sec('STEPS', list(ctx, f.steps, params), true);
    t += sec('DO NOT TOUCH', protectLines(ctx).concat(list(ctx, f.dont, params)));
    t += sec('DONE WHEN', list(ctx, f.done, params));
    t += 'FINISH\nUpdate ' + memName(ctx) + ' (what happened and what you changed), ' + (st(ctx, 'git') === 'found' ? 'make a git commit with a clear message' : 'tell me how to save a checkpoint') + ', then stop and wait for me.\n';
    return t;
  };

  /* Safety net used by tests and by the page: no leftover placeholders. */
  PQ.lint = function (text) {
    var bad = [];
    if (/\{\{|\}\}|\[\[|\]\]/.test(text)) bad.push('placeholder brackets');
    if (/\bundefined\b|\bNaN\b|\[object /.test(text)) bad.push('undefined/NaN/object leak');
    if (/\bnull\b/.test(text)) bad.push('null leak');
    return bad;
  };

  PQ.fullText = function (ctx) {
    var out = [PQ.renderPrompt0(ctx)];
    PQ.PROMPTS.forEach(function (p) { out.push(PQ.renderPrompt(p, ctx)); });
    return out.join('\n' + new Array(61).join('=') + '\n\n');
  };
})(typeof window !== 'undefined' ? window : globalThis);
