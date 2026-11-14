/* Polish Quest - goals (what the game is for) and the 7 rating areas. Static data, no network.
   The weights are our own judgement, not industry statistics. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};

  PQ.GOALS = [
    { id: 'aaa', title: 'A flagship game', sub: 'Top quality, like a big studio game.', art: 'goal-aaa',
      short: 'a flagship game', focus: 'A flagship game is judged on feel, depth and polish everywhere.',
      w: { safe: 1.0, fast: 1.2, reach: 0.8, welcome: 1.0, feel: 1.4, depth: 1.3, story: 1.2 },
      must: ['audio', 'particles', 'shake', 'cutscene', 'dialogue', 'fpsView', 'settings'] },
    { id: 'free', title: 'Free, with ads or purchases', sub: 'Free to start. Earn from ads or optional items.', art: 'goal-free',
      short: 'a free game with ads or purchases', focus: 'A free game lives on the first minutes, weak phones and a reason to come back.',
      w: { safe: 1.0, fast: 1.3, reach: 1.4, welcome: 1.5, feel: 0.9, depth: 1.4, story: 0.4 },
      must: ['touch', 'lowEnd', 'economy', 'goals', 'saveSystem', 'tutorial'] },
    { id: 'paid', title: 'One fixed price', sub: 'Players pay once. It must feel worth it.', art: 'goal-paid',
      short: 'a game with a fixed price', focus: 'A paid game has to feel finished: no bugs, a real ending and solid feel.',
      w: { safe: 1.2, fast: 1.0, reach: 0.8, welcome: 1.0, feel: 1.3, depth: 1.3, story: 1.0 },
      must: ['saveSystem', 'saveVersion', 'settings', 'pause', 'story', 'audio'] },
    { id: 'jam', title: 'Just finish it', sub: 'A jam, a portfolio piece, or just for fun.', art: 'goal-jam',
      short: 'a finished small game', focus: 'A small game needs to start fast, be clear and actually end.',
      w: { safe: 1.0, fast: 0.8, reach: 0.8, welcome: 1.4, feel: 1.2, depth: 0.6, story: 0.5 },
      must: ['pause', 'tutorial', 'audio', 'goals', 'git'] }
  ];

  /* Rating areas. feats = scan feature keys. skip = feature keys that do not apply to games without combat. steps = prompt numbers that improve the area. */
  PQ.DIMS = [
    { id: 'safe', label: 'Safe to change', feats: ['memory', 'git', 'saveSystem', 'saveVersion'], steps: [1, 2, 3, 25, 27] },
    { id: 'fast', label: 'Runs smoothly', feats: ['delta', 'pooling', 'fpsView', 'lowEnd'], steps: [4, 24, 3] },
    { id: 'reach', label: 'Plays anywhere', feats: ['touch', 'pause', 'gamepad', 'fullscreen', 'settings'], steps: [6, 7] },
    { id: 'welcome', label: 'First minutes', feats: ['tutorial', 'toast', 'goals', 'settings'], steps: [12, 11, 8, 9, 26] },
    { id: 'feel', label: 'Game feel', feats: ['knockback', 'hitstop', 'shake', 'particles', 'audio', 'enemies'], skip: ['knockback', 'hitstop', 'enemies'], steps: [10, 17, 18, 21] },
    { id: 'depth', label: 'Depth and goals', feats: ['abilities', 'goals', 'economy', 'procedural'], steps: [5, 14, 15, 16, 13, 23] },
    { id: 'story', label: 'Story and mood', feats: ['story', 'cutscene', 'dialogue', 'audio'], steps: [19, 20, 22] }
  ];

  PQ.goalById = function (id) {
    for (var i = 0; i < PQ.GOALS.length; i++) if (PQ.GOALS[i].id === id) return PQ.GOALS[i];
    return null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
