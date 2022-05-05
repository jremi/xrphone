const routes = require("express").Router();

const encodeJwt = require("../../../helpers/auth/jwt/encode-jwt");
const authRequired = require("../../../middleware/auth-required");
const getTransactions = require("../../../helpers/ripple/get-transactions");

const {
  lookupRegularXrphoneAccountByXrpAddress,
  lookupMerchantXrphoneAccountByXrpAddress,
  lookupRegularXrphoneAccount,
  lookupMerchantXrphoneAccount,
  createRegularXrphoneAccount,
  // createMerchantXrphoneAccount,
  updateRegularXrphoneAccount,
  updateMerchantXrphoneAccount,
  deleteRegularXrphoneAccount,
  deleteMerchantXrphoneAccount,
} = require("../../../db/supabase");

const { checkSmsVerificationCode } = require("../../../helpers/twilio/verify");

routes.get("/lookup", async (req, res) => {
  const { phoneNumber, accountType } = req.query;
  if (accountType === "regular") {
    const { data: regularAccount } = await lookupRegularXrphoneAccount(
      phoneNumber
    );
    res.json({
      accountFound: !!regularAccount,
    });
  } else if (accountType === "merchant") {
    const { data: merchantAccount } = await lookupMerchantXrphoneAccount(
      phoneNumber
    );
    res.json({
      accountFound: !!merchantAccount,
    });
  }
});

routes.get("/lookup-by-xrp-account", async (req, res) => {
  const { xrp_account, xrpl_network } = req.query;
  const [regular, merchant] = await Promise.all([
    lookupRegularXrphoneAccountByXrpAddress(xrp_account, xrpl_network),
    lookupMerchantXrphoneAccountByXrpAddress(xrp_account, xrpl_network),
  ]);
  res.json({
    regular: regular.data,
    merchant: merchant.data,
  });
});

routes.post("/signin", async (req, res) => {
  const { phoneNumber, accountType, smsVerificationPin } = req.body;

  // Verify if the smsVerficationPin is a valid code
  const isVerified = await checkSmsVerificationCode(
    phoneNumber,
    smsVerificationPin
  );

  if (isVerified.status !== "approved") {
    return res.sendStatus(401);
  }

  if (accountType === "regular") {
    const { data: regularAccount } = await lookupRegularXrphoneAccount(
      phoneNumber
    );
    sendAuthToken(regularAccount, "regular");
  } else if (accountType === "merchant") {
    const { data: merchantAccount } = await lookupMerchantXrphoneAccount(
      phoneNumber
    );
    sendAuthToken(merchantAccount, "merchant");
  } else {
    res.sendStatus(400);
  }
  function sendAuthToken(account, accountType) {
    if (account) {
      const accountDetails = {
        id: account.id,
        accountType,
        phoneNumber: account.phone_number,
        xrpAccount: account.xrp_account,
        xrplNetwork: account.xrpl_network,
      };
      encodeJwt(accountDetails, null, (err, token) => {
        if (err) {
          res.sendStatus(500);
        } else {
          res.json({
            token,
            account: accountDetails,
          });
        }
      });
    } else {
      res.sendStatus(401);
    }
  }
});

routes.post("/create/regular", async (req, res) => {
  const user = await createRegularXrphoneAccount(
    req.body.phoneNumber,
    req.body.xrpAccount,
    req.body.xrplNetwork,
    req.body.xummUserToken
  );
  res.json(user);
});

/*
  // =============================================================
  // Currently for v.0.0.1 the /routes/freshbooks oAuth endpoint
  // app integration for merchants also creates the XRPPhone 
  // merchant account when user grants the freshbooks credentials.
  // =============================================================

  routes.post("/create/merchant", async (req, res) => {
    res.sendStatus(200);
  });
*/

routes.get("/paid-invoices", authRequired, async (req, res) => {
  let txns = await getTransactions(req.user.xrpAccount, req.user.xrplNetwork);
  res.json(txns);
});

// TODO: Possibly re-factor models into separate models folder
const settingsModel = (account) => ({
  id: account.id,
  createdAt: account.created_at,
  phoneNumber: account.phone_number,
  xrpAccount: account.xrp_account,
  xrplNetwork: account.xrpl_network,
});

routes.get("/settings", authRequired, async (req, res) => {
  const { accountType, phoneNumber } = req.user;
  let settings;
  if (accountType === "regular") {
    const { data: account } = await lookupRegularXrphoneAccount(phoneNumber);
    settings = settingsModel(account);
  } else if (accountType === "merchant") {
    const { data: account } = await lookupMerchantXrphoneAccount(phoneNumber);
    settings = {
      ...settingsModel(account),
      appIntegrationId: account.app_integration.id,
    };
  }
  res.json(settings);
});

routes.patch("/settings", authRequired, async (req, res) => {
  const { accountType, phoneNumber } = req.user;
  if (accountType === "regular") {
    const { data: settings } = await updateRegularXrphoneAccount(phoneNumber, {
      xrpl_network: req.body.xrplNetwork,
    });
    res.json(settingsModel(settings));
  } else if (accountType === "merchant") {
    const payload = {
      xrp_account: req.body.xrpAccount,
      xrpl_network: req.body.xrplNetwork,
    };
    // Merchant disconnected app integration
    if (!req.body.appIntegrationId) {
      payload.app_integration = {};
    }
    const { data: settings } = await updateMerchantXrphoneAccount(
      phoneNumber,
      payload
    );
    res.json(settingsModel(settings));
  }
});

routes.post("/regular/update", authRequired, async (req, res) => {
  const { phoneNumber } = req.user;
  console.log(phoneNumber, req.body);
  const { data: settings } = await updateRegularXrphoneAccount(
    phoneNumber,
    req.body
  );
  console.log(settings);
  return res.json(settings ? settingsModel(settings) : {});
});

routes.delete("/", authRequired, async (req, res) => {
  const { accountType, phoneNumber } = req.user;
  try {
    if (accountType === "regular") {
      await deleteRegularXrphoneAccount(phoneNumber);
    } else if (accountType === "merchant") {
      await deleteMerchantXrphoneAccount(phoneNumber);
    }
    res.json(200);
  } catch (err) {
    res.json(500);
  }
});

module.exports = routes;
