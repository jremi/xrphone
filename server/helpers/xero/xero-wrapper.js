const axios = require("axios");
const { default: createAuthRefreshInterceptor } = require("axios-auth-refresh");
const { updateMerchantXrphoneAccount } = require("../../db/supabase");
const qs = require("qs");
const moment = require("moment");

const xeroBaseURL = 'https://api.xero.com/api.xro/2.0'

const oAuthURL = "https://identity.xero.com/connect/token";

const xeroApi = axios.create({
    baseURL: xeroBaseURL,
});

xeroApi.defaults.headers = {
    Accept: "application/json",
};

class Xero {
    constructor(options = {}) {
        this.phone_number = options.phone_number || null;
        this.access_token = options.access_token || null;
        this.refresh_token = options.refresh_token || null;
        this.tenant_id = options.tenant_id || null;
        xeroApi.interceptors.request.use((request) => {
            request.headers["Authorization"] = `Bearer ${this.access_token}`;
            return request;
        });
        createAuthRefreshInterceptor(xeroApi, this.authRefresh.bind(this));
    }

    async authRefresh(failedRequest) {
        console.log('failedRequest!', failedRequest);
        const {
            access_token: updatedAccessToken,
            refresh_token: updatedRefreshToken,
        } = await this.authAccount(
            "refresh_token",
            null,
            this.refresh_token
        );
        failedRequest.response.config.headers[
            "Authorization"
        ] = `Bearer ${updatedAccessToken}`;
        return Promise.resolve();
    }

    async authAccount(grantType, authCode, refreshToken) {
        const payload = {
            grant_type: grantType,
            redirect_uri: `${process.env.SERVER_URL}/plugins/xero/oauth`,
        };
        if (grantType === "authorization_code") {
            payload.code = authCode;
        } else if (grantType === "refresh_token") {
            payload.refresh_token = refreshToken;
        }
        const { data } = await axios
            .post(oAuthURL, qs.stringify(payload), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Basic ${Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString('base64')}`
                },
            })
            .catch((err) =>
                console.log("Problem fetching xero oAuth token!", err.message)
            );
        this.access_token = data.access_token;
        this.refresh_token = data.refresh_token;
        this.tenant_id = await this.lookupTenantId();
        if (grantType === "refresh_token") {
            if (this.phone_number) {
                await updateMerchantXrphoneAccount(this.phone_number, {
                    app_integration: {
                        id: "xero",
                        access_token: this.access_token,
                        refresh_token: this.refresh_token,
                        tenant_id: this.tenant_id,
                    },
                });
            }
        }
        return {
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            tenant_id: this.tenant_id,
        };
    }

    async lookupTenantId() {
        console.log('attempting lookup of tenant id...!');
        const { data } = await axios.get('https://api.xero.com/connections', {
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        }).catch(err => console.log('lookupTenantId:err', err));
        console.log('lookupTenantId:data', data);
        return data[0].tenantId;
    }

    async getInvoiceByInvoiceNumber(invoiceNumber) {
        const { data } = await xeroApi.get(
            `/Invoices/INV-${invoiceNumber}`,
            {
                headers: {
                    "Xero-Tenant-Id": this.tenant_id
                }
            }
        ).catch(err => console.log('getInvoiceByInvoiceNumber:err', err));
        if (data && data.Id) {
            this.invoice = {
                invoice_number: invoiceNumber,
                id: invoiceNumber,
                accountid: null, // Should not be needed for Xero integration
                outstanding: {
                    amount: data.Invoices[0].AmountDue,
                    code: data.Invoices[0].CurrencyCode,
                },
            };
        }
        return this.invoice;
    }

    async getPaymentAccount(code) {
        // id should be XRP or XPHO
        const { data: existingAccount } = await xeroApi.get(
            `/Accounts/${code}`,
            {
                headers: {
                    "Xero-Tenant-Id": this.tenant_id
                }
            }
        )
        if (existingAccount.Id) {
            return code;
        }
        const { data: createdAccount } = await xeroApi.put(
            '/Accounts',
            {
                Code: code,
                Name: `${code} via XRPhone`,
                Description: `Invoice payments made with virtual currency ${code} via XRPhone`,
                Type: "OTHERINCOME",
                TaxType: "NONE",
                EnablePaymentsToAccount: true
            },
            {
                headers: {
                    "Xero-Tenant-Id": this.tenant_id
                }
            }
        )
        if (createdAccount.Id) {
            return code;
        }
    }

    async applyPaymentToInvoice(
        accountId,
        invoiceId,
        usdAmount,
        currency,
        xrpAmount,
        xphoAmount,
        xrpTransactionId
    ) {
        const isXPHO = currency && currency.toLowerCase() === 'xpho';
        const paymentMethodRefId = await this.getPaymentAccount(isXPHO ? 'XPHO' : 'XRP');
        const { data } = await xeroApi
            .put('/Payments', {
                Invoice: {
                    InvoiceNumber: `INV-${invoiceId}`
                },
                Account: {
                    Code: paymentMethodRefId
                },
                Date: moment().format("YYYY-MM-DD"),
                Amount: usdAmount,
                Reference: `Paid (${isXPHO ? `${xphoAmount} XPHO` : `${xrpAmount} XRP`}) via XRPhone - XRPL Transaction: ${xrpTransactionId}`
            },
                {
                    headers: {
                        "Xero-Tenant-Id": this.tenant_id
                    }
                })
        return data.Status; // OK
    }
}

module.exports = Xero;
