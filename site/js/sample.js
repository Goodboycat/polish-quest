/* Polish Quest - sample review and store-page checklist. Plain data, no network.
   The sample is about a MADE-UP game and shows the shape of a plan. It is not a real client and not a result. Prompt lines here are short examples, not the real step prompts. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  PQ.SAMPLE_REVIEW = {
    game: 'Moon Cat Runner (made-up example)',
    tasks: [
      { name: 'Cut the first minute down', why: 'The game opens on a menu with five buttons. A new player leaves before the first jump.',
        prompt: 'Make the game start on one Play button. Show one arrow at the first jump. Do not change anything else.',
        check: 'A new player reaches the first jump in under 10 seconds without reading.' },
      { name: 'Make the spikes fair', why: 'The cat dies at the screen edge before the spikes can be seen.',
        prompt: 'Show spikes 0.3 seconds earlier. Keep the speed the same. List the files you changed.',
        check: 'Ten deaths in a row: none of them feels unfair.' },
      { name: 'Move the jump button', why: 'The jump button sits under the thumb that holds the phone.',
        prompt: 'Move the jump button up and make it larger. Keep it inside the safe area of the screen.',
        check: 'One-hand play on a phone works without stretching.' }
    ],
    more: 'A real plan has more tasks, each with its own ready prompt and done-check, written for your game. This one is an invented example.'
  };
  /* For a game with a price tag. A checklist, not a promise of sales. */
  PQ.STORE_CHECK = [
    'One sentence that says what the player does, in the first line of the page.',
    'Three to five screenshots from real play. The first one shows action, not a menu.',
    'A short trailer or GIF of the best 15 seconds.',
    'The price, what is included, and which devices it runs on.',
    'A plain list of anything unfinished. Honest pages get fewer refunds.',
    'A way to reach you for bug reports.'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
