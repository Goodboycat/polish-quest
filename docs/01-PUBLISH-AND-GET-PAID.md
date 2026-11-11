# 1. Where to publish, and how to get paid ($0)
Checked on 2026-11-11 against the official pages named below. Fees change. Re-read each page before you rely on a number.

Verification status (2026-11-11):
- VERIFIED on developers.cloudflare.com/pages/platform/limits: Free plan = 500 builds a month, 20,000 files per site, 25 MiB per file, 100 custom domains per project, 100 projects per account.
- VERIFIED on cloudflare.com/service-specific-terms-developer-platform (the section that names Cloudflare Pages): I read all 10 clauses. None bans a commercial site or limits Pages to personal use. What they do say: you are responsible for your content and your visitors, no malware, no deceptive or business-name subdomains, and Cloudflare may rename a `pages.dev` address with one week notice (not a custom domain).
- VERIFIED on cloudflare.com/terms (master agreement, 2.2.1(a)): you may not resell access to Cloudflare or sign up on behalf of a third party. That matters if you ever host a CLIENT's site on your account. It does not matter for hosting your own tool.
- NOT FOUND on those pages: any rule about payment card data. A search result claimed one. I did not see it, so I do not repeat it. The site holds no payment form anyway.
- itch.io payments page: every number in the table below matches itch.io/docs/creators/payments.

## Use this: Cloudflare Pages
Why: free, no credit card. The Cloudflare terms I read do not ban commercial sites. (I did not find a stated cap on visits on the limits page; it lists builds, files and projects.) GitHub Pages says it is not for running an online business, so skip it for this one.
Secret costs to watch: a custom domain, not free. Cloudflare's own page says registration and renewal are "at or below what registries and ICANN charge us" (cloudflare.com/domains). The tracker cfdomainpricing.com, which copies Cloudflare's list, showed `.com` at US$10.46 for both registration and renewal on 2026-11-11 (US$ prices; some other search results quote higher numbers, so read the price in your Cloudflare dashboard before you pay). The free address ends in `.pages.dev`. Stay on that for now.

### Steps (dashboard, no command line)
1. Go to dash.cloudflare.com and make a free account. Confirm your email.
2. Left menu: **Workers & Pages**. Tap **Create**. Pick the **Pages** tab. Pick **Upload assets** (direct upload).
3. Name the project, for example `polish-quest`. Your address will be `polish-quest.pages.dev` (if the name is taken, add a word).
4. Unzip `polish-quest-site.zip` on your computer. Drag the **contents** of the folder (index.html, css, js, assets...) into the box. Not the zip.
5. Tap **Deploy site**. Wait a minute. Tap the link.
6. Test it: open the link, turn on airplane mode, drop a game zip. It must still work. That is your proof.
7. To update later: Project > **Create new deployment** > upload the new folder.

Backup option: itch.io. Make a new project, Kind = HTML, upload the same zip, tick "played in the browser". Good for a showcase page you already know how to run.
itch.io quality rules that apply (itch.io/docs/creators/quality-guidelines): fill in accurate metadata, add a cover image and screenshots, do not make "unrealistic statements about what your project can accomplish", and announce your own work only on the Release announcements board. Do not post ads in other people's pages or boards (it counts as spam).

## Getting paid (all $0 to start)
| Option | What it costs you | Good for | Watch out |
|---|---|---|---|
| itch.io | You pick the share (0% to 100%, default 10%) plus a payment fee of $0.30 + 2.9% for most transactions | You already sell there. Easiest start. | Payouts mode: $5 minimum, revenue is available 7 days after a sale, review usually 10-14 days (longer for first-time sellers), tax interview needed, one-time $3.00 identity fee, 30% withholding for non-US sellers without a tax number. itch.io's own example: a $10 sale pays you $8.41 at 10%. |
| Ko-fi | 0% on tips, 5% on shop items, plus PayPal/Stripe fees | Simple "buy me a coffee" and a $19 shop item | Money goes straight to your PayPal/Stripe |
| Gumroad | 10% + $0.50 per direct sale | Selling a file or a service with tax handled for you | 30% if a buyer finds you via Discover |
| PayPal link | Fee varies by country (about 3%-3.5% + a fixed fee) | Client #1 only, friend-style | You handle receipts and taxes yourself |

My pick for you: **itch.io for the tool page, Ko-fi or a PayPal link for the $19 review**. Reason: you already know itch, and the first client is one person, so a link is enough.
Worked example: a $19 sale through a PayPal-style fee (about 3.5% + $0.49) leaves roughly $17.85. Check your own country's fee first.

## Money rule
Never let the website hold a payment form or a key. Payment happens on the other company's page. The site only holds a link (site/js/config.js, `BUY_URL`). When empty it honestly says "not open yet".
