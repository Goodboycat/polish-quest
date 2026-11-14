/* Polish Quest - owner settings. Plain text, no keys, no secrets. Leave a value empty ('') and the page says honestly that it is not open yet.
   CONTACT_URL  where a client contacts you for the custom review. Example: 'mailto:you@example.com' or an itch.io page link.
   BUY_URL      a payment page link. Whoever runs that page must be named in PAY_PROVIDER.
   PAY_PROVIDER the company that handles payment, in plain words. Example: 'itch.io' or 'Gumroad' or 'Ko-fi'.
   HOST_NAME    the company that hosts this page. Example: 'Cloudflare' or 'GitHub'.
   REVIEW_PRICE shown on the review screen only if you fill it in. Example: '$19'. */
(function (g) {
  'use strict';
  g.PQ_CONFIG = {
    CONTACT_URL: 'mailto:goodboykitty2@gmail.com',
    BUY_URL: 'https://paypal.me/goodboycat/25USD',
    PAY_PROVIDER: 'PayPal',
    HOST_NAME: '',
    REVIEW_PRICE: '$25',
    DELIVERY_TEXT: 'Delivered within 3 days',
    REFUND_TEXT: "Refund if the plan isn't useful, just ask",
    SEND_TEXT: 'Send your game link to goodboykitty2@gmail.com',
    LAST_UPDATED: '2026-11-14'
  };
})(typeof window !== 'undefined' ? window : globalThis);
