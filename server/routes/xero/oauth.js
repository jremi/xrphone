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

const Xero = require("../../helpers/xero/xero-wrapper");

module.exports = async (req, res) => {
    const xero = new Xero();

    await xero.authAccount("authorization_code", req.query.code);

    if (xero.access_token) {
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
                    id: "xero",
                    access_token: xero.access_token,
                    refresh_token: xero.refresh_token,
                    tenant_id: xero.tenant_id,
                }
            );
            res.send(htmlTemplate);
        } else {
            await updateMerchantXrphoneAccount(phoneNumber, {
                app_integration: {
                    id: "xero",
                    access_token: xero.access_token,
                    refresh_token: xero.refresh_token,
                    tenant_id: xero.tenant_id,
                },
            });
            res.send(htmlTemplate);
        }
    } else {
        return res.sendStatus(500);
    }
};
