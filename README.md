## XRPhone
![main](https://github.com/jremi/xrphone/workflows/Deployment/badge.svg?branch=main)

## Overview
Customers create a XRPhone account and link with XUMM wallet. Businesses create a XRPhone merchant account linking with an XRP account and XRPhone supported third-party app integration (e.g: Freshbooks, Quickbooks Online, etc). Customers pay invoices over the phone by calling the XRPhone toll-free number. They provide the merchants XRPhone number followed by the invoice number they wish to apply the payment. The XRPhone automated assistant locates the invoice and asks the customer to enter how much they wish to pay. The assistant will then get the current XRP/USD spot price and send the payment request directly to the customers XUMM wallet. Once the customer accepts the payment request, the XRP transaction completes and automatically applies payment on the the invoice contained within the merchants connected invoice system.
## Tech Stack
- Backend
  - Node.js
  - Express
- Frontend
  - Vue.js

## Core Platform Dependencies
- Supabase (https://supabase.io)
  - Database
- Twilio (https://twilio.com)
  - Verify
  - Programmable Voice
  - Autopilot
- XRPL (https://xrpl.org)
- XUMM (https://xumm.app)

## Ripple / XRPL Labs Dependencies
- `ripple-lib` 
  - Transaction history
  - Trustline XRP/USD oracle 
    *https://dev.to/wietse/aggregated-xrp-usd-price-info-on-the-xrp-ledger-1087*
  - XRP to drops converter 
- `xumm-sdk` 
  - XRP transaction signing
- `xpring-js` 
  - PayString lookups

## Current App Integrations Supported
- Freshbooks (https://freshbooks.com)

---
## Development

To get started:

```shell
$ cd server
```

The npm script `dev:ngrok` updates the Twilio twiml voice url and Autopilot tasks action urls to temporary ngrok development url tunnel. It will also update the associated .env files for both the client and server folders to utilize the ngrok url.

```shell
$ npm run dev:ngrok
```

The npm script `serve` will spawn the Express server with nodemon (file watch mode). It will set the `process.env.NODE_ENV` to `development`.

```shell
$ npm run serve
```

Note, when your ngrok tunnels expire you will want to re-run the `npm run dev:ngrok` and then manually kill and restart `serve`. This will force the server to reload the updated `.env` file containing the updated ngrok urls that get manually injected when you run the `dev:ngrok` script.

## Production

Inside `/client` run `npm run build`. This will build the XRPhone client Vue web app and copy the dist build to the `/server/public` folder.

When running npm script `start` the Express server starts with `process.env.NODE_ENV` set as `production`. You can start the server in production mode by running:

```shell
$ cd server
```

```shell
$ npm run start
```

## Import Notes

Make sure to set for the client `.env.production` and for server `.env`. The `.env.example` in both the `/server` and the `/client` folders contain all of the necessary environment variables required to make the server / client run.
