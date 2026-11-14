/* Free tools and asset sources. Licences are written as the owners state them; check each page before you ship. */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  PQ.PLATFORMS = [
    { id: 'pc', label: 'PC', sub: 'Computer, browser or desktop' },
    { id: 'mobile', label: 'Mobile', sub: 'Phone and tablet, touch controls' }
  ];
  PQ.KINDS = [
    { id: '3d', label: '3D game', sub: 'Characters and worlds in 3D' },
    { id: '2d', label: '2D game', sub: 'Sprites, tiles and flat art' },
    { id: 'ui', label: 'Menu or card game', sub: 'Mostly screens and UI' }
  ];
  PQ.STYLES = [
    { id: 'lowpoly', label: 'Low poly', sub: 'Few triangles, clean shapes, smooth animation' },
    { id: 'stylized', label: 'Stylized', sub: 'Hand-painted textures' },
    { id: 'pixel', label: 'Pixel art', sub: 'Small sprites' }
  ];
  /* kind: tool | assets | audio | icons. lic: stated licence. note: one honest line. */
  PQ.FREE_SOURCES = [
    { n: 'Godot Engine', k: 'tool', lic: 'MIT', url: 'https://godotengine.org', note: 'Full game engine, 2D and 3D, exports to phones.' },
    { n: 'Blender', k: 'tool', lic: 'GPL (your art is yours)', url: 'https://www.blender.org', note: 'Model, rig and animate. Not MIT.' },
    { n: 'Three.js', k: 'tool', lic: 'MIT', url: 'https://threejs.org', note: 'Browser 3D library.' },
    { n: 'Free Texture Packer', k: 'tool', lic: 'MIT', url: 'https://github.com/odrick/free-tex-packer', note: 'Packs sprites into one atlas so drawing can batch.' },
    { n: 'Kenney', k: 'assets', lic: 'CC0', url: 'https://kenney.nl/assets', note: '2D and 3D packs, UI kits, low poly models.' },
    { n: 'Quaternius', k: 'assets', lic: 'CC0', url: 'https://quaternius.com', note: 'Low poly rigged and animated characters.' },
    { n: 'Poly Haven', k: 'assets', lic: 'CC0', url: 'https://polyhaven.com', note: 'Models, textures and sky maps. The search below uses it.' },
    { n: 'Mesh2Motion', k: 'assets', lic: 'CC0', url: 'https://mesh2motion.org', note: 'Free, open source. Rig a character in the browser and get animations (Quaternius). Use it when Mixamo is not an option.' },
    { n: 'ambientCG', k: 'assets', lic: 'CC0', url: 'https://ambientcg.com', note: 'PBR materials and textures. The search below uses it.' },
    { n: 'Sketchfab (CC0 filter)', k: 'assets', lic: 'CC0 only when filtered', url: 'https://sketchfab.com/search?features=downloadable&licenses=7c23a1ba438d4306920229c12afcb5f9&type=models', note: 'Check the licence on every model page. The search below only lists CC0 ones.' },
    { n: 'Mixamo', k: 'assets', lic: 'Free with an Adobe account, NOT open source', url: 'https://www.mixamo.com', note: 'Rigged characters and animations. Terms say use in your game is allowed, but you may not resell the files alone.' },
    { n: 'Freesound', k: 'audio', lic: 'Mixed: CC0, CC BY and more', url: 'https://freesound.org', note: 'Filter by CC0. Each sound has its own licence.' },
    { n: 'OpenGameArt', k: 'audio', lic: 'Mixed per item', url: 'https://opengameart.org', note: 'Sound, music and art. Read each licence.' },
    { n: 'Lucide icons', k: 'icons', lic: 'ISC (like MIT)', url: 'https://lucide.dev', note: 'Clean UI icons.' },
    { n: 'game-icons.net', k: 'icons', lic: 'CC BY 3.0 (credit needed)', url: 'https://game-icons.net', note: 'Thousands of game icons. You must give credit.' }
  ];
  /* Search dropdown. api = searched on the server (no key). link = no public search API, so the button opens that site's own search. */
  PQ.SEARCH_SOURCES = [
    { id: 'all', label: 'All sites with search (CC0)', api: true, lic: 'CC0' },
    { id: 'polyhaven-models', label: 'Poly Haven: 3D models', api: true, lic: 'CC0' },
    { id: 'polyhaven-textures', label: 'Poly Haven: textures', api: true, lic: 'CC0' },
    { id: 'polyhaven-hdris', label: 'Poly Haven: sky lighting', api: true, lic: 'CC0' },
    { id: 'ambientcg', label: 'ambientCG: materials', api: true, lic: 'CC0' },
    { id: 'sketchfab', label: 'Sketchfab: CC0 downloadable models', api: true, lic: 'CC0' },
    { id: 'kenney', label: 'Kenney: game packs (opens site)', link: function (q) { return 'https://kenney.nl/assets?s=' + encodeURIComponent(q); }, lic: 'CC0' },
    { id: 'opengameart', label: 'OpenGameArt: CC0 art and sound (opens site)', link: function (q) { return 'https://opengameart.org/art-search-advanced?keys=' + encodeURIComponent(q) + '&field_art_licenses_tid%5B%5D=4'; }, lic: 'CC0 filter' },
    { id: 'quaternius', label: 'Quaternius: low poly characters (opens site)', link: function () { return 'https://quaternius.com/'; }, lic: 'CC0' },
    { id: 'mesh2motion', label: 'Mesh2Motion: free rigging and animation (opens site)', link: function () { return 'https://mesh2motion.org/'; }, lic: 'CC0' }
  ];
  PQ.KIND_LABEL = { tool: 'Tools', assets: 'Models and art', audio: 'Sound', icons: 'Icons' };

  /* Copy-paste prompt for the user's AI coding tool. Facts only, targets are goals not measurements. */
  PQ.assetPrompt = function (s) {
    var plat = s.platformId === 'mobile' ? 'mobile' : 'pc', kind = s.kindId || '3d', style = s.styleId || 'lowpoly';
    var L = ['ASSET AND PERFORMANCE PLAN', 'Game: ' + (s.name || 'my game') + '. Platform: ' + (plat === 'mobile' ? 'phone and tablet' : 'computer') + '. Type: ' + kind.toUpperCase() + ', style: ' + style + '.', '',
      'RULES', '1. Use only assets whose licence allows use in a game (CC0, MIT, ISC, or CC BY with credit). Record every asset in ASSETS.md: name, author, link, licence, file path. Do not use an asset if you cannot find its licence, and tell me instead.',
      '2. Do not edit binary files. Tell me which files to import by hand.'];
    if (plat === 'mobile' && kind === '3d') {
      L.push('3. Mobile 3D budget (goals to check, not promises): about 3000 to 6000 triangles per character, about 300000 triangles on screen, about 100 draw calls, 30 frames per second as the floor.',
        '4. Batch: one shared material and one texture atlas per character set or environment set. Use instancing or static batching for repeated props. Count draw calls with the engine profiler before and after.',
        '5. Animation: use skinned meshes with at most 30 bones per character, keyframe-reduce clips, share one skeleton and retarget animations across characters. Quality comes from good timing, anticipation and follow-through, not from more triangles.',
        '6. Textures: 512 or 1024 pixels, compressed (ASTC or ETC2), no per-frame allocations, pooled effects, baked or simple lighting, short shadow distance.',
        '7. Measure on a real mid-range phone and write the numbers in the memory file. Say plainly what you could not measure.');
    } else if (plat === 'mobile') {
      L.push('3. Mobile 2D budget: pack sprites into atlases, keep draw calls low, pool objects, 30 frames per second floor, touch targets at least 44 pixels.',
        '4. Measure on a real phone and write the numbers in the memory file.');
    } else {
      L.push('3. PC target: steady 60 frames per second on a basic laptop. Still use shared materials or atlases so drawing can batch.');
    }
    L.push('', 'STEPS', 'A. List what art, models, animation and sound this game still needs, in order of what the player sees first.',
      'B. For each item, suggest one free source with a stated licence (for example Kenney, Quaternius, Poly Haven, Freesound with a CC0 filter). Show me the link and licence before you use it.',
      'C. Propose a folder layout for assets, then wait for my OK.',
      'D. Add ONE asset, show it in the game, check the frame rate, write it in ASSETS.md. Then stop.', '',
      'DONE WHEN', 'ASSETS.md lists the asset with its licence, the game still runs, and the frame rate is written down.');
    return L.join('\n');
  };
})();
