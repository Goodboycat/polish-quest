/* Larger procedural art: backdrop, mascot, enemy, chest, UI frames. */
(function () {
  'use strict';
  var A = ART, R = A.raw;

  /* ---- hero backdrop 192x108 (night castle, dithered sky) ---- */
  R('bg_hero', 'art', 192, 108, function (p) {
    var rnd = A.rng(7), W = 192, H = 108, x, y;
    var sky = ['#0d0b1f', '#171244', '#2a1d6b', '#4a2f93', '#8a4fa8', '#d9708f'];
    for (y = 0; y < 76; y++) for (x = 0; x < W; x++) {
      var t = y / 76 * (sky.length - 1), i = Math.floor(t), f = t - i;
      var c = A.bayer(x, y) < f ? sky[Math.min(i + 1, sky.length - 1)] : sky[i];
      p.set(x, y, c);
    }
    for (var s = 0; s < 70; s++) { var sx = Math.floor(rnd() * W), sy = Math.floor(rnd() * 46); p.set(sx, sy, rnd() > 0.8 ? '#ffffff' : '#c8c0ff'); }
    p.c(150, 22, 10, '#fff2c4'); p.c(154, 19, 8.5, '#2a1d6b'); // crescent
    p.c(150, 22, 10, '#fff2c4'); p.c(155, 20, 8, '#3b2680');
    function ridge(base, amp, seed, col, col2) {
      var r2 = A.rng(seed), ph = r2() * 6, ph2 = r2() * 6;
      for (var xx = 0; xx < W; xx++) {
        var hh = base + Math.sin(xx / 17 + ph) * amp + Math.sin(xx / 7 + ph2) * amp * 0.4;
        for (var yy = Math.floor(hh); yy < H; yy++) p.set(xx, yy, (yy - hh < 2) ? col2 : col);
      }
    }
    ridge(58, 7, 3, '#251a5c', '#3a2a80');
    ridge(68, 5, 9, '#1a1347', '#2a2070');
    // castle on the far hill
    var cx = 52, cy = 56;
    p.r(cx - 14, cy - 8, 28, 12, '#120d33'); p.r(cx - 18, cy - 20, 8, 24, '#120d33'); p.r(cx + 10, cy - 24, 8, 28, '#120d33'); p.r(cx - 4, cy - 28, 8, 32, '#120d33');
    [[cx - 18, cy - 20], [cx + 10, cy - 24], [cx - 4, cy - 28]].forEach(function (q) { p.g([[q[0] - 1, q[1]], [q[0] + 4, q[1] - 7], [q[0] + 9, q[1]]], '#120d33'); });
    [[cx - 15, cy - 14], [cx + 13, cy - 18], [cx - 1, cy - 22], [cx - 8, cy - 4], [cx + 4, cy - 4], [cx + 13, cy - 8], [cx - 1, cy - 12]].forEach(function (q) { p.r(q[0], q[1], 2, 3, '#ffd36a'); });
    ridge(80, 4, 21, '#0f0b2b', '#1b1550');
    // foreground pines
    function pine(x0, base, h, col) {
      for (var j = 0; j < h; j++) { var wdt = Math.floor(j / h * 9) + 1; p.r(x0 - wdt, base - h + j, wdt * 2 + 1, 1, col); }
      p.r(x0, base, 1, 4, '#0a0820');
    }
    for (var k = 0; k < 14; k++) { var px = Math.floor(rnd() * W); pine(px, 92 + Math.floor(rnd() * 6), 14 + Math.floor(rnd() * 10), rnd() > 0.5 ? '#0a1a2a' : '#0d1f30'); }
    for (y = 94; y < H; y++) for (x = 0; x < W; x++) p.set(x, y, (y === 94) ? '#1f3a3a' : '#08111c');
    for (var fl = 0; fl < 22; fl++) p.set(Math.floor(rnd() * W), 96 + Math.floor(rnd() * 10), rnd() > 0.5 ? '#2f8f3f' : '#3ad1b0');
    for (var ff = 0; ff < 18; ff++) { var fx = Math.floor(rnd() * W), fy = 40 + Math.floor(rnd() * 50); p.set(fx, fy, '#ffe9a0'); if (rnd() > 0.6) p.set(fx + 1, fy, '#a98a2a'); }
  });

  /* ---- mascot: Sir Pixel, the cat knight 40x44 ---- */
  A.icon('mascot_cat', 'art', function (p) {
    // cape
    p.g([[8, 26], [32, 26], [36, 42], [4, 42]], 'R');
    // body
    p.r(12, 28, 16, 13, 'b'); p.r(12, 28, 16, 3, 'B'); p.r(17, 31, 6, 7, 'g');
    // feet
    p.r(12, 40, 6, 3, 's'); p.r(22, 40, 6, 3, 's');
    // head (cat)
    p.e(20, 17, 11, 9.5, 'o');
    p.g([[9, 12], [10, 2], [18, 8]], 'o'); p.g([[31, 12], [30, 2], [22, 8]], 'o');
    p.g([[11, 10], [11, 5], [15, 8]], 'm'); p.g([[29, 10], [29, 5], [25, 8]], 'm');
    // helmet band
    p.r(10, 9, 20, 4, 's'); p.r(10, 9, 20, 1, 'w'); p.r(19, 5, 2, 8, 's'); p.r(19, 2, 2, 3, 'r');
    // face
    p.e(14.5, 18, 2.8, 3.2, 'w'); p.e(25.5, 18, 2.8, 3.2, 'w'); p.c(14.5, 18.5, 1.6, 'n'); p.c(25.5, 18.5, 1.6, 'n'); p.d1(14, 17, 'w'); p.d1(25, 17, 'w');
    p.e(20, 22, 4.5, 3, 'y'); p.r(19, 21, 2, 1, 'm'); p.l(20, 22, 20, 23, 'n', 1); p.l(17, 24, 20, 23, 'n', 1); p.l(23, 24, 20, 23, 'n', 1);
    // whiskers
    p.l(7, 21, 11, 22, 'w', 1); p.l(7, 24, 11, 23, 'w', 1); p.l(33, 21, 29, 22, 'w', 1); p.l(33, 24, 29, 23, 'w', 1);
    // sword + shield
    p.l(34, 36, 34, 22, 'w', 2); p.r(31, 36, 7, 2, 'g'); p.r(33, 38, 3, 3, 'k');
    p.g([[3, 30], [11, 30], [11, 38], [7, 42], [3, 38]], 'p'); p.r(6, 32, 2, 7, 'g');
  }, 40, 46);

  /* ---- enemy: Bug Goblin 32x32 ---- */
  A.icon('enemy_bug', 'art', function (p) {
    p.e(16, 19, 12, 9, 'l'); p.g([[6, 14], [4, 5], [12, 11]], 'L'); p.g([[26, 14], [28, 5], [20, 11]], 'L');
    p.c(11, 17, 3.5, 'w'); p.c(21, 17, 3.5, 'w'); p.c(12, 18, 1.7, 'r'); p.c(20, 18, 1.7, 'r');
    p.r(9, 24, 14, 3, 'n'); [10, 13, 16, 19].forEach(function (x) { p.r(x, 24, 2, 2, 'w'); });
    p.r(8, 28, 4, 3, 'L'); p.r(20, 28, 4, 3, 'L');
  });

  /* ---- treasure chest (drop zone) 48x40 ---- */
  A.icon('chest', 'art', function (p) {
    p.g([[6, 10], [10, 3], [38, 3], [42, 10]], 'K'); p.r(6, 10, 36, 3, 'k');
    p.r(6, 14, 36, 22, 'k'); p.r(6, 14, 36, 4, 'K'); p.r(6, 22, 36, 2, 'K');
    p.r(11, 10, 3, 26, 'g'); p.r(34, 10, 3, 26, 'g'); p.r(21, 17, 6, 9, 'g'); p.r(23, 20, 2, 4, 'n');
    p.r(8, 14, 32, 1, 'y');
    p.g([[10, 4], [38, 4], [34, 0], [14, 0]], '.');
  }, 48, 40);

  /* ---- zip crate arrow (drop hint) ---- */
  A.icon('drop_arrow', 'art', function (p) {
    p.r(12, 2, 8, 14, 'g'); p.g([[4, 14], [28, 14], [16, 28]], 'g'); p.r(3, 28, 26, 3, 'w');
  });

  /* ---- UI frames (9-slice friendly) ---- */
  function frame(name, w, h, fill, edge, edge2, stud) {
    R(name, 'frame', w, h, function (p) {
      p.r(0, 2, w, h - 4, edge); p.r(2, 0, w - 4, h, edge); p.r(1, 1, w - 2, h - 2, edge);
      p.r(3, 3, w - 6, h - 6, edge2); p.r(4, 4, w - 8, h - 8, fill);
      p.r(4, 4, w - 8, 1, A.lighten(fill, 0.12)); p.r(4, h - 5, w - 8, 1, A.darken(fill, 0.25));
      // corner studs
      [[3, 3], [w - 6, 3], [3, h - 6], [w - 6, h - 6]].forEach(function (q) { p.r(q[0], q[1], 3, 3, stud); p.d1(q[0], q[1], '#ffffff'); });
      // outer outline
      for (var x = 0; x < w; x++) for (var y = 0; y < h; y++) {
        var edgeCell = x < 2 || y < 2 || x >= w - 2 || y >= h - 2;
        if (edgeCell) { var c = p.get(x, y); if (c) p.set(x, y, '#0d0b1f'); }
      }
      // round the corner pixels
      p.set(0, 0, '.'); p.set(w - 1, 0, '.'); p.set(0, h - 1, '.'); p.set(w - 1, h - 1, '.');
      p.set(1, 0, '.'); p.set(0, 1, '.'); p.set(w - 2, 0, '.'); p.set(w - 1, 1, '.'); p.set(0, h - 2, '.'); p.set(1, h - 1, '.'); p.set(w - 1, h - 2, '.'); p.set(w - 2, h - 1, '.');
    });
  }
  frame('frame_panel', 48, 48, '#211b5e', '#6b5fc7', '#3a2f94', '#f5c542');
  frame('frame_panel_dark', 48, 48, '#120d33', '#3a3560', '#201a55', '#6b7192');
  function btn(name, top, mid, bot, edge) {
    R(name, 'frame', 48, 32, function (p) {
      p.r(1, 0, 46, 32, '#0d0b1f'); p.r(0, 2, 48, 28, '#0d0b1f');
      p.r(2, 2, 44, 28, edge); p.r(3, 3, 42, 26, bot); p.r(3, 3, 42, 14, mid); p.r(3, 3, 42, 4, top); p.r(3, 24, 42, 5, A.darken(bot, 0.2));
      p.r(4, 4, 40, 1, A.lighten(top, 0.3));
    });
  }
  btn('btn_gold', '#ffe08a', '#f5c542', '#d9962b', '#8a5a14');
  btn('btn_blue', '#8cc8ff', '#4aa3ff', '#2f6fd0', '#1b3f85');
  btn('btn_green', '#b6f29a', '#7ddc5a', '#3fa645', '#1f6a2a');
  btn('btn_red', '#ff9ba0', '#e5484d', '#b22d3f', '#6a1526');
  btn('btn_ghost', '#4a4488', '#3a3560', '#2a2550', '#6b7192');

  /* ---- badges: rank 1..5 ---- */
  for (var rk = 1; rk <= 3; rk++) (function (rk) {
    var cols = ['k', 's', 'g'];
    A.icon('badge_' + rk, 'art', function (p) {
      p.c(16, 14, 11, cols[rk - 1]); p.c(16, 14, 8, A.darken(A.PAL[cols[rk - 1]], 0.25)); p.c(16, 14, 7, cols[rk - 1]);
      p.g([[8, 22], [14, 25], [11, 31], [5, 29]], 'r'); p.g([[24, 22], [18, 25], [21, 31], [27, 29]], 'r');
      p.text(String(rk), 13, 9, 1, 'n'); p.r(13, 9, 5, 1, 'n');
    });
  })(rk);
})();
