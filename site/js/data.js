/* Polish Quest - static data. Classic script (no modules) so the page also works from file://.
   Nothing here is fetched from anywhere. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};

  /* The 19 rules, in the order the owner wrote them. n = rule number used in the prompts. */
  PQ.RULES = [
    { n: 1, key: 'tutorial', title: 'Tutorial', text: 'No text tutorials. A hand or pointer goes to each part of the game one by one and shows what it is, only when the player is curious. Never a wall of steps.' },
    { n: 2, key: 'notify', title: 'Notifications', text: 'Nothing blocks the screen. Messages, rewards and warnings go into a small collapsible log in a corner. The center always stays clear.' },
    { n: 3, key: 'smooth', title: 'Smooth UI', text: 'Popups, buttons, counters and transitions all use the same timing and easing. Nothing snaps or pops in. Only move and fade things so it stays smooth on weak phones.' },
    { n: 4, key: 'controls', title: 'One-tap controls', text: 'Every button works on one tap, even pause, restart and back to title. Tapping outside a popup closes it. Moves can happen at the same time, like dashing while moving and attacking.' },
    { n: 5, key: 'earned', title: 'Earned abilities', text: 'Hidden until the player earns them. No locked buttons. A short pointer moment when one unlocks.' },
    { n: 6, key: 'learn', title: 'Learn by playing', text: 'No reading. If a system can be beaten without understanding it, redesign it so understanding it is what wins.' },
    { n: 7, key: 'combat', title: 'Combat feel', text: 'Hits have weight, with knockback, a short hit-pause and stretchy attacks. Enemies are a real threat.' },
    { n: 8, key: 'variety', title: 'Variety', text: 'Every run or season feels different, with new discoveries, new enemy behavior, a crisis or event, and steady progress.' },
    { n: 9, key: 'economy', title: 'Economy', text: 'Money buys decisions, not more of the same. Even a rich player still has strategy.' },
    { n: 10, key: 'retention', title: 'Retention', text: 'Find where players quit and give them a reason to continue right there.' },
    { n: 11, key: 'perf', title: 'Performance', text: 'Batch drawing, reuse objects, create nothing every frame, cache everything. Stable on the weakest phone before any new feature.' },
    { n: 12, key: 'structure', title: 'Structure and safety', text: 'Start every system before anything uses it, keep things modular, use versioned saves, fix bugs one by one, save a checkpoint after every task.' },
    { n: 13, key: 'purpose', title: 'Purpose and goal', text: 'A purpose you can say in one sentence, a main goal with milestones, a small progress tracker, everything serves the goal, and a real ending.' },
    { n: 14, key: 'goals', title: 'Short goals', text: 'Always one or two goals that take a few minutes. When one finishes, the next appears.' },
    { n: 15, key: 'story', title: 'Story cinematic', text: 'At the start, at key turning points and at the ending. Characters with different voices, one-tap skip, remembers what was seen. Built inside the game, no video files.' },
    { n: 16, key: 'dialogue', title: 'Dialogue', text: 'Short, in character, about what just happened, reacts to choices. A bottom box that never covers the action, with fade-ins.' },
    { n: 17, key: 'vfx', title: 'VFX with purpose', text: 'Wind-up, main effect, impact, lingering trail. Each layer tells the player something. No effect just for looks. Reused particles and capped overdraw.' },
    { n: 18, key: 'finisher', title: 'Finisher', text: 'Only for big moments. Build-up, a slow-motion beat, a camera push, heavier effects, tied to the story. Skippable. Never on normal kills.' },
    { n: 19, key: 'payoff', title: 'Emotional payoff', text: 'Plan the loss, sacrifice, reunion and victory on purpose. Set each one up first, then use the cinematic, the finisher, a music shift and a quiet moment.' }
  ];

  /* Phones. Targets are goals we set, not measured facts. */
  PQ.DEVICES = [
    { id: 'cheap', label: 'Cheap Android phone', sub: 'Older chip, about 3 GB of memory or less', icon: 'phone', rule: 'Aim for a steady 30 frames per second as the floor on a cheap Android phone, and 60 where it costs nothing. Keep memory use low and avoid any hitch (a sudden stall) longer than about one frame.' },
    { id: 'iphone', label: 'Older iPhone', sub: 'A few years old, small screen', icon: 'phone', rule: 'Aim for a steady 30 frames per second as the floor on an older iPhone, and 60 where it costs nothing. Watch memory: the system may close apps that use too much.' },
    { id: 'mid', label: 'Mid-range phone', sub: 'Fairly recent, average speed', icon: 'phone', rule: 'Aim for a steady 60 frames per second on a mid-range phone, with no stalls. Keep heat in mind: phones slow down when they get hot, so check the frame rate after 10 minutes of play.' },
    { id: 'pc', label: 'Computer only', sub: 'No phone support needed', icon: 'desktop', rule: 'Aim for a steady 60 frames per second on a basic laptop. Mobile layout is optional, but keep touch input working if it already does.' },
    { id: 'unsure', label: 'I am not sure', sub: 'We will plan for the cheap Android phone', icon: 'info', rule: 'I am not sure which phone is my weakest, so plan for a cheap Android phone: aim for a steady 30 frames per second as the floor and keep memory use low.' }
  ];
  PQ.DEFAULT_DEVICE = 'cheap';

  /* Game types. combat=false games get "action feedback" wording instead of fighting wording. */
  PQ.GENRES = [
    { id: 'platformer', label: 'Platformer', combat: true, impact: 'a stomp, a hit or a landing', threat: 'enemies and hazards', crisis: 'a chase, a collapsing area or a boss', kw: ['platform', 'jump', 'gravity', 'double_jump', 'doublejump', 'coyote', 'wall_jump', 'walljump', 'checkpoint'] },
    { id: 'shooter', label: 'Shooter or bullet hell', combat: true, impact: 'a shot landing', threat: 'enemy fire', crisis: 'a boss or a swarm wave', kw: ['bullet', 'shoot', 'projectile', 'ammo', 'weapon', 'turret', 'crosshair', 'reload'] },
    { id: 'action', label: 'Action or fighting', combat: true, impact: 'a hit connecting', threat: 'enemies that fight back', crisis: 'a boss or an ambush', kw: ['combo', 'attack', 'hitbox', 'hurtbox', 'parry', 'dodge', 'melee', 'sword', 'punch'] },
    { id: 'roguelike', label: 'Roguelike or dungeon run', combat: true, impact: 'a hit or a pickup', threat: 'rooms full of enemies', crisis: 'an elite room, a boss or a curse', kw: ['dungeon', 'roguelike', 'procedural', 'permadeath', 'room', 'floor', 'relic', 'seed', 'run_'] },
    { id: 'rpg', label: 'RPG or adventure', combat: true, impact: 'a hit, a spell or an item found', threat: 'monsters and danger', crisis: 'a boss, a betrayal or a disaster', kw: ['quest', 'npc', 'inventory', 'dialogue', 'level_up', 'levelup', 'experience', 'stats', 'party', 'spell'] },
    { id: 'td', label: 'Tower defense or strategy', combat: true, impact: 'a tower hit or an enemy defeated', threat: 'waves reaching the goal', crisis: 'a boss wave or a surprise attack', kw: ['tower', 'wave', 'lane', 'path', 'defense', 'defence', 'faction', 'unit', 'base'] },
    { id: 'survival', label: 'Survival or sandbox', combat: true, impact: 'a hit, a build or a harvest', threat: 'hunger, danger and the night', crisis: 'a storm, a raid or a shortage', kw: ['survival', 'craft', 'hunger', 'thirst', 'sandbox', 'build', 'resource', 'harvest'] },
    { id: 'card', label: 'Card or turn-based', combat: true, impact: 'a card played or damage dealt', threat: 'the opponent and your own limits', crisis: 'a boss deck or a rule twist', kw: ['deck', 'card', 'hand', 'turn', 'mana', 'draw_pile', 'discard'] },
    { id: 'puzzle', label: 'Puzzle', combat: false, impact: 'a piece placed or a match cleared', threat: 'limited moves, time or space running out', crisis: 'a board twist or a time squeeze', kw: ['puzzle', 'match', 'tile', 'grid', 'swap', 'moves_left', 'solve', 'sokoban'] },
    { id: 'idle', label: 'Idle or clicker', combat: false, impact: 'a big number tick or a purchase', threat: 'slowing growth or a penalty event', crisis: 'a market crash or a rush event', kw: ['idle', 'clicker', 'offline', 'prestige', 'per_second', 'persecond', 'autoclick', 'generator'] },
    { id: 'sim', label: 'Farming, sim or management', combat: false, impact: 'a harvest or a build finishing', threat: 'shortages, weather or deadlines', crisis: 'a storm, a rush order or an inspection', kw: ['farm', 'crop', 'customer', 'tycoon', 'manage', 'factory', 'shop', 'order', 'season'] },
    { id: 'racing', label: 'Racing or endless runner', combat: false, impact: 'a boost, a crash or an overtake', threat: 'rivals, obstacles and the clock', crisis: 'a rival surge, a storm lap or a closing shortcut', kw: ['lap', 'race', 'racing', 'car', 'drift', 'speed', 'runner', 'obstacle', 'lane'] },
    { id: 'narrative', label: 'Story or visual novel', combat: false, impact: 'a choice landing', threat: 'a hard choice with a cost', crisis: 'a twist or a betrayal', kw: ['visual novel', 'choice', 'branch', 'chapter', 'narrat', 'dialogue', 'ending', 'label '] },
    { id: 'rhythm', label: 'Rhythm or music', combat: false, impact: 'a note hit', threat: 'missing the beat', crisis: 'a tempo change or a surprise pattern', kw: ['rhythm', 'beat', 'bpm', 'note', 'combo', 'judgement', 'judgment'] },
    { id: 'other', label: 'Something else', combat: false, impact: 'the main action landing', threat: 'whatever pushes back on the player', crisis: 'a moment that changes the rules', kw: [] }
  ];

  /* Engines. ed = most work is done in the editor, not in text code (AI can only guide). */
  PQ.ENGINES = [
    { id: 'unity', label: 'Unity', lang: 'C#', ed: false, run: 'Press Play in the Unity editor (and test a real device build before finishing).', perf: ['Pool anything spawned often instead of Instantiate and Destroy during play.', 'Cache references (GetComponent, Find) in Awake or Start, never in Update.', 'Avoid allocations per frame: no new lists, no string concatenation, no LINQ in Update.', 'Use sprite atlases and keep materials shared so drawing can batch.', 'Check the Profiler for garbage collection spikes.'], risky: 'Scenes, prefabs and .meta files are YAML that the editor owns. Prefer code changes. Never edit .meta files by hand.' },
    { id: 'godot', label: 'Godot', lang: 'GDScript or C#', ed: false, run: 'Press the Play button in the Godot editor (and test an exported build on a real device before finishing).', perf: ['Pool bullets, enemies and effects instead of creating and freeing nodes during play.', 'Cache node lookups with @onready (or once in _ready), never call get_node every frame.', 'Do not allocate arrays or dictionaries inside _process or _physics_process.', 'Use a texture atlas or shared materials so 2D drawing can batch.', 'Check the Monitors tab in the debugger for object and node counts.'], risky: 'Scene files (.tscn) and resources (.tres) are text but easy to break. Keep edits small and tell me what changed. Never edit .import files or the .godot folder.' },
    { id: 'phaser', label: 'Phaser', lang: 'JavaScript or TypeScript', ed: false, run: 'Run the project in a local browser (the same way it runs today) and test on a real phone.', perf: ['Use a texture atlas and groups with a fixed maximum size so sprites are reused.', 'Do not create objects (arrays, vectors, closures) inside update.', 'Pool with group.get and kill/revive instead of creating and destroying.', 'Cache text objects; only call setText when the value changes.', 'Use Chrome DevTools Performance with CPU throttling to check a slower device.'], risky: 'Do not edit minified library files or files inside node_modules.' },
    { id: 'three', label: 'Three.js', lang: 'JavaScript or TypeScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Reuse geometries, materials and textures; share them between meshes.', 'Do not allocate Vector3 or Matrix4 objects inside the render loop.', 'Use instancing for many identical objects.', 'Keep pixel ratio capped on phones and watch draw calls.', 'Dispose of unused geometries, materials and textures.'], risky: 'Do not edit library files inside node_modules.' },
    { id: 'pixi', label: 'PixiJS', lang: 'JavaScript or TypeScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Use sprite sheets so drawing batches.', 'Reuse sprites and containers; do not create them every frame.', 'Cache text and update it only when the value changes.', 'Keep filters and masks to a minimum on phones.'], risky: 'Do not edit library files inside node_modules.' },
    { id: 'babylon', label: 'Babylon.js', lang: 'JavaScript or TypeScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Reuse meshes with instances; share materials.', 'Do not allocate vectors inside the render loop.', 'Freeze static meshes and materials where possible.'], risky: 'Do not edit library files inside node_modules.' },
    { id: 'kaplay', label: 'Kaplay or Kaboom', lang: 'JavaScript or TypeScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Reuse game objects where possible and avoid creating objects every frame.', 'Use sprite atlases.'], risky: 'Do not edit library files inside node_modules.' },
    { id: 'excalibur', label: 'Excalibur', lang: 'TypeScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Reuse actors instead of creating them every frame.', 'Use sprite sheets.'], risky: 'Do not edit library files inside node_modules.' },
    { id: 'melon', label: 'melonJS', lang: 'JavaScript', ed: false, run: 'Run the project in a local browser and test on a real phone.', perf: ['Use texture atlases.', 'Pool entities.'], risky: 'Do not edit library files.' },
    { id: 'p5', label: 'p5.js', lang: 'JavaScript', ed: false, run: 'Run the sketch in a local browser and test on a real phone.', perf: ['Do not create arrays or objects inside draw().', 'Use createGraphics once for static layers and draw it as an image.', 'Avoid per-frame loadImage or text-heavy drawing.'], risky: 'Do not edit minified library files.' },
    { id: 'playcanvas', label: 'PlayCanvas', lang: 'JavaScript', ed: true, run: 'Use the PlayCanvas editor Launch button and test on a real phone.', perf: ['Reuse entities instead of creating them every frame.', 'Batch static meshes where possible.'], risky: 'The scene is edited in the online editor. Code files are fine; scene changes need me to click.' },
    { id: 'construct', label: 'Construct (export)', lang: 'Visual events', ed: true, run: 'Open the project in Construct to run it.', perf: [], risky: 'This zip looks like an export. The real project is the .c3p file, which is edited in the Construct editor.' },
    { id: 'gamemaker', label: 'GameMaker', lang: 'GML', ed: false, run: 'Run the project from the GameMaker IDE.', perf: ['Avoid creating arrays or structs every Step.', 'Use sprite groups and texture pages sensibly.', 'Reuse instances with a pool.'], risky: 'The .yy and .yyp files are JSON owned by the IDE. Edit code (.gml) files, and tell me when something must be done in the IDE.' },
    { id: 'rpgmaker', label: 'RPG Maker', lang: 'JavaScript plugins', ed: true, run: 'Playtest from the RPG Maker editor.', perf: ['Keep plugin code light; avoid per-frame object creation.'], risky: 'Maps and database are JSON files the editor owns. Prefer new plugins in js/plugins. Do not edit rpg_core or rmmz_core files.' },
    { id: 'love', label: 'LOVE (Lua)', lang: 'Lua', ed: false, run: 'Run the folder with LOVE (love .).', perf: ['Do not create tables inside love.update or love.draw.', 'Use SpriteBatch for many sprites.', 'Pool bullets and particles.'], risky: 'Do not edit third-party library files.' },
    { id: 'pygame', label: 'Pygame', lang: 'Python', ed: false, run: 'Run the main Python file the same way it runs today.', perf: ['Convert images once with convert() or convert_alpha().', 'Do not create surfaces or lists every frame.', 'Use dirty rects or fewer blits for static layers.'], risky: 'Do not edit files inside a virtual environment folder.' },
    { id: 'renpy', label: "Ren'Py", lang: "Ren'Py script", ed: false, run: "Launch the project from the Ren'Py launcher.", perf: [], risky: 'Do not edit compiled .rpyc files.' },
    { id: 'defold', label: 'Defold', lang: 'Lua', ed: false, run: 'Build and run from the Defold editor.', perf: ['Use collection factories with pooling instead of spawning every frame.', 'Use atlases.'], risky: 'Do not edit the build folder.' },
    { id: 'bevy', label: 'Bevy', lang: 'Rust', ed: false, run: 'Run with cargo run.', perf: ['Avoid allocating inside systems every frame.', 'Reuse entities with markers instead of spawning and despawning constantly.'], risky: 'Do not edit Cargo.lock or the target folder by hand.' },
    { id: 'unreal', label: 'Unreal Engine', lang: 'C++ and Blueprints', ed: true, run: 'Press Play in the Unreal editor.', perf: ['Pool actors that spawn often.', 'Avoid Tick work you do not need.'], risky: 'Blueprints and assets are binary files that AI tools cannot edit. The AI can change C++ and tell me what to click in the editor.' },
    { id: 'cocos', label: 'Cocos Creator', lang: 'TypeScript', ed: true, run: 'Use Preview in Cocos Creator.', perf: ['Use node pools (NodePool) for things spawned often.', 'Use auto atlas.'], risky: 'Scene and prefab files are owned by the editor. Prefer code changes.' },
    { id: 'gdevelop', label: 'GDevelop', lang: 'Visual events', ed: true, run: 'Preview from the GDevelop editor.', perf: [], risky: 'Events are edited in the GDevelop editor. The AI can only guide me.' },
    { id: 'libgdx', label: 'libGDX', lang: 'Java or Kotlin', ed: false, run: 'Run the desktop launcher the same way it runs today.', perf: ['Pool objects with Pool and use SpriteBatch.', 'Do not allocate inside render().'], risky: 'Do not edit the build folder.' },
    { id: 'flame', label: 'Flutter + Flame', lang: 'Dart', ed: false, run: 'Run with flutter run.', perf: ['Reuse components; do not allocate inside update.', 'Use sprite sheets.'], risky: 'Do not edit generated files or pubspec.lock by hand.' },
    { id: 'monogame', label: 'MonoGame', lang: 'C#', ed: false, run: 'Run from your IDE the same way it runs today.', perf: ['Do not allocate inside Update or Draw.', 'Use one SpriteBatch Begin/End with sprite sheets.'], risky: 'The .mgcb content file is owned by the pipeline tool.' },
    { id: 'web', label: 'Plain web game (HTML + JavaScript)', lang: 'JavaScript', ed: false, run: 'Open the page in a local browser (the same way it runs today) and test on a real phone.', perf: ['Draw static layers once to an offscreen canvas and reuse it.', 'Use one sprite sheet and draw with drawImage, not many separate images.', 'Do not create objects, arrays or strings inside the game loop.', 'Use requestAnimationFrame with a time step so slow phones do not slow the game down.', 'Use Chrome DevTools Performance with CPU throttling to check a slower device.'], risky: 'Do not edit minified library files.' },
    { id: 'unknown', label: 'Something else', lang: 'unknown', ed: false, run: 'Run the project the same way it runs today.', perf: ['Find per-frame allocations and remove them.', 'Reuse objects instead of creating them.'], risky: 'Be careful with any generated or binary files.' }
  ];

  /* Features the scan looks for. rules = which rule numbers they relate to. */
  PQ.FEATURES = [
    { key: 'memory', label: 'A notes or memory file', icon: 'file', rules: [12] },
    { key: 'git', label: 'Version history (git)', icon: 'save', rules: [12] },
    { key: 'saveSystem', label: 'Saving the game', icon: 'save', rules: [12] },
    { key: 'saveVersion', label: 'Versioned saves', icon: 'save', rules: [12] },
    { key: 'delta', label: 'Frame-rate independent movement', icon: 'stopwatch', rules: [11] },
    { key: 'pooling', label: 'Object pooling', icon: 'p_structure', rules: [11] },
    { key: 'fpsView', label: 'An FPS or debug view', icon: 'stopwatch', rules: [11] },
    { key: 'lowEnd', label: 'A low-quality or low-end mode', icon: 'phone', rules: [11] },
    { key: 'touch', label: 'Touch controls', icon: 'tap', rules: [4] },
    { key: 'pause', label: 'Pause', icon: 'f_pause', rules: [4] },
    { key: 'gamepad', label: 'Gamepad support', icon: 'p_controls', rules: [4] },
    { key: 'fullscreen', label: 'Fullscreen or resizing', icon: 'f_frame', rules: [4] },
    { key: 'settings', label: 'A settings screen', icon: 'gear', rules: [3] },
    { key: 'toast', label: 'A message or notification system', icon: 'p_notify', rules: [2] },
    { key: 'tutorial', label: 'A tutorial or hints', icon: 'p_pointer', rules: [1] },
    { key: 'abilities', label: 'Abilities, upgrades or unlocks', icon: 'p_earned', rules: [5] },
    { key: 'enemies', label: 'Enemies', icon: 'enemy_bug', rules: [7] },
    { key: 'knockback', label: 'Knockback', icon: 'p_combat', rules: [7] },
    { key: 'hitstop', label: 'Hit-pause or freeze frames', icon: 'p_combat', rules: [7] },
    { key: 'shake', label: 'Screen shake', icon: 'p_vfx', rules: [7, 17] },
    { key: 'particles', label: 'Particles or effects', icon: 'p_vfx', rules: [17] },
    { key: 'economy', label: 'Money, shop or prices', icon: 'coin', rules: [9] },
    { key: 'goals', label: 'Quests, goals or achievements', icon: 'p_goals', rules: [13, 14] },
    { key: 'story', label: 'Story, chapters or an ending', icon: 'book', rules: [15, 19] },
    { key: 'cutscene', label: 'Cutscenes or cinematics', icon: 'p_cinema', rules: [15] },
    { key: 'dialogue', label: 'Dialogue', icon: 'p_dialogue', rules: [16] },
    { key: 'audio', label: 'Sound and music', icon: 'p_audio', rules: [17] },
    { key: 'procedural', label: 'Random or generated content', icon: 'p_variety', rules: [8] }
  ];

  /* Regex evidence for each feature. strong hits count 2, weak 1. found >= 4, maybe >= 2. */
  PQ.FEATURE_RX = {
    saveSystem: { strong: /localStorage|PlayerPrefs|indexedDB|user:\/\/|FileAccess\.open|SaveGame|save_game|savegame|JsonUtility\.ToJson|ConfigFile/g, weak: /\bsave\(|\bsaveData|\bloadGame|\bload_game|\bsaveProgress/gi },
    saveVersion: { strong: /(save|data|schema)[_ ]?(version|ver)\b|migrat(e|ion)|\bversion\s*[:=]\s*\d/gi, weak: /\bversion\b/gi },
    delta: { strong: /deltaTime|delta_time|_process\(\s*delta|_physics_process\(\s*delta|fixedDeltaTime|\bdt\b\s*[*)]|\bdelta\b\s*\*/g, weak: /\bdelta\b|\bdt\b/g },
    pooling: { strong: /object ?pool|ObjectPool|\bpool\.(get|acquire|spawn|release)|\bPool<|NodePool|\bpooled\b|recycle\(|group\.get\(|obtain\(\)/gi, weak: /\bpool\b/gi },
    fpsView: { strong: /\bFPS\b|show_fps|ShowFPS|Stats\(\)|get_fps|1\s*\/\s*Time\.deltaTime|Performance\.get_monitor|Profiler/g, weak: /\bfps\b/gi },
    lowEnd: { strong: /lowEnd|low_end|lowQuality|low_quality|QualitySettings|graphics ?quality|reduceEffects|reduce_effects|lowGraphics/gi, weak: /\bquality\b/gi },
    touch: { strong: /touchstart|touchmove|pointerdown|Input\.touch|InputEventScreenTouch|InputEventScreenDrag|TouchScreenButton|virtual ?joystick|onTouch|touchcontrols|isMobile/gi, weak: /\btouch\b|joystick|swipe/gi },
    pause: { strong: /\bisPaused\b|\bgamePaused\b|\bpaused\s*=|get_tree\(\)\.paused|togglePause|pauseGame|PauseMenu|pause_menu|Time\.timeScale\s*=\s*0/g, weak: /\bpause\b/gi },
    gamepad: { strong: /getGamepads|Gamepad|joypad|InputEventJoypad|Input\.GetJoystick|GamepadButton|gamepadconnected/g, weak: /\bgamepad\b|controller/gi },
    fullscreen: { strong: /requestFullscreen|Screen\.fullScreen|window_set_mode|ScaleManager|Scale\.FIT|display_set_fullscreen|devicePixelRatio|safeArea|safe-area|stretch_mode|content_scale/gi, weak: /fullscreen|\bresize\b/gi },
    settings: { strong: /SettingsMenu|settings_menu|SettingsScreen|OptionsMenu|options_menu|volumeSlider|volume_slider|masterVolume|master_volume|setVolume/g, weak: /\bsettings\b|\boptions\b/gi },
    toast: { strong: /\btoast\b|Toast\(|snackbar|showMessage|show_message|notify\(|NotificationManager|messageLog|message_log|logPanel|addNotification/gi, weak: /notification|popup/gi },
    tutorial: { strong: /tutorial|onboarding|TutorialManager|tutorial_step|showHint|show_hint|tooltip/gi, weak: /\bhint\b|how to play/gi },
    abilities: { strong: /ability|abilities|skillTree|skill_tree|unlockAbility|unlock_ability|powerup|power_up|unlocked\s*=|isUnlocked|is_unlocked/gi, weak: /\bupgrade|\bunlock/gi },
    enemies: { strong: /\benem(y|ies)\b|Enemy[A-Z]\w*|enemy_\w+|\bmonster\b|\bhostile\b/g, weak: /\bmob\b|\bfoe\b|\bboss\b/gi },
    knockback: { strong: /knock[-_ ]?back|knockBack/gi, weak: /\bpush[-_ ]?back|\bstagger\b/gi },
    hitstop: { strong: /hit[-_ ]?stop|hit[-_ ]?pause|freeze[-_ ]?frame|hitfreeze|time_scale\s*=|slowmo|slow_motion/gi, weak: /\bhitlag\b|hit_lag/gi },
    shake: { strong: /screen[-_ ]?shake|camera[-_ ]?shake|cameraShake|shakeCamera|CinemachineImpulse|\.shake\(/gi, weak: /\bshake\b/gi },
    particles: { strong: /particle|ParticleSystem|GPUParticles|CPUParticles|emitter|\.emit\(/gi, weak: /\bsparks?\b|\bexplosion\b|\btrail\b/gi },
    economy: { strong: /\bshop\b|\bstore\b|\bprice\b|\bbuy\(|\bpurchase|\bcurrency\b|\bcoins?\b|\bgold\b|\bwallet\b|\bmoney\b/gi, weak: /\bcost\b|\bgems?\b/gi },
    goals: { strong: /\bquests?\b|\bmissions?\b|\bobjectives?\b|\bachievements?\b|\bgoals?\b|\bmilestones?\b/gi, weak: /\btasks?\b|\bchallenge/gi },
    story: { strong: /\bstory\b|\bchapter\b|\bnarrat|\bepilogue\b|\bending\b|\blore\b|\bplot\b/gi, weak: /\bintro\b|\bcredits\b/gi },
    cutscene: { strong: /cutscene|cinematic|PlayableDirector|intro_scene|introScene|CutsceneManager|letterbox/gi, weak: /\btimeline\b/gi },
    dialogue: { strong: /dialog(ue)?(Box|Manager|System|Runner|_box|_manager)|DialogueBox|conversation|typewriter|speech ?bubble|npc_talk|showDialog|show_dialog/gi, weak: /\bdialog(ue)?\b|\bsay\(/gi },
    audio: { strong: /AudioContext|new Audio\(|AudioSource|AudioStreamPlayer|\bHowl\(|sound\.add|\.playSound|play_sound|AudioManager|SoundManager|audio_play_sound|mixer\.Sound/gi, weak: /\bsound\b|\bmusic\b|\bsfx\b/gi },
    procedural: { strong: /procedural|\brandom\.seed|\bseed\b|generateLevel|generate_level|generateMap|generate_map|Random\.InitState|randomize\(\)|WaveFunction|\brng\b/gi, weak: /Math\.random|random\.|Random\.Range|randi\(|randf\(/gi }
  };

  /* Words per genre are matched in file paths (weight 3) and in code (weight 1, capped). */
  PQ.STEP_COUNT = 26;
  PQ.MODEL = 'Claude Sonnet 5.5';
  PQ.SAMPLE_NAME = 'Sample: Moon Cat Runner';
})(typeof window !== 'undefined' ? window : globalThis);
