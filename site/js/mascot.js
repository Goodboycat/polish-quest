(function () {
  'use strict';
  var PQ = window.PQ = window.PQ || {};
  var PRIV = 'Your zip never leaves your device. Only a short question you type to the coach is sent to an AI service (Coarena).';
  var F = 'Inter,system-ui,sans-serif';
  var CSS = '#pq-pip{position:fixed;right:24px;bottom:24px;z-index:50;font-family:' + F + '}' +
    '#pq-pip button{font-family:inherit;cursor:pointer}' +
    '#pq-pip button:focus-visible,#pq-pip input:focus-visible{outline:2px solid #FFC53D;outline-offset:3px}' +
    '.pip-b{width:72px;height:72px;padding:0;border:0;background:none;display:block;margin-left:auto}' +
    '.pip-b svg{width:100%;height:100%;display:block;animation:pipf 3s ease-in-out infinite alternate}' +
    '.pip-talk .pip-m{animation:pipm .28s linear infinite alternate;transform-origin:36px 45px}' +
    '.pip-say{position:absolute;right:0;bottom:84px;width:max-content;max-width:260px;background:#151923;border:1px solid #2A3040;border-radius:14px;padding:12px 14px;color:#F2F4F8;font-size:15px;line-height:22px;transition:opacity .3s}' +
    '.pip-say p{margin:0 0 4px}' +
    '.pip-hide{background:none;border:0;color:#A9B1C3;font-size:14px;min-height:44px;padding:0 8px;margin:0 -8px -12px;text-decoration:underline}' +
    '.pip-off{opacity:0;visibility:hidden;pointer-events:none}' +
    '.pip-min .pip-b{width:44px;height:44px;border-radius:50%;background:#151923;border:2px solid #FFC53D}' +
    '.pip-min .pip-b svg{display:none}.pip-min .pip-say{display:none}' +
    '.pip-panel{position:absolute;right:0;bottom:84px;width:320px;max-width:calc(100vw - 24px);max-height:calc(100dvh - 180px);overflow:auto;background:#151923;border:1px solid #2A3040;border-radius:14px;padding:16px;color:#F2F4F8;font-size:16px;line-height:24px}' +
    '.pip-panel h2{font-size:17px;line-height:24px;font-weight:650;margin:0}' +
    '.pip-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}' +
    '.pip-x{background:none;border:0;color:#A9B1C3;font-size:14px;min-height:44px;padding:0 8px;text-decoration:underline}' +
    '.pip-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}' +
    '.pip-chip{min-height:44px;padding:0 12px;border-radius:12px;background:#0B0D12;border:1px solid #2A3040;color:#F2F4F8;font-size:14px}' +
    '.pip-chip:hover{border-color:#FFC53D}' +
    '.pip-form{display:flex;gap:8px}' +
    '.pip-form input{flex:1;min-width:0;height:44px;border-radius:12px;border:1px solid #2A3040;background:#0B0D12;color:#F2F4F8;font:16px ' + F + ';padding:0 12px}' +
    '.pip-ask{height:44px;padding:0 16px;border-radius:12px;border:0;background:#FFC53D;color:#0B0D12;font-size:16px;font-weight:650}' +
    '.pip-reply{margin:12px 0 0;white-space:pre-wrap;border-left:2px solid #FFC53D;padding-left:10px}' +
    '.pip-reply:empty{display:none}' +
    '.pip-priv{margin:12px 0 0;color:#A9B1C3;font-size:14px;line-height:20px}' +
    '@keyframes pipf{from{transform:translateY(0)}to{transform:translateY(-4px)}}' +
    '@keyframes pipm{from{transform:scaleY(.5)}to{transform:scaleY(2.2)}}' +
    '@media (max-width:719px){#pq-pip{right:12px;bottom:96px}.pip-b{width:56px;height:56px}.pip-say,.pip-panel{bottom:64px}}' +
    '@media (prefers-reduced-motion:reduce){.pip-b svg,.pip-talk .pip-m{animation:none}}';
  function addCss(t) {
    try { var s = new CSSStyleSheet(); s.replaceSync(t); document.adoptedStyleSheets = document.adoptedStyleSheets.concat([s]); }
    catch (e) { var st = document.createElement('style'); st.textContent = t; document.head.appendChild(st); }
  }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function sv(tag, a) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  var LINES = {
    home: ['Hi, I am Pip.', 'Drop your game zip, or try the example.'],
    scan: ['I had a look at your game.', 'Fix anything I got wrong, then start.'],
    step0: ['Paste these rules first in every new chat.'],
    step: ['Copy, paste, play. One step at a time.', 'Stuck? Tap me.'],
    done: ['You finished all 26. Nice work.'],
    overview: ['Tap any step to jump there.'],
    fix: ['Pick what went wrong. I will give you a fix prompt.'],
    privacy: ['Your game stays on your device.']
  };
  var CAN = {
    'What do I do here?': 'Tap Copy prompt, paste it into your AI coding tool and let it finish. Then play your game for a minute. If it still works, tap Done, next step.',
    'The AI broke my game': 'Do not keep going. Open the Fix Kit at the top, pick what went wrong, and paste that fix prompt into the same chat.',
    'Can I skip this?': 'Yes. Tap Done, next step to move on. You can come back any time from All steps. Steps 1 to 4 are worth doing first.'
  };
  var DEF = 'I could not reach the coach right now. Try this: copy the prompt, paste it into your AI tool, play your game, then come back. If something broke, open the Fix Kit.';

  var root, btn, say, panel, reply, input, cur = { name: 'home', param: null }, q = [], qt = 0, busy = false;

  function talk(lines) {
    clearTimeout(qt); q = lines.slice(0, 3);
    if (root.classList.contains('pip-min') || !panel.classList.contains('pip-off')) return;
    nextLine();
  }
  function nextLine() {
    var body = say.firstChild;
    if (!q.length) { say.classList.add('pip-off'); root.classList.remove('pip-talk'); return; }
    body.textContent = q.shift();
    say.classList.remove('pip-off'); root.classList.add('pip-talk');
    qt = setTimeout(nextLine, 4500);
  }
  function quiet() { clearTimeout(qt); q = []; say.classList.add('pip-off'); root.classList.remove('pip-talk'); }
  function setMin(on) {
    root.classList.toggle('pip-min', on); ls('pq_pip_min', on ? '1' : '0');
    btn.setAttribute('aria-label', on ? 'Show Pip, the helper' : 'Ask Pip, the helper');
    if (on) { quiet(); openPanel(false); }
  }
  function openPanel(on) {
    panel.classList.toggle('pip-off', !on);
    btn.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) quiet();
  }
  function ask(text) {
    text = String(text || '').trim().slice(0, 200);
    if (!text || busy) return;
    busy = true; reply.textContent = 'Thinking...'; root.classList.add('pip-talk');
    var c = {};
    try { c = PQ.app.ctx() || {}; } catch (e) {}
    var body = {
      question: text, step: cur.name === 'step' ? Number(cur.param) || 0 : 0,
      gameName: String(c.name || '').slice(0, 60),
      engine: String(c.engine && c.engine.label || '').slice(0, 40),
      genre: String(c.genre && c.genre.label || '').slice(0, 40)
    };
    function done(t) { busy = false; reply.textContent = t; root.classList.remove('pip-talk'); }
    fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { if (!j || !j.reply) throw 0; done(String(j.reply).slice(0, 2000)); })
      .catch(function () { done(CAN[text] || DEF); });
  }
  function build() {
    addCss(CSS);
    root = h('div'); root.id = 'pq-pip'; root.setAttribute('data-t', 'mascot');
    say = h('div', 'pip-say pip-off'); say.setAttribute('aria-live', 'polite');
    say.appendChild(h('p'));
    var hide = h('button', 'pip-hide', 'Hide'); hide.type = 'button';
    hide.addEventListener('click', function () { setMin(true); });
    say.appendChild(hide);

    panel = h('div', 'pip-panel pip-off'); panel.id = 'pq-coach';
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Coach');
    var head = h('div', 'pip-head'); head.appendChild(h('h2', '', 'Ask Pip'));
    var x = h('button', 'pip-x', 'Close'); x.type = 'button';
    x.addEventListener('click', function () { openPanel(false); btn.focus(); });
    head.appendChild(x); panel.appendChild(head);
    var chips = h('div', 'pip-chips');
    Object.keys(CAN).forEach(function (t) {
      var c = h('button', 'pip-chip', t); c.type = 'button';
      c.addEventListener('click', function () { ask(t); });
      chips.appendChild(c);
    });
    panel.appendChild(chips);
    var form = h('div', 'pip-form');
    input = h('input'); input.type = 'text'; input.maxLength = 200;
    input.placeholder = 'Type a short question'; input.setAttribute('aria-label', 'Your question');
    input.setAttribute('data-t', 'coach-input');
    var go = h('button', 'pip-ask', 'Ask'); go.type = 'button'; go.setAttribute('data-t', 'coach-ask');
    function send() { ask(input.value); input.value = ''; }
    go.addEventListener('click', send);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    form.appendChild(input); form.appendChild(go); panel.appendChild(form);
    reply = h('p', 'pip-reply'); reply.setAttribute('aria-live', 'polite'); reply.setAttribute('data-t', 'coach-reply');
    panel.appendChild(reply);
    panel.appendChild(h('p', 'pip-priv', PRIV));
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { openPanel(false); btn.focus(); } });

    btn = h('button', 'pip-b'); btn.type = 'button'; btn.setAttribute('data-t', 'coach-open');
    btn.setAttribute('aria-controls', 'pq-coach');
    var svg = sv('svg', { viewBox: '0 0 72 72', 'aria-hidden': 'true' });
    svg.appendChild(sv('polygon', { points: '36,6 62,24 54,62 18,62 10,24', fill: '#151923', stroke: '#FFC53D', 'stroke-width': '3', 'stroke-linejoin': 'round' }));
    svg.appendChild(sv('circle', { cx: '28', cy: '32', r: '3.5', fill: '#F2F4F8' }));
    svg.appendChild(sv('circle', { cx: '44', cy: '32', r: '3.5', fill: '#F2F4F8' }));
    svg.appendChild(sv('ellipse', { 'class': 'pip-m', cx: '36', cy: '45', rx: '5', ry: '1.6', fill: '#F2F4F8' }));
    btn.appendChild(svg);
    btn.addEventListener('click', function () {
      if (root.classList.contains('pip-min')) setMin(false);
      openPanel(panel.classList.contains('pip-off'));
    });
    root.appendChild(say); root.appendChild(panel); root.appendChild(btn);
    document.body.appendChild(root);
    setMin(ls('pq_pip_min') === '1');
    openPanel(false);
  }
  function onRoute(e) {
    cur = e.detail || cur;
    var n = cur.name, lines = LINES[n] || [];
    if (n === 'step') {
      var s = Number(cur.param) || 0, cfg = window.PQ_CONFIG || PQ.CONFIG || {};
      if (s === 0) lines = LINES.step0;
      else if (s === 5 && (cfg.BUY_URL || cfg.CONTACT_URL) && !ls('pq_pip_offer')) {
        ls('pq_pip_offer', '1');
        lines = ['Five steps in. Good pace.', 'Want a human to check your game? See All steps.'];
      } else if (s > 1) lines = ['Step ' + s + '. Copy, paste, play.'];
    }
    reply.textContent = '';
    talk(lines);
  }
  function boot() {
    build();
    document.addEventListener('pq:route', onRoute);
    PQ.mascot = { say: function (t) { talk([].concat(t)); }, open: function () { openPanel(true); }, close: function () { openPanel(false); } };
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
