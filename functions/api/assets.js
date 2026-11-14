// Pages Function: GET /api/assets?type=models|textures|hdris&q=word. Server-side lookup of CC0 assets on Poly Haven (no key needed).
// Returns at most 12 names with page links. The browser never calls Poly Haven directly. Always HTTP 200.
const json = (o) => new Response(JSON.stringify(o), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
export async function onRequestGet({ request }) {
  const u = new URL(request.url);
  const type = ['models', 'textures', 'hdris'].includes(u.searchParams.get('type')) ? u.searchParams.get('type') : 'models';
  const q = String(u.searchParams.get('q') || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().slice(0, 30);
  try {
    const r = await fetch('https://api.polyhaven.com/assets?t=' + type, { headers: { 'User-Agent': 'polish-quest (indie game helper)' }, signal: AbortSignal.timeout(6000) });
    if (!r.ok) return json({ items: [], offline: true });
    const d = await r.json();
    const items = Object.keys(d).map((id) => ({ id, name: d[id].name, tags: d[id].tags || [], cats: d[id].categories || [] }))
      .filter((a) => !q || (a.name + ' ' + a.tags.join(' ') + ' ' + a.cats.join(' ')).toLowerCase().includes(q))
      .slice(0, 12).map((a) => ({ name: a.name, url: 'https://polyhaven.com/a/' + a.id, license: 'CC0' }));
    return json({ items, source: 'Poly Haven', license: 'CC0' });
  } catch (e) { return json({ items: [], offline: true }); }
}
export async function onRequest() { return json({ items: [], offline: true }); }
