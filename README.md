# 📱 **XRPhone** 
# Pay invoices over the phone with the digital asset XRP

![main]*(https://github.com/jremi/xrphone/workflows/Deployment/badge.svg?branch=main)

## Current Version
ℹ️ **Alpha proof of concept.**  

**Note:** All of my testing so far has been only with US based mobile phone numbers. If you are going to try XRPhone, please realize that no testing has been done for non-US based numbers. In theory, they should work, but I have not tried.

## Overview
Customers create a XRPhone account and link with XUMM wallet. Businesses create a XRPhone merchant account linking with an XRP account and XRPhone supported third-party app integration (e.g: Freshbooks, Quickbooks Online, etc). Customers pay invoices over the phone by calling the XRPhone toll-free number. They provide the merchants XRPhone number followed by the invoice number they wish to apply the payment. 

The XRPhone automated assistant locates the invoice and asks the customer to enter how much they wish to pay. The assistant will then get the current XRP/USD spot price and send the payment request directly to the customers XUMM wallet. Once the customer accepts the payment request, the XRP transaction completes and seamlessly applies payment on the invoice contained within the merchants connected invoice system.

## Video Examples
- **XRPhone Customer Making Payment** 
  - https://youtu.be/30uDmbyour0
- **XRPhone Merchant Reviewing Invoice Payment** 
  - https://youtu.be/_gItKaqQD1Q
- **XRPhone Merchant Activation Setup** 
  - https://youtu.be/90osoP8XmA8
- **XRPhone Customer Activation Setup** 
  - https://youtu.be/ihxNCB9VAJI

## How Does This Work
1. Create a regular or merchant account.
    - Regular account (the person who will pay invoices over the phone will need XUMM wallet on their mobile device.)
    - Merchant account (the person who will link their XRP account to an invoicing app. They will need Freshbooks account and XRPL account).
2. Merchants will link the invoicing app via oAuth to XRPhone. 
3. Inside the invoicing app (e.g: Freshbooks) the merchant creates a new customer invoice. 
4. Take note of the invoice number. You can set any **numerical** invoice number.
5. Merchants will use existing or create new client (customer contact) inside Freshbooks. The most important part is the merchant sets one of the the customers phone number fields to the customers (regular account) XRPhone activated phone number.
> ***📝 Example:** If I'm a merchant and I want my customer John Doe to pay his invoices with XRP, then I would ask John Doe for his XRPhone phone number. John says, "+12223334444"... I then login to my invoice system (e.g: Freshbooks) and set Johns customer record phone number field to the XRPhone number of "+12223334444".* 
6. This is how XRPhone can effortlessly match the inbound caller to the merchant invoice.
7. Finally, I create an invoice for the client John Doe.

If I'm a merchant I would let my customers know they can pay using XRP over the phone thru marketing materials and/or simply putting a note at the bottom of the invoice template. If a customer attempts to call into the toll-free XRPhone inbound payments line and the system detects that the number is not yet activated with XRPhone, the voice assistant will tell the caller to first go to the XRPhone website to activate their phone number.

If the customers inbound call is successfully found, then the voice assistant will first ask the caller to enter the XRPhone merchants phone number. 

As a reminder: the merchants phone number is the person "business" who created the invoice and wants to get paid with XRP. If the merchant phone number is entered correctly the voice assistant will ask for the specific invoice number that the caller wishes to apply payment. If the invoice number is correctly entered the voice assistant will ask the amount for this payment. 

The assisant will then automatically determine the XRP/USD spot price via an XRPL oracle. Once the current XRP price is determined, the exact XRP transaction amount will be locked. The voice assistant will then send a XUMM payment request directly to the callers wallet. Once the wallet is opened by the caller and the transaction is "approved" (XUMM wallet requires the user to swipe), the XRPhone will verify XRPL obtained a successful result and the transaction has officially hit the ledger. 

Finally and most importantly the invoice is automatically updated in real-time within the merchant invoice system (e.g: Freshbooks) reflecting the applied payment for the associated invoice number.

## Live Demo
https://xrphone.app

Once you have a regular XRPhone account created you can call: 

> # XRPhone toll-free US number for making invoice payments: **1 (844) 739-01111**. 

The toll-free number will detect if your calling from an already activated XRPhone account. You will be asked to enter the XRPhone merchant number followed by your invoice number you wish to make payment.

> ***📌 Note**: I may take the demo down without notice since it has costs associated with the current SMS verification/auth system & programmable voice features.*

## Tech Stack
- Backend
  - Node.js / Express
- Frontend
  - Vue.js

## Core XRPhone Dependencies
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
