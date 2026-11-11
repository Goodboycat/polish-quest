/* Polish Quest - start. Runs after every other script has loaded. */
(function (g) {
  'use strict';
  var PQ = g.PQ;
  function start() { try { PQ.ui.boot(); } catch (e) { var d = g.document.createElement('p'); d.className = 'err on'; d.textContent = 'Something broke while starting: ' + (e && e.message); (g.document.getElementById('stage') || g.document.body).appendChild(d); } }
  if (g.document.readyState === 'loading') g.document.addEventListener('DOMContentLoaded', start); else start();
})(window);
