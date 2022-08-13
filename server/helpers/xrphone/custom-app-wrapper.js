const axios = require("axios");
const { default: createAuthRefreshInterceptor } = require("axios-auth-refresh");
const {
    updateMerchantXrphoneAccount,
    createDeveloperLogByAppId,
} = require("../../db/supabase");
const qs = require("qs");
const moment = require("moment");
const { version } = require("../../package.json");
const { AuthenticationClient } = require("auth0");

class CustomApp {
    constructor(app, options = {}) {
        console.log(app);
        this.app = app;
        this.phone_number = options.phone_number || null;
        this.access_token = options.access_token || null;
        this.refresh_token = options.refresh_token || null;
        this.customAppApi = axios.create({
            baseURL: app.appSettingsWebhookCallbackUrl,
        });
        this.customAppApi.defaults.headers = {
            Accept: "application/json",
            "User-Agent": `XRPhoneServer/${version}`,
        };
        this.customAppApi.interceptors.request.use((request) => {
            request.headers["Authorization"] = `Bearer ${this.access_token}`;
            return request;
        });
        createAuthRefreshInterceptor(
            this.customAppApi,
            this.authRefresh.bind(this)
        );
    }

    async authRefresh(failedRequest) {
        console.log("failedRequest!", failedRequest);
        const {
            access_token: updatedAccessToken,
            refresh_token: updatedRefreshToken,
        } = await this.authAccount("refresh_token", null, this.refresh_token);
        failedRequest.response.config.headers[
            "Authorization"
        ] = `Bearer ${updatedAccessToken}`;
        return Promise.resolve();
    }

    async authAccount(grantType, authCode, refreshToken) {
        const payload = {
            grant_type: grantType,
            client_id: this.app.appSettingsClientId,
        };
        if (grantType === "authorization_code") {
            payload.code = authCode;
            payload.client_secret = this.app.appSettingsClientSecret;
            payload.redirect_uri = `${process.env.SERVER_URL}/custom-apps/oauth`;
        } else if (grantType === "refresh_token") {
            payload.refresh_token = refreshToken;
        }
        const { data } = await axios
            .post(this.app.appSettingsOAuthTokenUrl, qs.stringify(payload), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .catch((err) => {
                console.log(JSON.stringify(err));
                console.log(
                    "Problem fetching custom app oAuth token!",
                    JSON.stringify(err.response.data),
                    "\n"
                );
            });
        this.access_token = data.access_token;
        this.refresh_token = data.refresh_token;
        if (grantType === "refresh_token") {
            if (this.phone_number) {
                await updateMerchantXrphoneAccount(this.phone_number, {
                    app_integration: {
                        id: this.app.id,
                        access_token: this.access_token,
                        refresh_token: this.refresh_token,
                    },
                });
            }
        }
        return {
            access_token: this.access_token,
            refresh_token: this.refresh_token,
        };
    }

    async getInvoiceByInvoiceNumber(invoiceNumber) {
        const webhookTopic = "INVOICE_LOOKUP";
        const payload = { invoiceNumber };
        const response = await this.customAppApi
            .post(`/`, payload, {
                headers: {
                    "X-XRPhone-Topic": webhookTopic,
                },
            })
            .catch(
                async (err) =>
                    await createDeveloperLogByAppId(
                        this.app.id,
                        webhookTopic,
                        JSON.stringify(payload),
                        err.response.status
                    )
            );
        if (response.data) {
            if (await this.verifyWebhookCallbackResponsePayloadCredentials(response.data)) {
                await createDeveloperLogByAppId(
                    this.app.id,
                    webhookTopic,
                    JSON.stringify(payload),
                    response.status
                );
                this.invoice = {
                    invoice_number: invoiceNumber,
                    id: invoiceNumber,
                    accountid: null,
                    outstanding: {
                        amount: response.data.amountDue,
                        code: response.data.currencyCode,
                    },
                };
                return this.invoice;
            }
            console.log('Webhook Callback Payload Credentials Invalid!');
        }
        return false
    }

    async applyPaymentToInvoice(
        accountId,
        invoiceId,
        usdAmount,
        currency,
        xrpAmount,
        xphoAmount,
        xrpTransactionId,
        customerPhoneNumber
    ) {
        const webhookTopic = "INVOICE_PAYMENT";
        const isXPHO = currency && currency.toLowerCase() === "xpho";
        const payload = {
            invoiceNumber: invoiceId,
            date: moment().utc().format(),
            amount: usdAmount,
            fiatCurrency: "USD",
            currency,
            xrplTransactionId: xrpTransactionId,
            customerPhoneNumber,
            memo: `Paid (${isXPHO ? `${xphoAmount} XPHO` : `${xrpAmount} XRP`
                }) via XRPhone - XRPL Transaction: ${xrpTransactionId}`,
        };
        if (isXPHO) payload.xphoAmount = xphoAmount;
        else payload.xrpAmount = xrpAmount;
        const response = await this.customAppApi
            .post(`/`, payload, {
                headers: {
                    "X-XRPhone-Topic": webhookTopic,
                },
            })
            .catch(
                async (err) =>
                    await createDeveloperLogByAppId(
                        this.app.id,
                        webhookTopic,
                        JSON.stringify(payload),
                        err.response.status
                    )
            );
        if (response.data) {
            if (await this.verifyWebhookCallbackResponsePayloadCredentials(response.data)) {
                await createDeveloperLogByAppId(
                    this.app.id,
                    webhookTopic,
                    JSON.stringify(payload),
                    response.status
                );
                return response.data;
            }
            console.log('Webhook Callback Payload Credentials Invalid!');
        }
        return false
    }

    async verifyWebhookCallbackResponsePayloadCredentials(payload) {
        if (!payload || !payload.metadata || !payload.metadata.credentials) return false;
        const sdkCredentialsAsString = Buffer.from(
            payload.metadata.credentials,
            "hex"
        ).toString();
        const [apiKey, apiSecret] = sdkCredentialsAsString.split(":");
        if (!apiKey || !apiSecret) return false;
        const auth0 = new AuthenticationClient({
            domain: process.env.AUTH0_DOMAIN,
            clientId: apiKey,
            clientSecret: apiSecret,
        });
        try {
            const { scope } = await auth0.clientCredentialsGrant({ audience: process.env.AUTH0_AUDIENCE });
            return scope && scope === 'xrphone-sdk';
        } catch (err) {
            return false;
        }
    }
}

module.exports = CustomApp;
