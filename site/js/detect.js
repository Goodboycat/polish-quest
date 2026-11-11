/* Polish Quest - detector. Reads a game zip (through PQ.zip) and fills in the "scan result".
   Classic script (ES5 style), no network, nothing stored. Needs data.js and zip.js loaded first.
   Result shape:
   { name, nameSure, engineId, engineSure, engineWhy, engineAlts[], genreId, genreSure, genreAlts[],
     features{key:'found'|'maybe'|'none'}, evidence{key:[paths]}, protect[], memoryFile, entry,
     stats{files, read, bytes, skipped}, notes[], questions[] } */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var D = PQ.detect = {};

  var BUDGET = { maxFiles: 320, maxBytes: 6 * 1024 * 1024, perFile: 300 * 1024, manifestBytes: 96 * 1024, parallel: 4 };
  D.BUDGET = BUDGET;

  var SKIPDIRS = { 'node_modules': 1, 'library': 1, 'temp': 1, 'obj': 1, 'logs': 1, 'usersettings': 1, '.git': 1, '.godot': 1, '.import': 1,
    'binaries': 1, 'intermediate': 1, 'deriveddatacache': 1, 'saved': 1, 'build': 1, 'dist': 1, 'target': 1, '.venv': 1, 'venv': 1,
    '__pycache__': 1, '.gradle': 1, '.idea': 1, '.vs': 1, '.vscode': 1, '__macosx': 1, 'bin': 1, 'pods': 1, '.next': 1, 'coverage': 1,
    'vendor': 1, 'vendors': 1, 'libs': 1, 'third_party': 1, 'thirdparty': 1, 'third-party': 1, 'textmesh pro': 1, 'plugins~': 1 };
  var CODE_EXT = /\.(js|mjs|cjs|ts|tsx|jsx|html|htm|lua|py|gd|cs|cpp|cc|h|hpp|c|rs|dart|java|kt|gml|rpy|tscn|tres|cfg|ini|toml|gradle|json|md|txt|yml|yaml|project|uproject|yyp|csproj)$/i;
  var STRONG_CODE = /\.(js|mjs|cjs|ts|tsx|jsx|lua|py|gd|cs|cpp|cc|h|hpp|c|rs|dart|java|kt|gml|rpy|tscn|html|htm)$/i;
  var MEM_NAMES = ['project_memory.md', 'claude.md', 'agents.md', 'gemini.md', 'notes.md', 'devlog.md', 'todo.md', '.cursorrules'];

  function lower(s) { return String(s).toLowerCase(); }
  function base(p) { var i = p.lastIndexOf('/'); return i < 0 ? p : p.slice(i + 1); }
  function ext(p) { var m = /\.[A-Za-z0-9]+$/.exec(p); return m ? lower(m[0]) : ''; }
  function depth(p) { return p.split('/').length - 1; }

  /* The folder that holds the whole project inside the zip (many zips wrap everything in one folder). */
  function findRoot(entries) {
    var first = null;
    for (var i = 0; i < entries.length; i++) {
      var n = entries[i].name;
      if (/^__MACOSX\//.test(n) || /(^|\/)\.DS_Store$/.test(n)) continue;
      var k = n.indexOf('/');
      if (k < 0) return '';                          // a file at the top: no wrapper
      var seg = n.slice(0, k + 1);
      if (first === null) first = seg; else if (first !== seg) return '';
    }
    return first || '';
  }

  function isSkipped(path) {
    var segs = lower(path).split('/');
    for (var i = 0; i < segs.length - 1; i++) if (SKIPDIRS[segs[i]]) return true;
    return false;
  }
  function isVendorFile(path) {
    var b = lower(base(path));
    if (/\.min\.(js|css)$/.test(b)) return true;
    if (/^(phaser|three|pixi|babylon|kaboom|kaplay|p5|howler|jquery|excalibur|melonjs|playcanvas|pixi\.min|gsap|matter|cannon|ammo)[\w.\-]*\.js$/.test(b)) return true;
    if (/^(rpg_(core|managers|objects|scenes|sprites|windows)|rmmz_(core|managers|objects|scenes|sprites|windows)|pixi|fpsmeter|lz-string)\.js$/.test(b)) return true;
    return false;
  }

  function mapLimit(items, limit, fn, onStep) {
    return new Promise(function (resolve) {
      var i = 0, active = 0, done = 0, n = items.length;
      if (!n) return resolve();
      function next() {
        while (active < limit && i < n) {
          (function (idx) {
            active++;
            Promise.resolve().then(function () { return fn(items[idx], idx); }).catch(function () { }).then(function () {
              active--; done++; if (onStep) onStep(done, n);
              if (done >= n) resolve(); else next();
            });
          })(i++);
        }
      }
      next();
    });
  }

  function prettyName(s) {
    s = String(s || '').replace(/\.[A-Za-z0-9]{1,5}$/, '').replace(/[-_.]+(v?\d+(\.\d+)*|final|build|release|export|backup|copy)$/i, '');
    s = s.replace(/\s*\(\d+\)\s*$/, '').trim();
    if (!/\s/.test(s) && /[-_]/.test(s)) s = s.replace(/[-_]+/g, ' ');
    else if (!/\s/.test(s) && /[a-z][A-Z]/.test(s)) s = s.replace(/([a-z])([A-Z])/g, '$1 $2');
    if (s === lower(s)) s = s.replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    return s.trim().slice(0, 60);
  }
  var GENERIC_NAMES = /^(webapp|my[- ]?game|game|app|project|untitled|new[- ]?project|test|demo|vite[- ]?project|react[- ]?app|unnamed|sample|template|phaser[- ]?game|index)$/i;

  /* ---------- engine rules ---------- */
  function hasPath(idx, rx) { for (var i = 0; i < idx.paths.length; i++) if (rx.test(idx.paths[i])) return idx.paths[i]; return null; }
  function mk(id) { return { id: id, score: 0, why: [] }; }

  function engineFromMarkers(idx, man) {
    var S = {}; PQ.ENGINES.forEach(function (e) { S[e.id] = mk(e.id); });
    function add(id, pts, why) { if (!S[id]) return; S[id].score += pts; if (why) S[id].why.push(why); }
    var p;
    if (hasPath(idx, /^ProjectSettings\/ProjectVersion\.txt$/i)) add('unity', 10, 'a ProjectSettings folder with ProjectVersion.txt');
    else if (hasPath(idx, /^Assets\//) && hasPath(idx, /\.meta$/)) add('unity', 6, 'an Assets folder with .meta files');
    if (hasPath(idx, /^Packages\/manifest\.json$/i)) add('unity', 3, 'Packages/manifest.json');
    if ((p = hasPath(idx, /(^|\/)project\.godot$/i))) add('godot', 10, 'project.godot');
    if (hasPath(idx, /\.tscn$/i)) add('godot', 3, '.tscn scene files');
    if ((p = hasPath(idx, /\.uproject$/i))) add('unreal', 10, base(p));
    if (hasPath(idx, /^Content\/.*\.uasset$/i)) add('unreal', 4, '.uasset files');
    if ((p = hasPath(idx, /\.yyp$/i))) add('gamemaker', 10, base(p));
    if (hasPath(idx, /\.gml$/i)) add('gamemaker', 3, '.gml scripts');
    if (hasPath(idx, /(^|\/)(rmmz_core|rpg_core)\.js$/i) || hasPath(idx, /\.(rpgproject|rmmzproject|rmmvproject)$/i)) add('rpgmaker', 10, 'RPG Maker core files');
    if (hasPath(idx, /\.c3p$/i) || hasPath(idx, /(^|\/)c3runtime\.js$/i)) add('construct', 10, 'Construct runtime files');
    if (hasPath(idx, /(^|\/)(gdjs|runtimegame)[\w.\-]*\.js$/i)) add('gdevelop', 6, 'GDevelop runtime files');
    if (man['game.json'] && /gdVersion|"gdjs"|GDJS/i.test(man['game.json'])) add('gdevelop', 10, 'game.json made by GDevelop');
    if (hasPath(idx, /(^|\/)cocos-js\//i) || hasPath(idx, /(^|\/)\.creator\//i) || hasPath(idx, /(^|\/)cc\.js$/i)) add('cocos', 9, 'Cocos Creator files');
    if ((p = hasPath(idx, /(^|\/)game\.project$/i))) add('defold', 10, 'game.project');
    if (hasPath(idx, /(^|\/)main\.lua$/i)) { add('love', 4, 'main.lua'); if (hasPath(idx, /(^|\/)conf\.lua$/i)) add('love', 3, 'conf.lua'); }
    if (hasPath(idx, /\.rpy$/i)) add('renpy', 8, '.rpy scripts');
    if (hasPath(idx, /(^|\/)renpy\//i)) add('renpy', 4, 'a renpy folder');
    if (man['cargo.toml'] && /\bbevy\b/i.test(man['cargo.toml'])) add('bevy', 10, 'Cargo.toml lists bevy');
    if (man['pubspec.yaml'] && /^\s*flame\s*:/mi.test(man['pubspec.yaml'])) add('flame', 10, 'pubspec.yaml lists flame');
    var gr = (man['build.gradle'] || '') + (man['settings.gradle'] || '');
    if (/libgdx|com\.badlogic\.gdx/i.test(gr)) add('libgdx', 10, 'Gradle files list libGDX');
    if (hasPath(idx, /\.mgcb$/i)) add('monogame', 8, 'a .mgcb content file');
    if (man['.csproj'] && /MonoGame/i.test(man['.csproj'])) add('monogame', 10, 'a .csproj that lists MonoGame');
    var pj = man['package.json'] || '';
    function dep(rx, id, why) { if (rx.test(pj)) add(id, 10, why); }
    dep(/"phaser"\s*:/i, 'phaser', 'package.json lists phaser');
    dep(/"three"\s*:/i, 'three', 'package.json lists three');
    dep(/"(pixi\.js|@pixi\/[\w-]+|pixi\.js-legacy)"\s*:/i, 'pixi', 'package.json lists pixi');
    dep(/"(babylonjs|@babylonjs\/[\w-]+)"\s*:/i, 'babylon', 'package.json lists babylon');
    dep(/"(kaplay|kaboom)"\s*:/i, 'kaplay', 'package.json lists kaplay or kaboom');
    dep(/"excalibur"\s*:/i, 'excalibur', 'package.json lists excalibur');
    dep(/"melonjs"\s*:/i, 'melon', 'package.json lists melonjs');
    dep(/"p5"\s*:/i, 'p5', 'package.json lists p5');
    dep(/"playcanvas"\s*:/i, 'playcanvas', 'package.json lists playcanvas');
    var h = man['index.html'] || '';
    [['phaser', /phaser[\w.\-]*\.js/i], ['three', /three[\w.\-]*\.js/i], ['pixi', /pixi[\w.\-]*\.js/i], ['babylon', /babylon[\w.\-]*\.js/i],
     ['kaplay', /(kaplay|kaboom)[\w.\-]*\.js/i], ['excalibur', /excalibur[\w.\-]*\.js/i], ['melon', /melonjs[\w.\-]*\.js/i],
     ['p5', /p5[\w.\-]*\.js/i], ['playcanvas', /playcanvas[\w.\-]*\.js/i]].forEach(function (r) {
      if (r[1].test(h) || hasPath(idx, new RegExp('(^|/)' + r[1].source, 'i'))) add(r[0], 6, 'a ' + r[0] + ' script file');
    });
    if (hasPath(idx, /\.py$/i)) add('pygame', 1, 'Python files');
    if (hasPath(idx, /(^|\/)index\.html$/i) && (hasPath(idx, /\.js$/i) || hasPath(idx, /\.ts$/i))) add('web', 3, 'index.html with JavaScript');
    // plain web game written inside the HTML files themselves (inline <script>, a <canvas>), no separate .js file
    if (!S.web && (/<canvas\b/i.test(h) || /<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]{40,}/i.test(h)) && /canvas|requestAnimationFrame|getContext/i.test(h)) add('web', 4, 'index.html with a canvas and inline JavaScript');
    return S;
  }

  var ENGINE_HINTS = [
    ['phaser', /\bnew Phaser\b|\bPhaser\.(Game|Scene|AUTO|CANVAS|WEBGL)\b/], ['three', /from ['"]three['"]|\bTHREE\.[A-Z]|new THREE\./],
    ['pixi', /\bPIXI\.|from ['"]pixi\.js['"]|@pixi\//], ['babylon', /\bBABYLON\.|@babylonjs/], ['kaplay', /\b(kaplay|kaboom)\s*\(/],
    ['excalibur', /\bex\.Engine\b|from ['"]excalibur['"]/], ['melon', /\bme\.(game|video|state|loader)\b|melonjs/], ['p5', /\bcreateCanvas\s*\(/],
    ['playcanvas', /\bpc\.(Application|Entity)\b|playcanvas/], ['gdevelop', /\bgdjs\./], ['construct', /\bC3\.Runtime\b|c3runtime/],
    ['love', /\blove\.(graphics|update|draw|load|keyboard)\b/], ['pygame', /\bimport pygame\b|\bfrom pygame\b/], ['unity', /using UnityEngine/],
    ['godot', /^extends (Node|Control|CharacterBody|Node2D|Node3D|Area2D|Sprite2D)\w*|@onready\b|@export\b/m],
    ['monogame', /using Microsoft\.Xna\.Framework/], ['libgdx', /com\.badlogic\.gdx/], ['flame', /package:flame\//], ['bevy', /\buse bevy::/],
    ['unreal', /#include "(CoreMinimal|GameFramework)/], ['cocos', /from ['"]cc['"]/], ['defold', /\bgo\.property\b|\bmsg\.post\b/],
    ['renpy', /^label\s+\w+:/m], ['rpgmaker', /\$gameTemp|\$dataMap|Game_Interpreter|PluginManager\.registerCommand/]
  ];

  /* ---------- genre ---------- */
  var NOISY = {};
  ['base', 'build', 'resource', 'path', 'room', 'floor', 'order', 'shop', 'speed', 'turn', 'hand', 'note', 'lane', 'car', 'unit', 'season', 'wave',
   'seed', 'stats', 'weapon', 'attack', 'tile', 'grid', 'manage', 'choice', 'branch', 'chapter', 'ending', 'combo', 'level up', 'solve', 'draw pile',
   'run ', 'label', 'obstacle', 'beat', 'party', 'spell', 'swap', 'match', 'checkpoint', 'jump', 'ammo', 'dodge', 'jump', 'dialogue', 'platform'].forEach(function (k) { NOISY[k] = 1; });

  function normText(t) {
    return ' ' + String(t).replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  }
  function kwRegex(kw) {
    var k = lower(kw).replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!k) return null;
    return new RegExp('\\s' + k.replace(/ /g, '\\s') + '(?:s|es|ing|ed|er|ers)?\\s', 'g');
  }
  var KW_CACHE = null;
  function kwTable() {
    if (KW_CACHE) return KW_CACHE;
    KW_CACHE = PQ.GENRES.map(function (gn) {
      return { id: gn.id, kws: (gn.kw || []).map(function (kw) { var k = lower(kw).replace(/[^a-z0-9 ]+/g, ' ').trim(); return { k: k, rx: kwRegex(kw), noisy: !!(NOISY[k] || NOISY[lower(kw)]) }; }).filter(function (x) { return x.rx; }) };
    });
    return KW_CACHE;
  }

  function scoreGenres(pathsNorm, codeNorm) {
    var table = kwTable(), out = [];
    table.forEach(function (gt) {
      var s = 0, hits = [];
      gt.kws.forEach(function (kw) {
        var w = kw.noisy ? 0.4 : 1;
        var pc = (pathsNorm.match(kw.rx) || []).length;   // each path is one chunk of text
        var cc = (codeNorm.match(kw.rx) || []).length;
        var pts = Math.min(pc, 2) * 3 * w + Math.min(cc, 5) * w;
        if (pts > 0) { s += pts; hits.push(kw.k); }
      });
      out.push({ id: gt.id, score: s, hits: hits });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out;
  }

  /* ---------- protect list ---------- */
  function buildProtect(idx, engineId, memoryFile) {
    var out = [];
    var rootDirs = {}, rootFiles = {};
    idx.paths.forEach(function (p) {
      var k = p.indexOf('/');
      if (k >= 0) rootDirs[p.slice(0, k + 1)] = 1; else rootFiles[p] = 1;
    });
    function dir(d) { if (rootDirs[d]) out.push(d); }
    ['node_modules/', '.git/', 'dist/', 'build/', 'Library/', 'Temp/', 'Obj/', 'obj/', 'Logs/', 'UserSettings/', '.godot/', '.import/', 'Binaries/', 'Intermediate/',
     'DerivedDataCache/', 'Saved/', 'target/', '.venv/', 'venv/', '__pycache__/', '.gradle/', 'Pods/', 'vendor/', 'libs/', 'third_party/', 'ThirdParty/'].forEach(dir);
    if (rootDirs['lib/'] && ['unity', 'godot', 'flame'].indexOf(engineId) < 0) out.push('lib/');
    if (engineId === 'unity') { dir('ProjectSettings/'); if (idx.set['Assets/Plugins/'] || hasPath(idx, /^Assets\/Plugins\//)) out.push('Assets/Plugins/'); if (hasPath(idx, /^Assets\/TextMesh Pro\//)) out.push('Assets/TextMesh Pro/'); if (hasPath(idx, /\.meta$/)) out.push('*.meta files'); }
    if (engineId === 'unreal') { dir('Content/'); dir('Config/'); out.push('*.uasset and *.umap files'); }
    if (engineId === 'godot' && hasPath(idx, /\.import$/i)) out.push('*.import files');
    if (engineId === 'gamemaker') { out.push('*.yyp and *.yy files (owned by the IDE)'); }
    if (engineId === 'construct') out.push('*.c3p project file');
    if (engineId === 'renpy' && hasPath(idx, /\.rpyc$/i)) out.push('*.rpyc files (compiled)');
    if (engineId === 'rpgmaker') { if (hasPath(idx, /(^|\/)js\/rmmz_/i)) out.push('js/rmmz_*.js (engine core)'); else if (hasPath(idx, /(^|\/)js\/rpg_/i)) out.push('js/rpg_*.js (engine core)'); if (hasPath(idx, /(^|\/)js\/libs\//i)) out.push('js/libs/'); dir('data/'); }
    ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock', 'pubspec.lock', 'Gemfile.lock', 'poetry.lock'].forEach(function (f) { if (rootFiles[f]) out.push(f); });
    var min = 0; idx.paths.forEach(function (p) { if (/\.min\.(js|css)$/i.test(p) && !isSkipped(p)) min++; });
    if (min) out.push('*.min.js and *.min.css files');
    if (memoryFile && lower(base(memoryFile)) !== 'project_memory.md') out.push(memoryFile + ' (your notes: read it, never delete it)');
    var seen = {}; return out.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }).slice(0, 18);
  }

  function pickEntry(idx, engineId) {
    var order = {
      unity: [/^Assets\/Scenes\/[^\/]+\.unity$/i, /^Assets\/.*\.unity$/i, /^ProjectSettings\/ProjectVersion\.txt$/i],
      godot: [/(^|\/)project\.godot$/i], unreal: [/\.uproject$/i], gamemaker: [/\.yyp$/i], defold: [/(^|\/)game\.project$/i],
      love: [/(^|\/)main\.lua$/i], pygame: [/(^|\/)main\.py$/i, /(^|\/)game\.py$/i, /(^|\/)app\.py$/i], renpy: [/(^|\/)script\.rpy$/i],
      bevy: [/(^|\/)src\/main\.rs$/i], flame: [/(^|\/)lib\/main\.dart$/i], rpgmaker: [/(^|\/)js\/main\.js$/i, /(^|\/)index\.html$/i]
    }[engineId] || [];
    order = order.concat([/(^|\/)src\/(main|index|game)\.(ts|js|tsx|jsx)$/i, /(^|\/)(main|game|app|index)\.(ts|js)$/i, /(^|\/)index\.html$/i]);
    for (var i = 0; i < order.length; i++) {
      var best = null;
      for (var j = 0; j < idx.paths.length; j++) { var p = idx.paths[j]; if (isSkipped(p)) continue; if (order[i].test(p) && (!best || depth(p) < depth(best))) best = p; }
      if (best) return best;
    }
    return '';
  }

  function featureLabelKeys() { return PQ.FEATURES.map(function (f) { return f.key; }); }

  /* ---------- main scan ---------- */
  D.scan = function (file, opts) {
    opts = opts || {};
    var prog = opts.onProgress || function () { };
    var notes = [], stats = { files: 0, read: 0, bytes: 0, skipped: 0 };
    prog('list', 0);
    return PQ.zip.readEntries(file).then(function (res) {
      var all = res.entries.filter(function (e) { return !/^__MACOSX\//.test(e.name) && !/(^|\/)\.DS_Store$/.test(e.name); });
      var root = findRoot(all);
      var entries = all.map(function (e) { return { name: e.name.slice(root.length), dir: e.dir, size: e.size, csize: e.csize, method: e.method, offset: e.offset, flags: e.flags, _raw: e }; }).filter(function (e) { return e.name; });
      var files = entries.filter(function (e) { return !e.dir; });
      stats.files = files.length;
      if (!files.length) throw PQ.zip.err('nofiles', 'This zip has no files inside.');
      var idx = { paths: entries.map(function (e) { return e.name; }), set: {} };
      var byPath = {}; entries.forEach(function (e) { byPath[e.name] = e; idx.set[e.name] = 1; });

      /* phase 1: manifests */
      var wanted = { 'package.json': 1, 'project.godot': 1, 'game.project': 1, 'pubspec.yaml': 1, 'cargo.toml': 1, 'build.gradle': 1, 'settings.gradle': 1, 'index.html': 1, 'game.json': 1 };
      var man = {}, manSrc = {}, mtodo = [];
      files.forEach(function (e) {
        var b = lower(base(e.name)), key = null;
        if (wanted[b] && depth(e.name) <= 2 && !isSkipped(e.name)) key = b;
        else if (/\.csproj$/.test(b) && depth(e.name) <= 2 && !isSkipped(e.name)) key = '.csproj';
        else if (/(^|\/)projectsettings\/projectsettings\.asset$/i.test(e.name)) key = 'projectsettings.asset';
        else if (/\.(uproject|yyp)$/.test(b) && depth(e.name) <= 1) key = b;
        if (key && (!manSrc[key] || depth(e.name) < depth(manSrc[key]))) manSrc[key] = e.name;
      });
      Object.keys(manSrc).forEach(function (k) { mtodo.push(k); });
      prog('manifests', 0.1);
      return mapLimit(mtodo, BUDGET.parallel, function (k) {
        return PQ.zip.readText(file, byPath[manSrc[k]]._raw, BUDGET.manifestBytes).then(function (t) { if (t != null) man[k] = t; });
      }).then(function () {
        /* phase 2: code. Cheap, small, important-looking files first. */
        var cand = files.filter(function (e) { return !isSkipped(e.name) && !isVendorFile(e.name) && CODE_EXT.test(e.name) && e.size > 0; });
        stats.skipped = files.length - cand.length;
        var codeLike = cand.filter(function (e) { return STRONG_CODE.test(e.name); });
        var other = cand.filter(function (e) { return !STRONG_CODE.test(e.name) && e.size < 60 * 1024 && !/(^|\/)(package-lock|tsconfig)\.json$/i.test(e.name) && ext(e.name) !== '.json'; });
        function rank(e) { var s = e.size; if (/(^|\/)(src|scripts?|js|code|game|lib|source)\//i.test(e.name)) s *= 0.5; if (e.size > BUDGET.perFile * 3) s *= 3; return s; }
        codeLike.sort(function (a, b) { return rank(a) - rank(b); });
        var todo = codeLike.concat(other).slice(0, BUDGET.maxFiles);
        var texts = [], used = 0;
        var budgeted = [];
        todo.forEach(function (e) { var want = Math.min(e.size, BUDGET.perFile); if (used + want <= BUDGET.maxBytes) { used += want; budgeted.push(e); } });
        prog('read', 0.2);
        return mapLimit(budgeted, BUDGET.parallel, function (e) {
          return PQ.zip.readText(file, e._raw, BUDGET.perFile).then(function (t) {
            if (t != null) { texts.push({ path: e.name, text: t }); stats.read++; stats.bytes += t.length; }
          });
        }, function (d, n) { prog('read', 0.2 + 0.6 * (d / n)); }).then(function () {
          prog('think', 0.85);
          return finish(file, entries, files, idx, man, texts, stats, notes, root, prog);
        });
      });
    });
  };

  function finish(file, entries, files, idx, man, texts, stats, notes, root, prog) {
    /* engine */
    var S = engineFromMarkers(idx, man);
    var hintCount = {};
    texts.forEach(function (t) {
      ENGINE_HINTS.forEach(function (h) {
        if (h[1].test(t.text)) hintCount[h[0]] = (hintCount[h[0]] || 0) + 1;
      });
    });
    // plain web game: any html page with a <canvas> and its own inline script (no engine, no separate .js needed)
    var inlineGame = texts.filter(function (t) { return /\.html?$/i.test(t.path) && /<canvas\b/i.test(t.text) && /getContext|requestAnimationFrame/.test(t.text); });
    if (inlineGame.length && S.web) { S.web.score += 4; S.web.why.push('a page with a canvas and its own script (' + inlineGame[0].path.split('/').pop() + ')'); }
    Object.keys(hintCount).forEach(function (id) { if (S[id]) { S[id].score += Math.min(hintCount[id], 3) * 2; S[id].why.push('code that uses ' + S[id].id); } });
    var ranked = Object.keys(S).map(function (k) { return S[k]; }).filter(function (x) { return x.id !== 'unknown'; }).sort(function (a, b) { return b.score - a.score; });
    var top = ranked[0], second = ranked[1];
    var engineId = 'unknown', engineSure = false, engineWhy = '';
    if (top && top.score >= 6) {
      engineId = top.id; engineWhy = top.why.slice(0, 2).join(' and ');
      engineSure = !second || second.score === 0 || top.score >= second.score * 1.6;
      // plain "web" is the weakest guess: only trust it when nothing else showed up
      if (engineId === 'web' && second && second.score >= 3) { engineId = second.id; }
    } else if (top && top.score >= 3) { engineId = top.id; engineWhy = top.why.slice(0, 2).join(' and '); engineSure = false; }
    // A plain index.html + scripts with no other engine signal is almost surely a plain web game.
    if (engineId === 'web' && (!second || second.score === 0)) engineSure = true;
    var engineAlts = ranked.filter(function (x) { return x.score > 0; }).slice(0, 3).map(function (x) { return x.id; });
    if (engineAlts.indexOf(engineId) < 0 && engineId !== 'unknown') engineAlts.unshift(engineId);
    var engine = PQ.engineById(engineId);

    /* feature scores */
    var fscore = {}, fevid = {}, keys = featureLabelKeys();
    var pathsBlob = idx.paths.filter(function (p) { return !isSkipped(p); }).join('\n');
    var corpus = texts.filter(function (t) { return !/\.(md|txt)$/i.test(t.path); }).concat([{ path: '(file names)', text: pathsBlob }]);
    corpus.forEach(function (t) {
      keys.forEach(function (k) {
        var rx = PQ.FEATURE_RX[k]; if (!rx) return;
        var st = (t.text.match(rx.strong) || []).length, wk = rx.weak ? (t.text.match(rx.weak) || []).length : 0;
        var s = Math.min(st, 3) * 2 + Math.min(wk, 3);
        if (s > 0) { fscore[k] = (fscore[k] || 0) + s; (fevid[k] = fevid[k] || []).push({ p: t.path, s: s }); }
      });
    });
    var features = {}, evidence = {};
    keys.forEach(function (k) {
      var s = fscore[k] || 0;
      features[k] = s >= 4 ? 'found' : (s >= 2 ? 'maybe' : 'none');
      evidence[k] = (fevid[k] || []).sort(function (a, b) { return b.s - a.s; }).slice(0, 3).map(function (x) { return x.p; });
    });

    /* memory file and git */
    var memoryFile = '';
    MEM_NAMES.forEach(function (m) { if (memoryFile) return; var hit = null; idx.paths.forEach(function (p) { if (lower(base(p)) === m && depth(p) <= 1 && !isSkipped(p) && (!hit || depth(p) < depth(hit))) hit = p; }); if (hit) memoryFile = hit; });
    features.memory = memoryFile ? 'found' : 'none'; evidence.memory = memoryFile ? [memoryFile] : [];
    var hasGit = idx.paths.some(function (p) { return /(^|\/)\.git\//.test(p); });
    features.git = hasGit ? 'found' : 'none'; evidence.git = hasGit ? ['.git/'] : [];

    /* genre */
    var pathsNorm = idx.paths.filter(function (p) { return !isSkipped(p) && !isVendorFile(p); }).map(normText).join('');
    var codeNorm = texts.map(function (t) { return normText(t.text.slice(0, 120000)); }).join('');
    var gs = scoreGenres(pathsNorm, codeNorm).filter(function (x) { return x.id !== 'other'; });
    var gtop = gs[0], gsec = gs[1];
    var genreId = 'other', genreSure = false;
    if (gtop && gtop.score >= 4 && gtop.hits.length >= 2) {
      genreId = gtop.id;
      genreSure = gtop.score >= 8 && (!gsec || gtop.score >= gsec.score * 1.4);
    }
    var genreAlts = gs.filter(function (x) { return x.score >= 2 && x.hits.length >= 2; }).slice(0, 3).map(function (x) { return x.id; });

    /* name */
    var name = '', nameSure = false, pj = man['package.json'], m;
    function tryName(raw, sure) { if (name || !raw) return; raw = String(raw).trim(); if (!raw || GENERIC_NAMES.test(raw)) return; name = prettyName(raw); nameSure = !!sure; }
    if (man['project.godot'] && (m = /config\/name\s*=\s*"([^"]+)"/.exec(man['project.godot']))) tryName(m[1], true);
    if (man['projectsettings.asset'] && (m = /^\s*productName:\s*(.+)$/m.exec(man['projectsettings.asset']))) tryName(m[1].replace(/^['"]|['"]$/g, ''), true);
    idx.paths.forEach(function (p) { if (!name && /\.(uproject|yyp)$/i.test(p) && depth(p) <= 1) tryName(base(p).replace(/\.\w+$/, ''), true); });
    if (man['game.project'] && (m = /^\s*title\s*=\s*(.+)$/m.exec(man['game.project']))) tryName(m[1], true);
    if (man['game.json'] && (m = /"name"\s*:\s*"([^"]+)"/.exec(man['game.json']))) tryName(m[1], true);
    var htm = man['index.html'];
    if (htm && (m = /<title[^>]*>([^<]{1,80})<\/title>/i.exec(htm))) tryName(m[1].replace(/\s+/g, ' '), true);
    if (pj && (m = /"name"\s*:\s*"([^"]+)"/.exec(pj))) tryName(m[1].replace(/^@[^\/]+\//, ''), true);
    if (man['cargo.toml'] && (m = /^\s*name\s*=\s*"([^"]+)"/m.exec(man['cargo.toml']))) tryName(m[1], true);
    if (man['pubspec.yaml'] && (m = /^name:\s*(\S+)/m.exec(man['pubspec.yaml']))) tryName(m[1], true);
    if (!name && file && file.name) tryName(String(file.name).replace(/\.zip$/i, ''), false);
    if (!name && root) tryName(root.replace(/\/$/, ''), false);
    if (!name) { name = ''; nameSure = false; }

    var protect = buildProtect(idx, engineId, memoryFile);
    var entry = pickEntry(idx, engineId);

    /* honest notes */
    var roots = {};
    idx.paths.forEach(function (p) {
      if (isSkipped(p)) return;
      var m = /^(.*?)(project\.godot|ProjectSettings\/ProjectVersion\.txt|game\.project|[^\/]+\.uproject|[^\/]+\.yyp|package\.json)$/i.exec(p);
      if (m && !/package\.json$/i.test(p)) roots[m[1] + '|' + m[2].toLowerCase().replace(/[^\/]+(\.uproject|\.yyp)$/, '$1')] = 1;
    });
    var nProj = Object.keys(roots).length;
    if (nProj > 1) notes.push('This zip holds ' + nProj + ' separate projects. I looked at them all together, so the answers may be mixed up. For the best result, zip just ONE project folder.');
    if (engine.ed) notes.push('A lot of ' + (name || 'this game') + ' is probably made inside the ' + engine.label + ' editor. An AI coding tool can read and change the code, but it cannot click in the editor. The prompts say this, and tell the AI to guide you with exact clicks for those parts.');
    if (stats.read < 3) notes.push('I could read almost no code in this zip, so the "what the game already has" list may be wrong. It shows "not found" for things I could not look at. Check it by hand.');
    if (!hasGit) notes.push('There is no .git folder in the zip. That might just mean you zipped without it. The prompts will ask before setting up version history.');
    if (stats.files > BUDGET.maxFiles * 4) notes.push('This is a big project (' + stats.files + ' files). I read the code files that looked most important, not every file.');
    if (stats.bytes >= BUDGET.maxBytes * 0.95) notes.push('I stopped reading at about ' + Math.round(BUDGET.maxBytes / 1048576) + ' MB of code to keep your phone fast.');
    if (hasPath(idx, /(^|\/)(\.env|\.dev\.vars|secrets?\.[a-z]+|id_rsa|[\w-]+\.pem)$/i)) notes.push('Warning: this zip seems to contain a secrets file (like .env or a key). I did not read it. Remove it before you share the zip with anyone or any AI tool.');

    /* questions for the UI: only when we really cannot tell */
    var questions = [];
    if (!engineSure) questions.push({ key: 'engineId', text: engineId === 'unknown' ? 'I could not tell what this game is built with. Tap the best match.' : 'I think this is ' + engine.label + ', but I am not sure. Is that right?', options: (engineId === 'unknown' ? engineAlts : [engineId].concat(engineAlts.filter(function (x) { return x !== engineId; }))).concat(['unknown']).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 4) });
    if (!genreSure) questions.push({ key: 'genreId', text: genreId === 'other' ? 'What kind of game is it? I could not tell from the files.' : 'It looks like a ' + PQ.genreById(genreId).label.toLowerCase() + ' game, but I am not sure. Which fits best?', options: (genreId === 'other' ? genreAlts : [genreId].concat(genreAlts.filter(function (x) { return x !== genreId; }))).concat(['other']).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 4) });
    if (!nameSure) questions.push({ key: 'name', text: 'I could not find the real name of the game. What is it called?', options: [] });

    prog('done', 1);
    return {
      name: name, nameSure: nameSure, engineId: engineId, engineSure: engineSure, engineWhy: engineWhy, engineAlts: engineAlts,
      genreId: genreId, genreSure: genreSure, genreAlts: genreAlts, genreWhy: gtop ? gtop.hits.slice(0, 4).join(', ') : '',
      features: features, evidence: evidence, protect: protect, memoryFile: memoryFile, entry: entry,
      stats: stats, notes: notes, questions: questions, deviceId: PQ.DEFAULT_DEVICE
    };
  }

  /* A made-up example so people can try the page without a zip. */
  D.sample = function () {
    var f = {}; featureLabelKeys().forEach(function (k) { f[k] = 'none'; });
    ['git', 'saveSystem', 'touch', 'pause', 'enemies', 'particles', 'audio', 'economy'].forEach(function (k) { f[k] = 'found'; });
    ['delta', 'toast', 'goals', 'tutorial', 'settings'].forEach(function (k) { f[k] = 'maybe'; });
    var ev = {}; Object.keys(f).forEach(function (k) { ev[k] = f[k] === 'none' ? [] : ['src/game.js']; });
    return {
      name: 'Moon Cat Runner', nameSure: true, engineId: 'phaser', engineSure: true, engineWhy: 'package.json lists phaser',
      engineAlts: ['phaser'], genreId: 'platformer', genreSure: true, genreAlts: ['platformer'], genreWhy: 'jump, gravity, platform',
      features: f, evidence: ev, protect: ['node_modules/', 'dist/', 'package-lock.json'], memoryFile: '', entry: 'src/main.js',
      stats: { files: 48, read: 21, bytes: 90000, skipped: 12 }, notes: ['This is a made-up example. Drop your own zip to see your own game.'], questions: [], deviceId: PQ.DEFAULT_DEVICE, isSample: true
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
