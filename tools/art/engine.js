/* Polish Quest procedural pixel-art engine. Classic script, no deps.
   Draw shapes on a tiny grid, auto-shade + auto-outline, scale up with nearest-neighbor. */
(function (g) {
  'use strict';
  var PAL = {
    g: '#f5c542', G: '#b8862b', w: '#fff6dc', W: '#cfc8e6',
    r: '#e5484d', R: '#8f2335', b: '#4aa3ff', B: '#2a5fb0',
    t: '#3ad1b0', T: '#1f8a79', p: '#a06bff', P: '#5b3aa8',
    s: '#b9bfd6', S: '#6b7192', k: '#a8693a', K: '#6a3d22',
    y: '#f1e0b8', Y: '#c9ab72', n: '#1b1740', N: '#0d0b1f',
    o: '#ff9a3c', O: '#c25a14', l: '#7ddc5a', L: '#2f8f3f',
    m: '#ff7eb6', M: '#b04578', z: '#3a3560', '.': null
  };
  function h2r(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function r2h(a) { return '#' + a.map(function (v) { return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(h, t, f) { var a = h2r(h), b = h2r(t); return r2h(a.map(function (v, i) { return v + (b[i] - v) * f; })); }
  function lighten(h, f) { return mix(h, '#ffffff', f); }
  function darken(h, f) { return mix(h, '#000000', f); }
  function col(c) {
    if (c === null || c === '.') return null;
    if (c[0] === '#') return c;
    if (Object.prototype.hasOwnProperty.call(PAL, c)) return PAL[c];
    throw new Error('bad color ' + c);
  }
  // 5x7 bitmap font (rows as 5-bit numbers)
  var FONT = {
    ' ': [0, 0, 0, 0, 0, 0, 0],
    A: [14, 17, 17, 31, 17, 17, 17], B: [30, 17, 17, 30, 17, 17, 30], C: [14, 17, 16, 16, 16, 17, 14],
    D: [30, 17, 17, 17, 17, 17, 30], E: [31, 16, 16, 30, 16, 16, 31], F: [31, 16, 16, 30, 16, 16, 16],
    G: [14, 17, 16, 23, 17, 17, 15], H: [17, 17, 17, 31, 17, 17, 17], I: [14, 4, 4, 4, 4, 4, 14],
    J: [7, 2, 2, 2, 2, 18, 12], K: [17, 18, 20, 24, 20, 18, 17], L: [16, 16, 16, 16, 16, 16, 31],
    M: [17, 27, 21, 21, 17, 17, 17], N: [17, 17, 25, 21, 19, 17, 17], O: [14, 17, 17, 17, 17, 17, 14],
    P: [30, 17, 17, 30, 16, 16, 16], Q: [14, 17, 17, 17, 21, 18, 13], R: [30, 17, 17, 30, 20, 18, 17],
    S: [15, 16, 16, 14, 1, 1, 30], T: [31, 4, 4, 4, 4, 4, 4], U: [17, 17, 17, 17, 17, 17, 14],
    V: [17, 17, 17, 17, 17, 10, 4], W: [17, 17, 17, 21, 21, 21, 10], X: [17, 17, 10, 4, 10, 17, 17],
    Y: [17, 17, 10, 4, 4, 4, 4], Z: [31, 1, 2, 4, 8, 16, 31],
    '0': [14, 17, 19, 21, 25, 17, 14], '1': [4, 12, 4, 4, 4, 4, 14], '2': [14, 17, 1, 2, 4, 8, 31],
    '3': [31, 2, 4, 2, 1, 17, 14], '4': [2, 6, 10, 18, 31, 2, 2], '5': [31, 16, 30, 1, 1, 17, 14],
    '6': [6, 8, 16, 30, 17, 17, 14], '7': [31, 1, 2, 4, 8, 8, 8], '8': [14, 17, 17, 14, 17, 17, 14],
    '9': [14, 17, 17, 15, 1, 2, 12],
    '.': [0, 0, 0, 0, 0, 12, 12], '!': [4, 4, 4, 4, 4, 0, 4], '-': [0, 0, 0, 31, 0, 0, 0],
    ':': [0, 12, 12, 0, 12, 12, 0], '?': [14, 17, 1, 2, 4, 0, 4], '+': [0, 4, 4, 31, 4, 4, 0],
    '/': [1, 1, 2, 4, 8, 16, 16], "'": [4, 4, 8, 0, 0, 0, 0], ',': [0, 0, 0, 0, 12, 4, 8]
  };

  function Px(w, h) { this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  Px.prototype = {
    set: function (x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this; this.d[y * this.w + x] = col(c); return this; },
    get: function (x, y) { if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null; return this.d[y * this.w + x]; },
    d1: function (x, y, c) { return this.set(x, y, c); },
    r: function (x, y, w, h, c) { for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) this.set(x + i, y + j, c); return this; },
    c: function (cx, cy, rad, c) {
      for (var y = Math.floor(cy - rad); y <= Math.ceil(cy + rad); y++) for (var x = Math.floor(cx - rad); x <= Math.ceil(cx + rad); x++) {
        var dx = x + 0.5 - cx, dy = y + 0.5 - cy; if (dx * dx + dy * dy <= rad * rad) this.set(x, y, c);
      } return this;
    },
    e: function (cx, cy, rx, ry, c) {
      for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1) this.set(x, y, c);
      } return this;
    },
    l: function (x0, y0, x1, y1, c, w) {
      w = w || 1; var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, er = dx - dy, off = Math.floor((w - 1) / 2);
      for (var n = 0; n < 2000; n++) {
        this.r(x0 - off, y0 - off, w, w, c);
        if (x0 === x1 && y0 === y1) break; var e2 = 2 * er;
        if (e2 > -dy) { er -= dy; x0 += sx; } if (e2 < dx) { er += dx; y0 += sy; }
      } return this;
    },
    g: function (pts, c, dither) {
      var minY = 1e9, maxY = -1e9, minX = 1e9, maxX = -1e9; pts.forEach(function (p) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]); });
      for (var y = Math.floor(minY); y <= Math.ceil(maxY); y++) for (var x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
        var px = x + 0.5, py = y + 0.5, inside = false;
        for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          var xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
          if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
        }
        if (inside && (!dither || ((x + y) & 1) === 0)) this.set(x, y, c);
      } return this;
    },
    text: function (str, x, y, s, c) {
      var cx = x; s = s || 1;
      for (var k = 0; k < str.length; k++) {
        var gl = FONT[str[k].toUpperCase()] || FONT[' '];
        for (var r = 0; r < 7; r++) for (var b = 0; b < 5; b++) if (gl[r] & (16 >> b)) this.r(cx + b * s, y + r * s, s, s, c);
        cx += 6 * s;
      } return this;
    },
    // shading + outline pass; returns new Px (1px bigger content area must be padded by caller)
    render: function (o) {
      o = o || {}; var shade = o.shade !== false, outline = o.outline !== false, w = this.w, h = this.h, out = new Px(w, h), self = this;
      function at(x, y) { return self.get(x, y); }
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var c = at(x, y); if (!c) continue; var n = c;
        if (shade) { if (!at(x, y - 1)) n = lighten(c, 0.3); else if (!at(x, y + 1)) n = darken(c, 0.3); else if (!at(x + 1, y)) n = darken(c, 0.12); }
        out.d[y * w + x] = n;
      }
      if (outline) for (var y2 = 0; y2 < h; y2++) for (var x2 = 0; x2 < w; x2++) {
        if (at(x2, y2)) continue;
        if (at(x2 - 1, y2) || at(x2 + 1, y2) || at(x2, y2 - 1) || at(x2, y2 + 1)) out.d[y2 * w + x2] = PAL.N;
      }
      return out;
    },
    toCanvas: function () {
      var cv = document.createElement('canvas'); cv.width = this.w; cv.height = this.h; var cx = cv.getContext('2d'), id = cx.createImageData(this.w, this.h);
      for (var i = 0; i < this.d.length; i++) { var c = this.d[i]; if (!c) continue; var a = h2r(c); id.data[i * 4] = a[0]; id.data[i * 4 + 1] = a[1]; id.data[i * 4 + 2] = a[2]; id.data[i * 4 + 3] = 255; }
      cx.putImageData(id, 0, 0); return cv;
    }
  };

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function bayer(x, y) { return (BAYER[y & 3][x & 3] + 0.5) / 16; }

  var LIST = [];
  function icon(name, cat, fn, w, h) {
    w = w || 32; h = h || 32; var p = new Px(w, h); fn(p, PAL); LIST.push({ name: name, cat: cat, px: p.render(), w: w, h: h });
  }
  function raw(name, cat, w, h, fn) { var p = new Px(w, h); fn(p); LIST.push({ name: name, cat: cat, px: p, w: w, h: h }); }

  g.ART = { PAL: PAL, Px: Px, FONT: FONT, mix: mix, lighten: lighten, darken: darken, rng: rng, bayer: bayer, LIST: LIST, icon: icon, raw: raw };
})(window);
