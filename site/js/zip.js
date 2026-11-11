/* Polish Quest - zip reader. Classic script, no network, no libraries.
   Reads only the central directory plus the few text files we ask for, using File.slice.
   Nothing is extracted to disk and nothing is uploaded. Works on File or Blob (also in Node 20+ for tests). */
(function (g) {
  'use strict';
  var PQ = g.PQ = g.PQ || {};
  var Z = PQ.zip = {};

  Z.LIMITS = { maxEntries: 400000, maxCentralDir: 200 * 1024 * 1024 };

  function err(code, msg) { var e = new Error(msg || code); e.code = code; return e; }
  Z.err = err;

  function u16(b, o) { return b[o] | (b[o + 1] << 8); }
  function u32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 16777216; }
  function u64(b, o) { return u32(b, o) + u32(b, o + 4) * 4294967296; }

  function readBytes(file, start, end) {
    return file.slice(start, end).arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
  }

  var utf8 = (typeof TextDecoder !== 'undefined') ? new TextDecoder('utf-8') : null;
  function decodeName(bytes, flags) {
    if (utf8) { try { return new TextDecoder((flags & 0x800) ? 'utf-8' : 'utf-8').decode(bytes); } catch (e) { /* fall through */ } }
    var s = ''; for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]); return s;
  }

  /* Look at the first bytes to give a friendly message for other archive types. */
  function sniff(head) {
    if (head[0] === 0x50 && head[1] === 0x4b) return 'zip';
    if (head[0] === 0x37 && head[1] === 0x7a && head[2] === 0xbc && head[3] === 0xaf) return '7z';
    if (head[0] === 0x52 && head[1] === 0x61 && head[2] === 0x72 && head[3] === 0x21) return 'rar';
    if (head[0] === 0x1f && head[1] === 0x8b) return 'gzip';
    return 'unknown';
  }

  /* Returns { entries:[{name,dir,size,csize,method,offset,flags}], total } */
  Z.readEntries = function (file) {
    var size = file.size;
    if (!size || size < 22) return Promise.reject(err('empty', 'This file is empty or too small to be a zip.'));
    var tailLen = Math.min(size, 65557 + 22 + 20);
    return readBytes(file, size - tailLen, size).then(function (tail) {
      var i, eocd = -1;
      for (i = tail.length - 22; i >= 0; i--) {
        if (tail[i] === 0x50 && tail[i + 1] === 0x4b && tail[i + 2] === 0x05 && tail[i + 3] === 0x06) { eocd = i; break; }
      }
      if (eocd < 0) {
        return readBytes(file, 0, Math.min(8, size)).then(function (head) {
          var kind = sniff(head);
          if (kind === '7z' || kind === 'rar' || kind === 'gzip') throw err('othertype', 'This is a ' + kind + ' file, not a zip. Please make a .zip of the project folder and drop that.');
          throw err('notzip', 'This does not look like a zip file (or it is damaged).');
        });
      }
      var total = u16(tail, eocd + 10), cdSize = u32(tail, eocd + 12), cdOff = u32(tail, eocd + 16);
      var needZip64 = (total === 0xffff || cdSize === 0xffffffff || cdOff === 0xffffffff);
      var step = Promise.resolve();
      if (needZip64) {
        // Zip64 locator sits right before the EOCD.
        var loc = eocd - 20;
        if (loc >= 0 && u32(tail, loc) === 0x07064b50) {
          var recOff = u64(tail, loc + 8);
          step = readBytes(file, recOff, recOff + 56).then(function (rec) {
            if (u32(rec, 0) !== 0x06064b50) throw err('badzip', 'The zip directory is damaged (zip64).');
            total = u64(rec, 32); cdSize = u64(rec, 40); cdOff = u64(rec, 48);
          });
        }
      }
      return step.then(function () {
        if (cdOff + cdSize > size) throw err('badzip', 'The zip directory points outside the file. The zip may be cut short or damaged.');
        if (total > Z.LIMITS.maxEntries) throw err('toomany', 'This zip has more than ' + Z.LIMITS.maxEntries + ' files, which is more than this page reads.');
        if (cdSize > Z.LIMITS.maxCentralDir) throw err('toomany', 'The zip directory is unusually large.');
        return readBytes(file, cdOff, cdOff + cdSize);
      }).then(function (cd) {
        var entries = [], p = 0;
        while (p + 46 <= cd.length && u32(cd, p) === 0x02014b50) {
          var flags = u16(cd, p + 8), method = u16(cd, p + 10);
          var csize = u32(cd, p + 20), usize = u32(cd, p + 24);
          var nl = u16(cd, p + 28), xl = u16(cd, p + 30), cl = u16(cd, p + 32);
          var off = u32(cd, p + 42);
          var name = decodeName(cd.subarray(p + 46, p + 46 + nl), flags);
          if (csize === 0xffffffff || usize === 0xffffffff || off === 0xffffffff) {
            var x = p + 46 + nl, xe = x + xl;
            while (x + 4 <= xe) {
              var id = u16(cd, x), len = u16(cd, x + 2), d = x + 4;
              if (id === 0x0001) {
                if (usize === 0xffffffff) { usize = u64(cd, d); d += 8; }
                if (csize === 0xffffffff) { csize = u64(cd, d); d += 8; }
                if (off === 0xffffffff) { off = u64(cd, d); d += 8; }
              }
              x += 4 + len;
            }
          }
          entries.push({ name: name, dir: name.charAt(name.length - 1) === '/', size: usize, csize: csize, method: method, offset: off, flags: flags });
          p += 46 + nl + xl + cl;
        }
        if (!entries.length && total > 0) throw err('badzip', 'Could not read the list of files in this zip.');
        return { entries: entries, total: entries.length, zipSize: size };
      });
    });
  };

  /* ---- inflate fallback (only used if the browser has no DecompressionStream) ---- */
  var inflateRaw = (function () {
    var sltree = { t: new Uint16Array(16), r: new Uint16Array(288) }, sdtree = { t: new Uint16Array(16), r: new Uint16Array(32) };
    var lbits = new Uint8Array(30), lbase = new Uint16Array(30), dbits = new Uint8Array(30), dbase = new Uint16Array(30);
    var clc = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    function bb(bits, base, delta, first) {
      var i, sum = first;
      for (i = 0; i < delta; ++i) bits[i] = 0;
      for (i = 0; i < 30 - delta; ++i) bits[i + delta] = (i / delta) | 0;
      for (i = 0; i < 30; ++i) { base[i] = sum; sum += 1 << bits[i]; }
    }
    function fixed(lt, dt) {
      var i;
      for (i = 0; i < 7; ++i) lt.t[i] = 0;
      lt.t[7] = 24; lt.t[8] = 152; lt.t[9] = 112;
      for (i = 0; i < 24; ++i) lt.r[i] = 256 + i;
      for (i = 0; i < 144; ++i) lt.r[24 + i] = i;
      for (i = 0; i < 8; ++i) lt.r[24 + 144 + i] = 280 + i;
      for (i = 0; i < 112; ++i) lt.r[24 + 144 + 8 + i] = 144 + i;
      for (i = 0; i < 5; ++i) dt.t[i] = 0;
      dt.t[5] = 32;
      for (i = 0; i < 32; ++i) dt.r[i] = i;
    }
    fixed(sltree, sdtree); bb(lbits, lbase, 4, 3); bb(dbits, dbase, 2, 1); lbits[28] = 0; lbase[28] = 258;
    var offs = new Uint16Array(16);
    function build(tr, lens, off, num) {
      var i, sum;
      for (i = 0; i < 16; ++i) tr.t[i] = 0;
      for (i = 0; i < num; ++i) tr.t[lens[off + i]]++;
      tr.t[0] = 0;
      for (sum = 0, i = 0; i < 16; ++i) { offs[i] = sum; sum += tr.t[i]; }
      for (i = 0; i < num; ++i) if (lens[off + i]) tr.r[offs[lens[off + i]]++] = i;
    }
    function need(d) { while (d.bc < 24) { d.tag |= (d.src[d.si++] || 0) << d.bc; d.bc += 8; } }
    function getbit(d) { if (!d.bc--) { d.tag = d.src[d.si++] || 0; d.bc = 7; } var b = d.tag & 1; d.tag >>>= 1; return b; }
    function bits(d, n, base) { if (!n) return base; need(d); var v = d.tag & (0xffff >> (16 - n)); d.tag >>>= n; d.bc -= n; return v + base; }
    function sym(d, tr) {
      need(d);
      var sum = 0, cur = 0, len = 0, tag = d.tag;
      do { cur = 2 * cur + (tag & 1); tag >>>= 1; ++len; sum += tr.t[len]; cur -= tr.t[len]; } while (cur >= 0 && len < 16);
      if (cur >= 0) throw new Error('bad huffman code');
      d.tag = tag; d.bc -= len; return tr.r[sum + cur];
    }
    var lens = new Uint8Array(320), ctree = { t: new Uint16Array(16), r: new Uint16Array(288) };
    function trees(d, lt, dt) {
      var hlit = bits(d, 5, 257), hdist = bits(d, 5, 1), hclen = bits(d, 4, 4), i, num = 0, s, n, prev;
      for (i = 0; i < 19; ++i) lens[i] = 0;
      for (i = 0; i < hclen; ++i) lens[clc[i]] = bits(d, 3, 0);
      build(ctree, lens, 0, 19);
      while (num < hlit + hdist) {
        s = sym(d, ctree);
        if (s === 16) { prev = lens[num - 1]; for (n = bits(d, 2, 3); n; --n) lens[num++] = prev; }
        else if (s === 17) { for (n = bits(d, 3, 3); n; --n) lens[num++] = 0; }
        else if (s === 18) { for (n = bits(d, 7, 11); n; --n) lens[num++] = 0; }
        else lens[num++] = s;
      }
      build(lt, lens, 0, hlit); build(dt, lens, hlit, hdist);
    }
    function block(d, lt, dt) {
      var dest = d.dest;
      for (;;) {
        var s = sym(d, lt);
        if (s === 256) return;
        if (s < 256) dest[d.dl++] = s;
        else {
          s -= 257;
          var len = bits(d, lbits[s], lbase[s]), di = sym(d, dt), o = d.dl - bits(d, dbits[di], dbase[di]);
          for (var i = o; i < o + len; i++) dest[d.dl++] = dest[i];
        }
        if (d.dl >= d.limit) return;
      }
    }
    function stored(d) {
      var src = d.src;
      while (d.bc > 8) { d.si--; d.bc -= 8; }
      var len = (src[d.si + 1] << 8) | src[d.si], inv = (src[d.si + 3] << 8) | src[d.si + 2];
      if (len !== (~inv & 0xffff)) throw new Error('bad stored block');
      d.si += 4;
      for (var i = len; i; --i) d.dest[d.dl++] = src[d.si++];
      d.bc = 0;
    }
    /* limit = max output bytes wanted. Returns Uint8Array (may be shorter than the full file). */
    return function (src, limit) {
      var d = { src: src, si: 0, tag: 0, bc: 0, dest: new Uint8Array(limit + 400), dl: 0, limit: limit };
      var lt = { t: new Uint16Array(16), r: new Uint16Array(288) }, dt = { t: new Uint16Array(16), r: new Uint16Array(32) };
      var fin, ty;
      do {
        fin = getbit(d); ty = bits(d, 2, 0);
        if (ty === 0) stored(d);
        else if (ty === 1) block(d, sltree, sdtree);
        else if (ty === 2) { trees(d, lt, dt); block(d, lt, dt); }
        else throw new Error('bad block type');
        if (d.dl >= d.limit) break;
        if (d.si > src.length + 8) break;
      } while (!fin);
      return d.dest.subarray(0, Math.min(d.dl, limit));
    };
  })();
  Z._inflateRaw = inflateRaw;   // exposed for tests

  function nativeInflate(bytes, limit) {
    var ds = new g.DecompressionStream('deflate-raw');
    var w = ds.writable.getWriter();
    w.write(bytes).catch(function () {}); w.close().catch(function () {});
    var r = ds.readable.getReader(), chunks = [], got = 0;
    function pump() {
      return r.read().then(function (x) {
        if (x.done) return;
        chunks.push(x.value); got += x.value.length;
        if (got >= limit) { try { r.cancel(); } catch (e) { /* ignore */ } return; }
        return pump();
      });
    }
    return pump().catch(function () { /* truncated input is expected when we cut the prefix */ }).then(function () {
      var out = new Uint8Array(Math.min(got, limit)), o = 0;
      for (var i = 0; i < chunks.length && o < out.length; i++) { var c = chunks[i]; if (o + c.length > out.length) c = c.subarray(0, out.length - o); out.set(c, o); o += c.length; }
      return out;
    });
  }

  Z.forceFallback = false;   // tests set this to true

  /* Read up to maxBytes of one entry. Returns Promise<Uint8Array|null> (null = cannot read: encrypted, odd method, damaged). */
  Z.readBytes = function (file, entry, maxBytes) {
    if (entry.dir || entry.size === 0) return Promise.resolve(new Uint8Array(0));
    if (entry.flags & 1) return Promise.resolve(null);                 // encrypted
    if (entry.method !== 0 && entry.method !== 8) return Promise.resolve(null);
    return readBytes(file, entry.offset, entry.offset + 30).then(function (lh) {
      if (u32(lh, 0) !== 0x04034b50) return null;
      var start = entry.offset + 30 + u16(lh, 26) + u16(lh, 28);
      var want = Math.min(entry.size, maxBytes);
      if (entry.method === 0) return readBytes(file, start, start + want);
      var cl = Math.min(entry.csize, want + 4096);
      return readBytes(file, start, start + cl).then(function (cbytes) {
        if (!Z.forceFallback && typeof g.DecompressionStream !== 'undefined') return nativeInflate(cbytes, want);
        try { return inflateRaw(cbytes, want); } catch (e) { return null; }
      });
    }).catch(function () { return null; });
  };

  /* Text only: returns null for binary files. */
  Z.readText = function (file, entry, maxBytes) {
    return Z.readBytes(file, entry, maxBytes).then(function (b) {
      if (!b) return null;
      var n = Math.min(b.length, 4096);
      for (var i = 0; i < n; i++) if (b[i] === 0) return null;
      if (utf8) return utf8.decode(b);
      var s = ''; for (var k = 0; k < b.length; k++) s += String.fromCharCode(b[k]); return s;
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
