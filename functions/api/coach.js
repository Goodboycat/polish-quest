// Pages Function: POST /api/coach. The Coarena key lives only in env.COARENA_API_KEY (never in the repo or the browser).
// Always answers HTTP 200 with {reply, offline?}. When the AI is unavailable the reply is null/canned and offline is true,
// so the page falls back to its own tips and never breaks. Only a short question and tiny context are forwarded. Never zip contents.
const URL_ = 'https://coarena.ai/api/v1/chat/completions';
const MODEL = 'claude-fable-5-2';
const SYSTEM = 'You are Pip, a coach for beginner indie game developers who use an AI coding tool. Answer in at most 3 short plain sentences. No markdown, no lists. If unsure, say so.';
const clip = (v, n) => String(v == null ? '' : v).replace(/[\u0000-\u001f]+/g, ' ').trim().slice(0, n);
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

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

const CANNED = {
  scan: 'Check the four rows. Press Change on anything wrong, then press Yes, start.',
  step: 'Press Copy prompt. Paste it into your AI coding tool and let it finish. Play your game, then press Done, next step.',
  fix: 'Pick the button that matches your problem, choose the options, then copy the fix prompt.',
  home: 'Choose your game zip, or try the example game. Then follow one step at a time.'
};
function canned(step) {
  const s = String(step);
  if (/^\d+$/.test(s)) return CANNED.step;
  return CANNED[s] || CANNED.home;
}

export async function onRequestPost({ request, env }) {
  let b = {};
  try { b = await request.json(); } catch (e) { return json({ reply: null, offline: true }); }
  const q = clip(b.question != null ? b.question : b.q, 200);
  if (!q) return json({ error: 'empty question' }, 400);
  const step = clip(b.step, 12);
  const keys = keyList(env);
  if (!keys.length) return json({ reply: canned(step), offline: true });

  const ctx = [clip(b.gameName, 60) && 'Game: ' + clip(b.gameName, 60), clip(b.engine, 40) && 'Engine: ' + clip(b.engine, 40),
    clip(b.genre, 40) && 'Type: ' + clip(b.genre, 40), step && 'Screen: ' + step].filter(Boolean).join('. ');
  try {
    const r = await callAI(keys, {
        model: MODEL, max_tokens: 200, reasoning_effort: 'low',
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: (ctx ? ctx + '\n' : '') + 'Question: ' + q }]
      }, 7000);
    if (!r.ok) return json({ reply: canned(step), offline: true });
    const j = await r.json();
    const t = whole(clip(j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content, 600), j && j.choices && j.choices[0] && j.choices[0].finish_reason);
    if (!t) return json({ reply: canned(step), offline: true });
    return json({ reply: t });
  } catch (e) {
    return json({ reply: canned(step), offline: true });
  }
}

// Any other method: 200 with the offline marker so nothing on the page can break.
export async function onRequest() { return json({ reply: null, offline: true }); }
