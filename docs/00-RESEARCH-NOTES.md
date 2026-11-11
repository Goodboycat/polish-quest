# Research notes (checked on 2026-11-11)
Every number below came from the official page named next to it, read on the date above. Fees change. Re-check before you rely on them.

## Hosting (all $0)
| Option | Free limits (official) | Catch |
|---|---|---|
| Cloudflare Pages | Unlimited sites, requests and bandwidth. 500 builds/month. 20,000 files/deploy. (developers.cloudflare.com/pages/platform/limits) | Free `*.pages.dev` address. No credit card needed. |
| GitHub Pages | Site up to 1 GB. Soft 100 GB/month bandwidth. Soft 10 builds/hour. (docs.github.com ... github-pages-limits) | GitHub says Pages is NOT allowed "to run your online business, e-commerce site..." If this site sells things, do not host it there. Repo must be public on the Free plan. |
| Netlify Free | 300 credits/month, hard limit. A production deploy costs 15 credits. Bandwidth costs 20 credits/GB (netlify.com/pricing + docs). | Sites pause when credits run out. |
| itch.io (HTML upload) | Free to upload a zip with index.html, "Kind of project: HTML" | Page lives on itch.io, not on your own address. Good for a showcase, not for the tool itself. |

## Getting paid
| Option | Fee (official) | Notes |
|---|---|---|
| itch.io | You choose the revenue share, 0 to 100%. Default 10%. Plus processor fee about $0.30 + 2.9% (PayPal or Stripe). Worked example from itch: $10 sale = $8.41 to you at the default 10%. | Payouts mode: itch is Merchant of Record. Payout needs $5 minimum, 7-day wait on each sale, review takes 10-14 days. Tax interview needed; a one-time $3.00 identity fee is listed under adjustments. Non-US sellers: 30% withholding unless a tax ID is given. |
| Gumroad | 10% + $0.50 per direct sale. 30% when a buyer finds you through Discover. No monthly fee. Merchant of Record since Jan 1, 2025 (gumroad.com/pricing). | Handles sales tax for you. Card/PayPal processing is reported separately by third-party sites; confirm on their page before relying on it. |
| Ko-fi | 0% on one-time tips. 5% on shop items, memberships, commissions unless you pay for Gold. Payment processor (PayPal/Stripe) fees on top (ko-fi.com/pricing, help center). | Ko-fi never holds funds, money goes straight to your PayPal/Stripe. |
| PayPal link | PayPal's own page lists 2.99% for goods/services plus a fixed fee for the US; third-party pages quote 3.49% + $0.49 for online checkout. Numbers differ by page and country. | Check paypal.com/us/business/paypal-business-fees for your country before you quote a price. |

## Genspark API (honest answer)
- I found NO public, documented, free general-purpose "Genspark API" for you to call from your own code.
- I did find an official command-line tool, `@genspark/cli` (npm, command `gsk`). It needs a Genspark login or API key, and its docs mention an LLM proxy for coding tools. Whether any of that is free for you, I could NOT confirm. Free plan is reported by third-party sites as 100 credits/day. Not verified on an official page.
- Genspark paid plans (official help center + third-party): Plus is $24.99/month, or $19.99/month billed yearly. 10,000 monthly credits.
- Conclusion: use the by-hand route for client #1. No key, no AI call, ever inside the website.

## Model name
- Anthropic's own page lists "Claude Sonnet 5.5" (released Sep 28, 2026). Source: anthropic.com/claude/sonnet. Use it as the standard model in Prompt 0. We do NOT claim these prompts were tested on it.

## Communities (rules read from search snippets; ALWAYS re-read the live rules page before posting)
- r/gamedev: self-promotion is not allowed. Do not post your tool there. Use it only to learn and to answer questions.
- r/IndieGameDevs: self-promotion of any type is banned per third-party summary.
- r/indiegames: promotion allowed with the right flair, needs game footage, and its rule 1 says "No generative AI". Do not post AI-made games there.
- r/IndieDev, r/WebGames: could not verify the current rules. Read the sidebar first.
- Safer: your own itch.io devlog and community, your own social accounts, and answering other people's questions with real help.
