#!/bin/bash
# Function tests against `wrangler pages dev` on :3000 (needs a git-ignored .dev.vars with COARENA_API_KEY). Prints status codes only.
H='Content-Type: application/json'; u=localhost:3000/api
t() { printf '%-22s' "$1"; shift; curl -s -m 40 -o /tmp/fn.out -w '%{http_code}' "$@"; printf '  %s\n' "$(head -c 90 /tmp/fn.out | tr '\n' ' ')"; }
t "coach good"      -X POST $u/coach -H "$H" -d '{"question":"What does Copy prompt do?","step":"3"}'
t "coach empty (400)" -X POST $u/coach -H "$H" -d '{"question":""}'
t "coach bad json"  -X POST $u/coach -H "$H" -d 'nope'
t "coach GET"       $u/coach
t "rate good"       -X POST $u/rate -H "$H" -d '{"goal":"free","overall":5,"scores":{"safe":6,"fast":1.3},"missing":["Pooling"]}'
t "rate bad goal (400)" -X POST $u/rate -H "$H" -d '{"goal":"xyz"}'
t "rate bad json"   -X POST $u/rate -H "$H" -d '{{'
node "$(dirname "$0")/fn-nokey.mjs"
