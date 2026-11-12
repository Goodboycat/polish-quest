// Rewrites tools/duo/ledger.json from Coarena's live /v1/limits (today's used_usd per key). No keys printed.
import fs from 'node:fs'; import * as L from './lib.mjs';
await L.initLedger();
const l = JSON.parse(fs.readFileSync(L.ROOT + '/tools/duo/ledger.json', 'utf8'));
l.note = 'Synced ' + new Date().toISOString() + ' from live /v1/limits. Daily allowance resets 00:00 UTC. Stop line = 99% of $5 per key.';
fs.writeFileSync(L.ROOT + '/tools/duo/ledger.json', JSON.stringify(l, null, 1));
console.log(L.status());
