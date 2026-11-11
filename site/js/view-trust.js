/* Polish Quest - Trust screen: the "test it yourself" box plus live checks the page runs on itself. */
(function (g) {
  'use strict';
  var PQ = g.PQ, UI = PQ.ui, el = UI.el, doc = g.document;
  var V = UI.views.trust = {};
  var root, liveBox, violations = [];

  doc.addEventListener('securitypolicyviolation', function (e) {
    violations.push({ what: e.blockedURI || e.violatedDirective, dir: e.violatedDirective });
    if (violations.length > 20) violations.shift();
  });

  function row(ok, text) { return el('div', 'livei', [UI.icon(ok === true ? 'check' : (ok === false ? 'warning' : 'info')), el('span', '', text)]); }

  function cspOf() {
    var m = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
    return m ? m.getAttribute('content') : '';
  }

  function runChecks() {
    UI.clear(liveBox);
    var csp = cspOf(), loc = g.location, where = loc.protocol === 'file:' ? 'a file on your device' : loc.host;
    liveBox.appendChild(row(true, 'This page is running from ' + where + '.'));
    liveBox.appendChild(row(/connect-src 'none'/.test(csp), /connect-src 'none'/.test(csp)
      ? 'The page tells your browser: no network connections at all (connect-src none). The browser enforces this, not me.'
      : 'I could not find the no-network rule. Please tell the site owner.'));
    liveBox.appendChild(row(/default-src 'none'/.test(csp) && !/https?:/.test(csp), 'The rule list names no outside website. Scripts, styles, fonts and pictures may only come from this page itself.'));

    /* files the browser loaded for this page */
    var ext = [], total = 0;
    try {
      (g.performance.getEntriesByType('resource') || []).forEach(function (r) {
        total++;
        try { var u = new g.URL(r.name, loc.href); if (u.origin !== loc.origin && u.protocol !== 'data:' && u.protocol !== 'blob:') ext.push(u.host); } catch (e) { /* ignore */ }
      });
    } catch (e) { /* ignore */ }
    liveBox.appendChild(row(ext.length === 0, ext.length === 0
      ? 'Your browser loaded ' + total + ' files for this page. Zero came from another website.'
      : 'Warning: something was loaded from another website: ' + ext.slice(0, 3).join(', ') + '. That should never happen. Please tell the site owner.'));

    /* live attempt: try to talk to the network. The browser should refuse. */
    var status = row(null, 'Trying to make the page send something out, on purpose...');
    liveBox.appendChild(status);
    var before = violations.length, done = false;
    function finish(blocked, why) {
      if (done) return; done = true;
      var n = violations.length - before;
      UI.clear(status);
      var good = blocked;
      UI.add(status, [UI.icon(good ? 'check' : 'warning'), el('span', '', good
        ? 'Blocked. I just tried to send a request out and your browser refused (' + why + '). This is the same rule that stops any accident.'
        : 'The test request was NOT blocked. Do not drop a zip. Please tell the site owner.')]);
    }
    try {
      var p = g.fetch('https://example.com/pq-test?x=1', { method: 'POST', mode: 'no-cors', body: 'test', referrerPolicy: 'no-referrer' });
      p.then(function () { finish(false, ''); }, function () { finish(true, 'the fetch failed' + (violations.length > before ? ' and the browser logged a policy violation' : '')); });
    } catch (e) { finish(true, 'the browser refused to even try'); }
    g.setTimeout(function () { if (!done) finish(violations.length > before, 'no answer came back'); }, 2500);
  }

  V.init = function () {
    root = UI.$('v-trust');
    var cfg = g.PQ_CONFIG || {};
    var h = el('h1', 'sr', 'Is it safe?'); h.id = 'h-trust'; root.appendChild(h);
    root.appendChild(el('div', 'vhead', [UI.icon('shield', 'big'), el('div', '', [el('p', 'px', 'IS IT SAFE?'), el('p', '', 'I will not say "100% safe". I will show you how to check.')])]));

    var steps = el('ol', 'steps4', [
      el('li', '', [UI.icon('airplane'), el('span', '', '1. Open this page.')]),
      el('li', '', [UI.icon('cloud_off'), el('span', '', '2. Turn on airplane mode (or unplug the internet).')]),
      el('li', '', [UI.icon('zip'), el('span', '', '3. Drop a zip on the Drop screen.')]),
      el('li', '', [UI.icon('check'), el('span', '', '4. It still works. Nothing needed the internet.')])
    ]);
    root.appendChild(el('section', 'panel', [el('h2', '', 'TEST IT YOURSELF'), el('p', '', 'The easiest proof is one you do yourself. It takes one minute.'), steps,
      el('p', 'fine', [UI.icon('info', 'inl'), 'If the page was opened from the internet, load it once first, then turn airplane mode on. After that it does not need a connection.'])]));

    liveBox = el('div', 'live');
    var again = UI.btn('Run the check again', 'blue sm', 'play', runChecks);
    root.appendChild(el('section', 'panel', [el('h2', '', 'LIVE CHECK, RIGHT NOW'), el('p', 'fine', 'The page tests itself while you watch.'), liveBox, again]));

    var row3 = function (a, b) { return el('tr', '', [el('th', '', a), el('td', '', b)]); };
    root.appendChild(el('section', 'panel', [el('h2', '', 'WHAT HAPPENS TO YOUR ZIP'), el('table', 'tbl', [el('tbody', '', [
      row3('Where is it read?', 'Inside your browser, on your device. The page opens only the list of files and some text files it needs.'),
      row3('Is it uploaded?', 'No. There is no upload code on this page. The browser also blocks all outgoing connections (see the live check).'),
      row3('What is saved?', 'Only a short summary (name, engine, type, your tap choices) in your browser storage on this device. No code, no zip. The Forget button deletes it.'),
      row3('Accounts, tracking, ads?', 'None. No cookies, no analytics, no ads, nothing loaded from other websites.'),
      row3('What can I not promise?', 'I cannot see how your browser, extensions or the place that hosts this page behave. The checks above are about this page itself.')
    ])])]));

    var host = cfg.HOST_NAME ? 'This page is hosted by ' + cfg.HOST_NAME + '. They can see that someone opened the page (like any website host does), but not your zip, because it never leaves your device.' : 'The owner has not said yet where this page is hosted. A host can see that a page was opened, but never your zip, because it never leaves your device.';
    var pay = cfg.PAY_PROVIDER ? 'Payments for the custom review are handled by ' + cfg.PAY_PROVIDER + ', not by this page.' : 'There is no payment on this page. If you ever pay for something, the company that takes the payment will be named right there.';
    var priv = el('a', '', 'Read the full privacy page'); priv.href = 'privacy.html';
    root.appendChild(el('section', 'panel dark', [el('h2', '', 'OTHER COMPANIES'), el('p', '', host), el('p', '', pay), el('p', 'fine', [priv, '.'])]));

    var forget = UI.btn('Forget everything on this device', 'red sm', 'cross', function () { UI.forget(); });
    root.appendChild(el('div', 'row', [forget]));
  };
  V.enter = function () { runChecks(); };
})(typeof window !== 'undefined' ? window : globalThis);
