/* Offer block. Shows only when the owner has set a link in config.js.
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
      preview: p && !(safe(c.BUY_URL) || safe(c.CONTACT_URL))
    };
  }
  function on() { var c = cfg(); return !!(c.buy || c.contact); }

  function make(kind) {
    var c = cfg();
    if (!c.buy && !c.contact) return null;
    var title = 'Want a human to check it?';
    var body = 'I play your build and send you the 10 fixes that matter most, as ready-to-paste prompts.';
    var wrap = document.createElement('div');
    wrap.className = 'offer offer-' + (kind === 'line' ? 'line' : 'card');
    wrap.setAttribute('data-t', 'offer');
    function link(href, text, primary) {
      var a = document.createElement('a');
      a.className = 'btn ' + (primary ? 'btn-primary' : 'btn-ghost');
      a.href = href;
      a.textContent = text;
      if (href.charAt(0) !== '#') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      return a;
    }
    if (kind === 'line') {
      var p = document.createElement('p');
      p.className = 'muted';
      p.appendChild(document.createTextNode('Still stuck? '));
      var a = document.createElement('a');
      a.href = c.buy || c.contact;
      a.textContent = 'Ask for a human review';
      if (a.getAttribute('href').charAt(0) !== '#') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      p.appendChild(a);
      p.appendChild(document.createTextNode(c.price ? ' (' + c.price + ').' : '.'));
      wrap.appendChild(p);
      return wrap;
    }
    var h = document.createElement('h2');
    h.textContent = title;
    var t = document.createElement('p');
    t.className = 'muted';
    t.textContent = body + (c.price ? ' ' + c.price + ' once.' : '');
    wrap.appendChild(h);
    wrap.appendChild(t);
    var row = document.createElement('div');
    row.className = 'offer-actions';
    if (c.buy) row.appendChild(link(c.buy, c.price ? 'Order for ' + c.price : 'Order a review', true));
    if (c.contact) row.appendChild(link(c.contact, 'Ask a question first', !c.buy));
    row.appendChild(link('#sample', 'See a sample review', false));
    wrap.appendChild(row);
    if (c.provider && c.buy && c.buy !== '#') {
      var n = document.createElement('p');
      n.className = 'muted small';
      n.textContent = 'Payment is handled by ' + c.provider + '. No sale is guaranteed to improve your game.';
      wrap.appendChild(n);
    } else if (c.preview) {
      var q = document.createElement('p');
      q.className = 'muted small';
      q.textContent = 'Preview only. Set BUY_URL in config.js to turn this on.';
      wrap.appendChild(q);
    }
    return wrap;
  }

  PQ.offer = make;
  PQ.offerOn = on;
})();
