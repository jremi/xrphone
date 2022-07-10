const fs = require("fs");
const path = require("path");
const htmlTemplate = fs.readFileSync(
    path.resolve(__dirname, "../../../templates/oauth-app-connected.html"),
    "utf-8"
);
const {
    lookupDeveloperAppById,
    createMerchantXrphoneAccount,
    updateMerchantXrphoneAccount,
} = require("../../../db/supabase");

const CustomApp = require("../../../helpers/xrphone/custom-app-wrapper");

module.exports = async (req, res) => {
    const state = JSON.parse(req.query.state);
    /**
     * Take the state.appId and do a app lookup against the devportal_application table
     * Return the appSettingsClientId, appSettingsClientSecret, appSettingsOAuthTokenUrl
     * 
     * This is used to authorize against the appSettingsOauthTokenUrl to perform 
     * a grant_type=authorization_code using the code returned from req.query.code
     * 
     * The returned values are then persisted to the XRPhone database as a custom app integration.
     */
    const { error, data: app } = await lookupDeveloperAppById(state.appId);

    if (error) {
        res.status(500).send(error); 
        return;
    }

    const customApp = new CustomApp(app);

    await customApp.authAccount("authorization_code", req.query.code);

    if (customApp.access_token) {
        const {
            appId,
            isMerchantInitialSetup,
            phoneNumber,
            xrpAccount,
            destinationTag,
            xrplNetwork,
        } = state;
        if (isMerchantInitialSetup) {
            await createMerchantXrphoneAccount(
                phoneNumber,
                xrpAccount,
                destinationTag,
                xrplNetwork,
                {
                    id: appId,
                    access_token: customApp.access_token,
                    refresh_token: customApp.refresh_token
                }
            );
            res.send(htmlTemplate);
        } else {
            await updateMerchantXrphoneAccount(phoneNumber, {
                app_integration: {
                    id: appId,
                    access_token: customApp.access_token,
                    refresh_token: customApp.refresh_token
                },
            });
            res.send(htmlTemplate);
        }
    } else {
        return res.sendStatus(500);
    }
};
