/* Polish Quest - sample review and store-page checklist. Plain data, no network.
   The sample is about a MADE-UP game and shows the shape of a human review. It is not a real client and not a result. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  PQ.SAMPLE_REVIEW = {
    game: 'Moon Cat Runner (made-up example)',
    fixes: [
      ['The first minute', 'The game opens on a menu with five buttons. Cut it to one Play button, and show one arrow at the first jump.'],
      ['Death feels unfair', 'The cat dies at the screen edge before the player can see the spikes. Show spikes 0.3 seconds sooner.'],
      ['Phone thumbs', 'The jump button sits under the thumb that holds the phone. Move it up and make it larger.']
    ],
    more: 'A real review has 10 of these, each as one prompt you paste into your AI tool.'
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
