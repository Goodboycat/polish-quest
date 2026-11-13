import * as c from '../../functions/api/coach.js';
import * as r from '../../functions/api/rate.js';
const mk = (b) => new Request('http://x/api', { method: 'POST', body: JSON.stringify(b) });
for (const [n, m, b] of [['coach', c, { question: 'hi', step: '3' }], ['rate', r, { goal: 'free', overall: 4 }]]) {
  const res = await m.onRequestPost({ request: mk(b), env: {} }); console.log(n, res.status, await res.text());
}
