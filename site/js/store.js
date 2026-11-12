/* Polish Quest - tiny local store. Uses localStorage on THIS device only. Never sent anywhere.
   Saves: the scan summary you confirmed (no code, no file contents), which prompts you ticked, and one setting. */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var KEY = 'pq.v1';
  var mem = null;   // fallback when localStorage is blocked (private mode, file:// in some browsers)

  function ls() { try { return g.localStorage || null; } catch (e) { return null; } }

  PQ.store = {
    KEY: KEY,
    load: function () {
      var s = ls(), raw = null;
      try { raw = s ? s.getItem(KEY) : null; } catch (e) { raw = null; }
      if (!raw) return mem ? JSON.parse(mem) : { v: 1, scan: null, done: {}, core: false };
      try { var o = JSON.parse(raw); if (o && o.v === 1) return o; } catch (e) { /* damaged: start fresh */ }
      return { v: 1, scan: null, done: {}, core: false };
    },
    save: function (state) {
      var out = { v: 1, scan: null, done: state.done || {}, core: !!state.core };
      if (state.scan && !state.scan.isSample) {
        var c = state.scan;
        out.scan = { name: c.name, engineId: c.engineId, genreId: c.genreId, deviceId: c.deviceId, features: c.features, protect: c.protect, memoryFile: c.memoryFile, entry: c.entry, notes: c.notes || [], stats: c.stats || null, goalId: c.goalId || '', nameSure: true, engineSure: true, genreSure: true, questions: [] };
      }
      var raw = JSON.stringify(out);
      mem = raw;
      var s = ls(); if (!s) return false;
      try { s.setItem(KEY, raw); return true; } catch (e) { return false; }
    },
    clear: function () {
      mem = null;
      var s = ls(); if (!s) return;
      try { var k = []; for (var i = 0; i < s.length; i++) { var n = s.key(i); if (n && n.indexOf('pq.') === 0) k.push(n); } k.forEach(function (n) { s.removeItem(n); }); } catch (e) { /* ignore */ }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
