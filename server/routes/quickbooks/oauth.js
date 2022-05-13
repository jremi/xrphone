const fs = require("fs");
const path = require("path");
const htmlTemplate = fs.readFileSync(
  path.resolve(__dirname, "../../templates/oauth-app-connected.html"),
  "utf-8"
);
const {
  createMerchantXrphoneAccount,
  updateMerchantXrphoneAccount,
} = require("../../db/supabase");

const Quickbooks = require("../../helpers/quickbooks/quickbooks-wrapper");

module.exports = async (req, res) => {
  const quickbooks = new Quickbooks();

  await quickbooks.authAccount("authorization_code", req.query.code, null, req.query.realmId);

  if (quickbooks.access_token) {
    const {
      isMerchantInitialSetup,
      phoneNumber,
      xrpAccount,
      destinationTag,
      xrplNetwork,
    } = JSON.parse(decodeURIComponent(req.query.state));
    if (isMerchantInitialSetup) {
      await createMerchantXrphoneAccount(
        phoneNumber,
        xrpAccount,
        destinationTag,
        xrplNetwork,
        {
          id: "quickbooks",
          access_token: quickbooks.access_token,
          refresh_token: quickbooks.refresh_token,
          realm_id: quickbooks.realm_id,
        }
      );
      res.send(htmlTemplate);
    } else {
      await updateMerchantXrphoneAccount(phoneNumber, {
        app_integration: {
          id: "quickbooks",
          access_token: quickbooks.access_token,
          refresh_token: quickbooks.refresh_token,
          realm_id: quickbooks.realm_id,
        },
      });
      res.send(htmlTemplate);
    }
  } else {
    return res.sendStatus(500);
  }
};
