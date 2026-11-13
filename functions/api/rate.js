// Pages Function: POST /api/rate. Optional AI second opinion on a rating.
// The Coarena key lives only in env.COARENA_API_KEY. Only a goal id, genre, engine, seven scores and feature names are accepted.
// No code, file names or zip contents are read or forwarded. Always HTTP 200 with {reply} or {reply:null, offline:true}.
const URL_ = 'https://coarena.ai/api/v1/chat/completions';
const MODEL = 'claude-fable-5-2';
const GOALS = {
  aaa: 'a flagship game that should feel like a big studio game',
  free: 'a free game earning from rewarded ads or optional purchases',
  paid: 'a game sold once at a fixed price',
  jam: 'a small game made to finish (game jam, portfolio or for fun)'
};
const SYSTEM = 'You review indie games for a beginner developer. You get a goal, genre, engine and seven scores out of 10 from a CODE CHECKLIST. Nobody played the game and you must never say you did. ' +
  'Write at most 4 short plain sentences: what matters most for this goal, the biggest gap, and one first action. ' +
  'Do not invent sales, player numbers or facts. If the checklist cannot tell, say so. No markdown, no lists, no emojis.';
// Keys live only in env (COARENA_API_KEY, optional COARENA_API_KEY_2 and _3). If one is out of allowance (401/402/429) the next is tried.
function keyList(env) { return env ? [env.COARENA_API_KEY, env.COARENA_API_KEY_2, env.COARENA_API_KEY_3].filter(Boolean) : []; }
async function callAI(keys, body, ms) {
  let r = null;
  for (const k of keys) {
    r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + k, 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(ms) });
    if (r.ok || ![401, 402, 429].includes(r.status)) return r;
  }
  return r;
}

// If the model stopped mid-sentence, keep only whole sentences. Returns '' when nothing complete is left.
function whole(t, finish) {
  t = String(t || '').trim();
  if (!t) return '';
  if (finish !== 'length' && /[.!?]["')]?$/.test(t)) return t;
  const m = t.match(/^[\s\S]*[.!?]["')]?(?=\s|$)/);
  return m ? m[0].trim() : '';
}

const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, n);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const off = () => json({ reply: null, offline: true });

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return off(); }
  const goal = GOALS[clip(b.goal, 8)];
  if (!goal) return json({ error: 'unknown goal' }, 400);
  const keys = keyList(env);
  if (!keys.length) return off();
  const scores = [];
  if (b.scores && typeof b.scores === 'object') {
    for (const k of Object.keys(b.scores).slice(0, 7)) { const n = Number(b.scores[k]); if (isFinite(n)) scores.push(clip(k, 30) + ' ' + Math.max(0, Math.min(10, n)).toFixed(1)); }
  }
  const missing = Array.isArray(b.missing) ? b.missing.slice(0, 12).map(x => clip(x, 40)).filter(Boolean) : [];
  const overall = Math.max(0, Math.min(10, Number(b.overall) || 0)).toFixed(1);
  const user = 'Goal: ' + goal + '. Genre: ' + (clip(b.genre, 40) || 'unknown') + '. Engine: ' + (clip(b.engine, 40) || 'unknown') + '.\n' +
    'Overall checklist score: ' + overall + ' of 10.\nScores: ' + scores.join(', ') + '.\n' +
    'Not found in the code: ' + (missing.join(', ') || 'nothing listed') + '.';
  try {
    const r = await callAI(keys, { model: MODEL, max_tokens: 420, reasoning_effort: 'low', messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }] }, 10000);
    if (!r.ok) return off();
    const j = await r.json();
    const t = whole(clip(j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content, 800), j && j.choices && j.choices[0] && j.choices[0].finish_reason);
    return t ? json({ reply: t }) : off();
  } catch (e) { return off(); }
}

export async function onRequest() { return off(); }
