/* Polish Quest - owner settings. Plain text, no keys, no secrets. Leave a value empty ('') and the page says honestly that it is not open yet.
   CONTACT_URL  where a client contacts you for the custom review. Example: 'mailto:you@example.com' or an itch.io page link.
   BUY_URL      a payment page link. Whoever runs that page must be named in PAY_PROVIDER.
   PAY_PROVIDER the company that handles payment, in plain words. Example: 'itch.io' or 'Gumroad' or 'Ko-fi'.
   HOST_NAME    the company that hosts this page. Example: 'Cloudflare' or 'GitHub'.
   REVIEW_PRICE shown on the review screen only if you fill it in. Example: '$19'. */
(function (g) {
  'use strict';
  g.PQ_CONFIG = {
    CONTACT_URL: '',
    BUY_URL: '',
    PAY_PROVIDER: '',
    HOST_NAME: '',
    REVIEW_PRICE: '',
    LAST_UPDATED: '2026-11-11'
  };
})(typeof window !== 'undefined' ? window : globalThis);
