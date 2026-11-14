/* Offer card. One product: a plan made for the buyer's game, one prompt per task, that the buyer runs themselves.
   Shown once, on the #plan screen only. Appears only when the owner has set a link in config.js.
   Add ?offer=1 to the page address to preview it with placeholder links (nothing is sent anywhere). */
(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};

  function preview() {
    try { return /(?:^|[?&])offer=1(?:&|$)/.test(location.search); } catch (e) { return false; }
  }
  function safe(u) {
    u = String(u || '').trim();
    return /^(https:\/\/|mailto:)/i.test(u) ? u : '';
  }
  function cfg() {
    var c = window.PQ_CONFIG || {};
    var p = preview();
    return {
      buy: safe(c.BUY_URL) || (p ? '#' : ''),
      contact: safe(c.CONTACT_URL) || (p ? '#' : ''),
      price: String(c.REVIEW_PRICE || (p ? '$XX' : '')).slice(0, 12),
      provider: String(c.PAY_PROVIDER || '').slice(0, 40),
      delivery: String(c.DELIVERY_TEXT || '').slice(0, 120),
      refund: String(c.REFUND_TEXT || '').slice(0, 120),
      send: String(c.SEND_TEXT || '').slice(0, 120),
      preview: p && !(safe(c.BUY_URL) || safe(c.CONTACT_URL))
    };
  }
  function on() { var c = cfg(); return !!(c.buy || c.contact); }

  function make(kind) {
    if (kind === 'line') return null;            /* grey one-line offers were removed on purpose */
    var c = cfg();
    if (!c.buy && !c.contact) return null;
    var wrap = document.createElement('section');
    wrap.className = 'offer offer-card plan-card';
    wrap.setAttribute('data-t', 'offer');
    function node(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
    function link(href, text, primary) {
      var a = node('a', 'btn ' + (primary ? 'btn-primary' : 'btn-ghost'), text);
      a.href = href;
      if (href.charAt(0) !== '#') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    }
    var img = document.createElement('img');
    img.src = 'assets/art/review-card.png'; img.alt = ''; img.width = 112; img.height = 112; img.className = 'plan-pic';
    var side = node('div', 'plan-side');
    side.appendChild(img);
    if (c.price) { side.appendChild(node('p', 'plan-price', c.price)); side.appendChild(node('p', 'plan-once', 'one time')); }
    var main = node('div', 'plan-main');
    main.appendChild(node('p', 'muted', 'The free steps are the same for every game. The plan is written for yours.'));
    var ul = node('ul', 'plan-list');
    ['The tasks to do, in order', 'One ready prompt for each task', 'A check to tell you the task is done'].forEach(function (t) { ul.appendChild(node('li', '', t)); });
    main.appendChild(ul);
    var how = node('ol', 'plan-how');
    ['Pay', 'MAIL', 'The plan comes by email'].forEach(function (t) {
      var li = node('li', '');
      if (t === 'MAIL' && c.contact) {
        var ma = node('a', 'link', 'Send your game link by email');
        ma.href = c.contact + (/^mailto:/i.test(c.contact) ? '?subject=' + encodeURIComponent('My game link for the plan') : '');
        if (c.contact.charAt(0) !== '#' && !/^mailto:/i.test(c.contact)) { ma.target = '_blank'; ma.rel = 'noopener noreferrer'; }
        li.appendChild(ma);
      } else li.textContent = t === 'MAIL' ? 'Send your game link by email' : t;
      how.appendChild(li);
    });
    main.appendChild(how);
    var row = node('div', 'offer-actions');
    if (c.buy) row.appendChild(link(c.buy, c.price ? 'Order for ' + c.price : 'Order the plan', true));
    row.appendChild(link('#sample', 'See a sample plan', !c.buy));
    main.appendChild(row);
    var terms = [c.delivery, c.refund].filter(Boolean);   /* the raw address is not shown: step 2 is the mail link */
    if (terms.length) {
      var tl = node('ul', 'plan-terms');
      tl.setAttribute('data-t', 'plan-terms');
      terms.forEach(function (t) { tl.appendChild(node('li', '', t)); });
      main.appendChild(tl);
    }
    if (c.contact) { var q = node('a', 'link plan-q', 'Ask a question first'); q.href = c.contact; main.appendChild(q); }
    wrap.appendChild(side);
    wrap.appendChild(main);
    var note = '';
    if (c.provider && c.buy && c.buy !== '#') note = 'Payment is handled by ' + c.provider + '. You run the prompts yourself. No results are guaranteed.';
    else if (c.preview) note = 'Preview only. Set BUY_URL in config.js to turn this on.';
    if (note) wrap.appendChild(node('p', 'muted small plan-note', note));
    return wrap;
  }

  PQ.offer = make;
  PQ.offerOn = on;
})();
