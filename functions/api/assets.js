// Pages Function: GET /api/assets?source=all|polyhaven-models|polyhaven-textures|polyhaven-hdris|ambientcg|sketchfab&q=word
// Server-side lookup of CC0 assets. No key is needed for these three public APIs. The browser never calls them directly.
// Returns at most 12 items {name, url, license, source}. Always HTTP 200. Sites with no public search API are link-outs on the page.
const json = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1800' } });
const UA = { 'User-Agent': 'polish-quest (indie game helper)' };
const get = (u) => fetch(u, { headers: UA, signal: AbortSignal.timeout(6000) }).then((r) => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))));

async function polyhaven(type, q) {
  const d = await get('https://api.polyhaven.com/assets?t=' + type);
  return Object.keys(d).map((id) => ({ id, name: d[id].name, hay: (d[id].name + ' ' + (d[id].tags || []).join(' ') + ' ' + (d[id].categories || []).join(' ')).toLowerCase() }))
    .filter((a) => !q || a.hay.includes(q)).slice(0, 12).map((a) => ({ name: a.name, url: 'https://polyhaven.com/a/' + a.id, license: 'CC0', source: 'Poly Haven' }));
}
async function ambient(q) {
  const d = await get('https://ambientcg.com/api/v2/full_json?limit=12&sort=Popular&q=' + encodeURIComponent(q || 'wood'));
  return (d.foundAssets || []).slice(0, 12).map((a) => ({ name: a.displayName || a.assetId, url: 'https://ambientcg.com/a/' + a.assetId, license: 'CC0', source: 'ambientCG' }));
}
async function sketchfab(q) {
  const d = await get('https://api.sketchfab.com/v3/search?type=models&downloadable=true&license=cc0&count=12&q=' + encodeURIComponent(q || 'tree'));
  return (d.results || []).filter((m) => m.viewerUrl && m.license && /CC0/i.test(m.license.label || '')).slice(0, 12)
    .map((m) => ({ name: String(m.name || 'Model').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, '').slice(0, 60).trim(), url: m.viewerUrl, license: 'CC0', source: 'Sketchfab' }));
}
const SOURCES = {
  'polyhaven-models': (q) => polyhaven('models', q),
  'polyhaven-textures': (q) => polyhaven('textures', q),
  'polyhaven-hdris': (q) => polyhaven('hdris', q),
  ambientcg: ambient,
  sketchfab: sketchfab
};
export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  let src = u.searchParams.get('source') || (u.searchParams.get('type') ? 'polyhaven-' + u.searchParams.get('type') : 'all');
  if (src !== 'all' && !SOURCES[src]) src = 'all';
  const q = String(u.searchParams.get('q') || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().slice(0, 30);
  const names = src === 'all' ? ['polyhaven-models', 'ambientcg', 'sketchfab'] : [src];
  const res = await Promise.allSettled(names.map((n) => SOURCES[n](q)));
  const failed = res.filter((r) => r.status === 'rejected').length;
  let items = [];
  if (names.length > 1) { const lists = res.map((r) => (r.status === 'fulfilled' ? r.value : [])); for (let i = 0; items.length < 12 && i < 12; i++) lists.forEach((l) => { if (l[i] && items.length < 12) items.push(l[i]); }); }
  else items = res[0].status === 'fulfilled' ? res[0].value : [];
  return json({ items, source: src, offline: items.length === 0 && failed > 0, partial: failed > 0 && items.length > 0 });
}
export async function onRequest() { return json({ items: [], offline: true }); }
