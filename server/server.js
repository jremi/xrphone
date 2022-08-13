"use strict";

require("dotenv").config();

const { version } = require("./package.json");
const chalk = require("chalk");
const NodeCache = require("node-cache");
const express = require("express");
const cors = require("cors");
// const history = require("connect-history-api-fallback");
const userRoutes = require("./routes/xrphone/user");
const devPortalRoutes = require('./routes/xrphone/dev-portal');
const freshbooksOauth = require("./routes/freshbooks/oauth");
const quickbooksOauth = require("./routes/quickbooks/oauth");
const xeroOauth = require("./routes/xero/oauth");
const xummWebhookCallback = require("./routes/xumm/webhook-callback");
const shareLinkInvoiceLookup = require("./routes/xrphone/share-link/invoiceLookup");
const shareLinkInvoicePay = require("./routes/xrphone/share-link/invoicePay");
const { signIn, signInVerify, userTokenVerify } = require("./helpers/xumm");
const { xAppOtt, xAppPush, xAppEvent } = require("./helpers/xumm/xapp");
const paystringVerify = require("./routes/paystring/paystring-verify");
const autopilot = require("./routes/twilio/autopilot");
const customAppsOauth = require('./routes/xrphone/custom-apps/oauth');
const { customAppsListed, customAppsSandboxed, customAppsLookupById } = require('./routes/xrphone/custom-apps');
const verifyResponse = require("./routes/twilio/autopilot/collect/verify-response");
const {
  sendVerificationCodeSms,
  checkVerificationCodeSms,
} = require("./routes/twilio/verify");

const app = express();

global.transactionCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

const handleError = (middleware, req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      return res.sendStatus(400); // Bad request
    }
    next();
  });
};

app.use(cors());
// app.use(
//   history({
//     htmlAcceptHeaders: ["text/html", "application/json"],
//     ignoreRequestUrls: ["/plugins"],
//   })
// );
app.use((req, res, next) => {
  handleError(express.json(), req, res, next);
});
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

// Health Check
app.get("/ping", (req, res) => res.json({ message: "pong" }));

// Twilio Verify Phone Number
app.post("/twilio/verify/phone/send", sendVerificationCodeSms);
app.post("/twilio/verify/phone/check", checkVerificationCodeSms);

// Twilio Autopilot
app.post("/twilio/autopilot/tasks/action", (req, res) =>
  autopilot[req.body["CurrentTask"]](req, res)
);
app.post(
  "/twilio/autopilot/tasks/action/collect/question/webhook",
  verifyResponse
);

app.get('/dial', (req, res) => {
  res.status(301).redirect(`tel://${req.query.phone}`);
});

// XUMM Wallet
app.get("/xumm/signin", signIn);
app.post("/xumm/signin/verify", signInVerify);
app.post("/xumm/webhook/callback", xummWebhookCallback);
app.post("/xumm/usertoken/verify", userTokenVerify);

// XUMM Wallet - xApp
app.post("/xumm/xapp/ott", xAppOtt);
app.post("/xumm/xapp/push", xAppPush);
app.post("/xumm/xapp/event", xAppEvent);
// PayString Verify Address
app.post("/paystring/verify", paystringVerify);

// XRPhone Create User / Sign In / Sign Out / Paid Invoices / Settings
app.use("/user", userRoutes);

app.post("/share-link/invoice-lookup", shareLinkInvoiceLookup);
app.post("/share-link/invoice-pay", shareLinkInvoicePay);

// XRPhone App Integrations /  Create Merchant User
app.get("/plugins/freshbooks/oauth", freshbooksOauth);
app.get("/plugins/quickbooks/oauth", quickbooksOauth);
app.get("/plugins/xero/oauth", xeroOauth);

// XRPhone Custom External Developer App Integrations
app.get("/custom-apps/oauth", customAppsOauth);
app.get("/custom-apps/listed", customAppsListed);
app.get("/custom-apps/sandboxed", customAppsSandboxed);
app.get("/custom-apps/:id", customAppsLookupById);

app.use("/api/v1/dev-portal", devPortalRoutes)

// ********** Server Listener **************

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n XRPhone Node.js Server v${version}\n`);
  console.log(`  Server environment: ${chalk.bgCyanBright.black(` ${process.env.NODE_ENV} `)}\n`);
  console.log(`  Server running at:`);
  console.log(
    `  - Local:   ${chalk.cyan(`http://localhost:${chalk.bold(PORT)}/`)}`
  );
  console.log(
    `  - Network: ${chalk.cyan(`${process.env.SERVER_URL}/`)}\n`
  );
});

process.on('uncaughtException', function (err) {

  // Handle the error safely
  console.log('global uncaughtException', err);
})