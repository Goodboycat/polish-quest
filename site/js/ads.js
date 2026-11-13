/* Polish Quest - ad intent. Pure functions: scan + goal -> plain verdict, and a copy-paste prompt for rewarded-only ads.
   Reads only what the in-browser scan found (SDK names, rewarded/interstitial words in code). It cannot see how ads behave when the game runs. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};

  PQ.RULES_ADS = [
    'Rewarded only: the player taps a clear button, sees what they get, then chooses to watch.',
    'Never at launch and never in the first minutes. Let the player enjoy the game first.',
    'Never forced: no ad that blocks play, covers the controls or cannot be closed.',
    'Never right after a death or a mistake. Never mid-action. Only at a natural pause.',
    'Always optional: nobody who skips ads loses progress or hits a wall.',
    'Pay out the reward every time, even if the ad network fails to load an ad.'
  ];

  /* Returns null when the page has nothing to say (fixed price or just-finish game with no ad code). */
  PQ.adsReview = function (scan, goalId) {
    scan = scan || {};
    var a = scan.ads || { sdks: [], rewarded: 0, interstitial: 0, banner: 0, startup: [], files: [], any: false };
    var wantsAds = goalId === 'free';
    if (!wantsAds && !a.any) return null;
    var out = { wantsAds: wantsAds, ads: a, level: 'ok', title: '', lines: [], needPrompt: false, readOnly: !a.any && !!scan.isSample };
    var bad = a.interstitial > 0 || a.banner > 0;
    if (!a.any) {
      out.level = 'plan';
      out.title = 'No ads in the code yet. Good place to start.';
      out.lines.push('Plan for rewarded ads only, and add them late, after the game is fun without them.');
      out.needPrompt = true;
    } else if (goalId === 'paid') {
      out.level = 'warn';
      out.title = 'You chose a fixed price, but the code mentions ads.';
      out.lines.push('Players who paid once do not expect ads. Remove them, or change your goal if the game is free.');
    } else if (bad) {
      out.level = 'warn';
      out.title = 'Forced-style ads may be in the code.';
      if (a.interstitial > 0) out.lines.push('Found ' + a.interstitial + ' mention' + (a.interstitial === 1 ? '' : 's') + ' of interstitial ads (full screen, the player does not choose).');
      if (a.banner > 0) out.lines.push('Found ' + a.banner + ' mention' + (a.banner === 1 ? '' : 's') + ' of banner ads (always on screen).');
      if (a.startup.length) out.lines.push('Some sit in start-up looking files: ' + a.startup.join(', ') + '. Check they do not run at launch.');
      out.needPrompt = true;
    } else if (a.rewarded > 0) {
      out.level = 'good';
      out.title = 'Only rewarded ads found. That is the right kind.';
      out.lines.push('Found ' + a.rewarded + ' mention' + (a.rewarded === 1 ? '' : 's') + ' of rewarded ads and no forced kinds.');
      out.lines.push('Still check when the offer appears. Rewarded ads are only fair at a natural pause.');
      out.needPrompt = true;
    } else {
      out.level = 'warn';
      out.title = 'An ad kit is in the zip, but I could not see how it is used.';
      out.lines.push('Kit found: ' + a.sdks.join(', ') + '. Ask your AI tool to list every place it shows an ad.');
      out.needPrompt = true;
    }
    if (a.sdks.length && out.level !== 'warn' || (a.sdks.length && out.level === 'warn' && a.interstitial + a.banner > 0)) out.lines.push('Ad kits named in the zip: ' + a.sdks.join(', ') + '.');
    out.lines.push('This reads code only. I cannot see the game running, so test it by playing.');
    return out;
  };

  PQ.renderAdsPrompt = function (ctx, review) {
    var a = (review && review.ads) || {};
    var t = 'ADS CHECK - rewarded only, never forced. Game: ' + ctx.name + ' (' + ctx.genre.label + ', ' + ctx.engine.label + ')\n\n';
    t += 'GOAL\nThis game should earn only from rewarded ads or optional items. The player always chooses. Nothing is forced.\n\n';
    t += 'LOOK AT FIRST (read only, change nothing yet)\n';
    t += '- List every place the code shows or loads an ad of any kind, with file and line.\n';
    t += '- For each one say: rewarded (player chose), full screen (forced), banner (always on screen), or unclear.\n';
    if (a.sdks && a.sdks.length) t += '- The scan saw these ad kits: ' + a.sdks.join(', ') + '.\n';
    t += '- Tell me when in the game each ad can first appear. Say plainly if you cannot tell.\n\n';
    t += 'BUILD (small steps, in this order)\n';
    t += '1. Show me the list and wait for my OK before changing anything.\n';
    t += '2. Turn off every full-screen ad and every banner. Do not delete the code until I say so.\n';
    t += '3. Add one clear button for a rewarded ad at a natural pause, for example a revive after a loss screen is already showing, or double the reward on a results screen. The button says what the player gets.\n';
    t += '4. Give the reward every time, even if no ad could load. Show a short friendly message in that case.\n';
    t += '5. No rewarded offer in the first minutes, none during action, none at launch.\n';
    t += '6. Make sure a player who never watches an ad can still finish the game.\n\n';
    t += 'DO NOT TOUCH\n- Save data format and anything not about ads.\n- Do not add a new ad network or payment library. Use the one already there, or none until I choose.\n- Do not add tracking, accounts or anything that collects player data.\n\n';
    t += 'DONE WHEN\n- The list from the first step matches what the game really does.\n- No forced ad can appear anywhere.\n- The rewarded button is optional and the reward always arrives.\n\n';
    t += 'QUICK TEST (' + ctx.engine.run + ')\n1. Start the game and play 3 minutes. No ad must appear.\n2. Reach the pause where the rewarded button is. Tap it. The reward arrives.\n3. Turn off the internet and tap it again. The reward still arrives with a friendly message.\n\n';
    t += 'FINISH\nTell me in plain words what changed and what to check by hand. Say plainly what you could not run. Then stop.\n';
    return t;
  };

  /* Honest answer to "after finishing, is it good enough?". Short on purpose. */
  PQ.enoughLines = function () {
    return [
      'Maybe. The steps make a game feel finished. They cannot make it fun.',
      'The real test is watching someone else play it.',
      'No sale or player count is guaranteed.'
    ];
  };
  PQ.PLAYTEST = [
    'Sit next to a friend. Say nothing about how to play.',
    'Watch where they get stuck or look confused. Write it down. Do not help.',
    'Ask: what was the goal of the game?',
    'Ask: what was the best moment, and the most annoying one?',
    'Ask: would you play it again tomorrow? Then thank them.'
  ];
})(typeof window !== 'undefined' ? window : globalThis);
