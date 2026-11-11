# 1. Where to publish, and how to get paid ($0)
Checked on 2026-11-11 (see 00-RESEARCH-NOTES.md for sources). Fees change. Re-read each page before you rely on a number.

## Use this: Cloudflare Pages
Why: free, no credit card, no monthly cap on visits, and it allows a site that sells things. GitHub Pages says it is not for running an online business, so skip it for this one.
Secret costs to watch: a custom domain (about $10 a year, not free). The free address ends in `.pages.dev`. Stay on that for now.

### Steps (dashboard, no command line)
1. Go to dash.cloudflare.com and make a free account. Confirm your email.
2. Left menu: **Workers & Pages**. Tap **Create**. Pick the **Pages** tab. Pick **Upload assets** (direct upload).
3. Name the project, for example `polish-quest`. Your address will be `polish-quest.pages.dev` (if the name is taken, add a word).
4. Unzip `polish-quest-site.zip` on your computer. Drag the **contents** of the folder (index.html, css, js, assets...) into the box. Not the zip.
5. Tap **Deploy site**. Wait a minute. Tap the link.
6. Test it: open the link, turn on airplane mode, drop a game zip. It must still work. That is your proof.
7. To update later: Project > **Create new deployment** > upload the new folder.

Backup option: itch.io. Make a new project, Kind = HTML, upload the same zip, tick "played in the browser". Good for a showcase page you already know how to run.

## Getting paid (all $0 to start)
| Option | What it costs you | Good for | Watch out |
|---|---|---|---|
| itch.io | You pick the share (default 10%) plus a payment fee about 2.9% + $0.30 | You already sell there. Easiest start. | Payouts: $5 minimum, a 7-day wait per sale, first review 10-14 days, tax form needed |
| Ko-fi | 0% on tips, 5% on shop items, plus PayPal/Stripe fees | Simple "buy me a coffee" and a $19 shop item | Money goes straight to your PayPal/Stripe |
| Gumroad | 10% + $0.50 per direct sale | Selling a file or a service with tax handled for you | 30% if a buyer finds you via Discover |
| PayPal link | Fee varies by country (about 3%-3.5% + a fixed fee) | Client #1 only, friend-style | You handle receipts and taxes yourself |

My pick for you: **itch.io for the tool page, Ko-fi or a PayPal link for the $19 review**. Reason: you already know itch, and the first client is one person, so a link is enough.
Worked example: a $19 sale through a PayPal-style fee (about 3.5% + $0.49) leaves roughly $17.85. Check your own country's fee first.

## Money rule
Never let the website hold a payment form or a key. Payment happens on the other company's page. The site only holds a link (site/js/config.js, `BUY_URL`). When empty it honestly says "not open yet".
