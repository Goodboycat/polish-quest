// Duo harness core: budget ledger + Coarena calls (streaming) + file-block parsing. No secrets in this file.
import fs from 'node:fs'; import path from 'node:path';
export const ROOT = '/home/user/webapp';
export const MODEL = 'claude-fable-5-2';
const BASE = 'https://coarena.ai/api/v1';
const PRICE_IN = 8 / 1e6, PRICE_OUT = 40 / 1e6;         // USD per token (measured: matches Coarena's spent_usd exactly)
export const STOP_FRACTION = 0.9, CAP_USD = 5;           // stop at 90% of 5 dollars, per key
const env = Object.fromEntries(fs.readFileSync('/home/user/.coarena.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split(/=(.*)/s).slice(0, 2)));
export const KEYS = { planner: env.COARENA_KEY_PLANNER, worker: env.COARENA_KEY_WORKER };
const LEDGER = path.join(ROOT, 'tools/duo/ledger.json');

// ledger = our own running total per key (survives the daily quota reset at 00:00 UTC)
function readLedger() { try { return JSON.parse(fs.readFileSync(LEDGER, 'utf8')); } catch { return null; } }
function writeLedger(l) { fs.writeFileSync(LEDGER, JSON.stringify(l, null, 1)); }
async function liveToday(key) {
  const r = await fetch(BASE + '/limits', { headers: { Authorization: 'Bearer ' + key } });
  const j = await r.json(); return j.data.today;
}
export async function initLedger() {
  let l = readLedger();
  if (!l) {
    l = {};
    for (const role of ['planner', 'worker']) { const t = await liveToday(KEYS[role]); l[role] = { spent: t.used_usd, lastLive: t.used_usd, calls: 0 }; }
    writeLedger(l);
  }
  return l;
}
async function sync(role) {
  const l = readLedger(); const t = await liveToday(KEYS[role]);
  const live = t.used_usd + (t.held_usd || 0);
  const delta = live >= l[role].lastLive ? live - l[role].lastLive : live;   // live < last => quota reset happened
  l[role].spent = +(l[role].spent + delta).toFixed(6); l[role].lastLive = live; writeLedger(l);
  return l[role].spent;
}
export function spent(role) { return readLedger()[role].spent; }
export function remaining(role) { return CAP_USD * STOP_FRACTION - spent(role); }
export function overBudget() { return remaining('planner') <= 0.05 || remaining('worker') <= 0.05; }
export function status() { const l = readLedger(); return `planner $${l.planner.spent.toFixed(2)} / worker $${l.worker.spent.toFixed(2)} of $${(CAP_USD * STOP_FRACTION).toFixed(2)} each`; }

// one chat call. messages: [{role, content}] where content may hold images {type:'image_url'}
export async function chat(role, messages, { maxTokens = 8000, effort = 'low', label = '' } = {}) {
  const inChars = JSON.stringify(messages.map(m => typeof m.content === 'string' ? m.content : m.content.filter(p => p.type === 'text'))).length;
  const imgs = messages.reduce((n, m) => n + (Array.isArray(m.content) ? m.content.filter(p => p.type === 'image_url').length : 0), 0);
  const worstCase = (inChars / 3 + imgs * 1500) * PRICE_IN + maxTokens * PRICE_OUT;
  const room = remaining(role);
  if (room <= 0.05) throw new Error('BUDGET_STOP ' + role);
  if (worstCase > room) {                                    // shrink the answer so we can never cross the 90% line
    maxTokens = Math.floor((room - (inChars / 3 + imgs * 1500) * PRICE_IN) / PRICE_OUT);
    if (maxTokens < 600) throw new Error('BUDGET_STOP ' + role + ' (not enough left for one more call)');
  }
  const body = { model: MODEL, messages, max_tokens: Math.min(maxTokens, 16000), reasoning_effort: effort, stream: true, stream_options: { include_usage: true } };
  let text = '', finish = '', usage = null;
  const ctl = AbortSignal.timeout(420000);
  const r = await fetch(BASE + '/chat/completions', { method: 'POST', headers: { Authorization: 'Bearer ' + KEYS[role], 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl });
  if (!r.ok) { const e = await r.text(); await sync(role).catch(() => {}); throw new Error('API ' + r.status + ' ' + e.slice(0, 300)); }
  const dec = new TextDecoder(); let buf = '';
  for await (const chunk of r.body) {
    buf += dec.decode(chunk, { stream: true }); let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue; const d = line.slice(5).trim(); if (d === '[DONE]') continue;
      try { const j = JSON.parse(d); const c = j.choices && j.choices[0]; if (c && c.delta && c.delta.content) text += c.delta.content; if (c && c.finish_reason) finish = c.finish_reason; if (j.usage) usage = j.usage; } catch { /* partial line */ }
    }
  }
  const total = await sync(role);
  const l = readLedger(); l[role].calls++; writeLedger(l);
  log(`[${role}] ${label} in=${usage ? usage.prompt_tokens : '?'} out=${usage ? usage.completion_tokens : '?'} finish=${finish} | ${status()}`);
  return { text, finish, usage, total };
}
export function log(s) { const line = new Date().toISOString().slice(11, 19) + ' ' + s; console.log(line); fs.appendFileSync(path.join(ROOT, 'tools/duo/duo.log'), line + '\n'); }

// parse worker output: FILE blocks (whole file), PATCH blocks (search/replace), DELETE lines
export function parseBlocks(text, finish) {
  const out = { files: [], patches: [], deletes: [], truncated: false };
  const fileRx = /=== FILE: (\S+) ===\n([\s\S]*?)\n=== END FILE ===/g; let m;
  while ((m = fileRx.exec(text))) out.files.push({ path: m[1], content: m[2].replace(/^```[a-z]*\n|\n```$/g, '') + '\n' });
  const patchRx = /=== PATCH: (\S+) ===\n([\s\S]*?)\n=== END PATCH ===/g;
  while ((m = patchRx.exec(text))) {
    const edits = []; const er = /<<<<<<< SEARCH\n([\s\S]*?)\n=======\n([\s\S]*?)\n>>>>>>> REPLACE/g; let e;
    while ((e = er.exec(m[2]))) edits.push({ search: e[1], replace: e[2] });
    out.patches.push({ path: m[1], edits });
  }
  const delRx = /=== DELETE: (\S+) ===/g; while ((m = delRx.exec(text))) out.deletes.push(m[1]);
  if (finish === 'length') out.truncated = true;
  return out;
}
const SAFE = /^(site\/|src3d\/|functions\/|tools\/duo\/spec\/|README\.md$|PROGRESS\.md$|docs\/)/;
export function applyBlocks(b) {
  const notes = [];
  for (const f of b.files) {
    if (!SAFE.test(f.path) || f.path.includes('..')) { notes.push('REFUSED path ' + f.path); continue; }
    const p = path.join(ROOT, f.path); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, f.content); notes.push('wrote ' + f.path + ' (' + f.content.length + ' chars)');
  }
  for (const pt of b.patches) {
    if (!SAFE.test(pt.path) || pt.path.includes('..')) { notes.push('REFUSED path ' + pt.path); continue; }
    const p = path.join(ROOT, pt.path); if (!fs.existsSync(p)) { notes.push('PATCH FAILED no file ' + pt.path); continue; }
    let src = fs.readFileSync(p, 'utf8'), ok = 0, bad = 0;
    for (const e of pt.edits) { if (src.includes(e.search)) { src = src.replace(e.search, () => e.replace); ok++; } else bad++; }
    fs.writeFileSync(p, src); notes.push(`patched ${pt.path}: ${ok} ok, ${bad} NOT FOUND`);
  }
  for (const d of b.deletes) { if (!SAFE.test(d) || d.includes('..')) { notes.push('REFUSED delete ' + d); continue; } try { fs.rmSync(path.join(ROOT, d), { recursive: true, force: true }); notes.push('deleted ' + d); } catch { /* ignore */ } }
  return notes;
}
export function readFiles(paths, cap = 60000) {
  let out = ''; for (const p of paths) { const f = path.join(ROOT, p); if (!fs.existsSync(f)) { out += `\n--- ${p} (does not exist yet) ---\n`; continue; } const s = fs.readFileSync(f, 'utf8'); out += `\n--- ${p} (${s.length} chars) ---\n${s.slice(0, cap)}${s.length > cap ? '\n[...cut...]' : ''}\n`; }
  return out;
}
