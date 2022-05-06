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
const Freshbooks = require("../../helpers/freshbooks/freshbooks-wrapper");

module.exports = async (req, res) => {
  const freshbooks = new Freshbooks();

  await freshbooks.authAccount("authorization_code", req.query.code);

  if (freshbooks.access_token) {
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
          id: "freshbooks",
          access_token: freshbooks.access_token,
          refresh_token: freshbooks.refresh_token,
        }
      );
      res.send(htmlTemplate);
    } else {
      await updateMerchantXrphoneAccount(phoneNumber, {
        app_integration: {
          id: "freshbooks",
          access_token: freshbooks.access_token,
          refresh_token: freshbooks.refresh_token,
        },
      });
      res.send(htmlTemplate);
    }
  } else {
    return res.sendStatus(500);
  }
};
