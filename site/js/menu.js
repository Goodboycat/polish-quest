/* Phone menu: a Menu button that lists every nav link, including Plan. Desktop keeps the plain links. */
(function () {
  'use strict';
  var btn = document.getElementById('menu-btn'), nav = document.querySelector('.bar nav');
  if (!btn || !nav) return;
  var panel = document.createElement('div');
  panel.id = 'menu-panel'; panel.className = 'menu-panel'; panel.hidden = true;
  Array.prototype.forEach.call(nav.querySelectorAll('a'), function (a) {
    var c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent; panel.appendChild(c);
  });
  var back = document.createElement('div'); back.className = 'menu-back'; back.hidden = true;
  back.addEventListener('click', function () { set(false); });
  document.body.appendChild(back);
  document.body.appendChild(panel);
  function set(open) { panel.hidden = !open; back.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); btn.textContent = open ? 'Close' : 'Menu'; }
  btn.addEventListener('click', function () { set(panel.hidden); });
  panel.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  window.addEventListener('hashchange', function () { set(false); });
})();
