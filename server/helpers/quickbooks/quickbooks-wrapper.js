const axios = require("axios");
const { default: createAuthRefreshInterceptor } = require("axios-auth-refresh");
const { updateMerchantXrphoneAccount } = require("../../db/supabase");
const qs = require("qs");

const quickbooksBaseURL = `https://${process.env.NODE_ENV === "development" ? "sandbox-" : ""
  }quickbooks.api.intuit.com`;

const oAuthURL = "https://oauth.platform.intuit.com";

const quickbooksApi = axios.create({
  baseURL: quickbooksBaseURL,
});

quickbooksApi.defaults.headers = {
  Accept: "application/json",
};

class Quickbooks {
  constructor(options = {}) {
    this.phone_number = options.phone_number || null;
    this.access_token = options.access_token || null;
    this.refresh_token = options.refresh_token || null;
    this.realm_id = options.realm_id || null;
    quickbooksApi.interceptors.request.use((request) => {
      request.headers["Authorization"] = `Bearer ${options.access_token}`;
      return request;
    });
    createAuthRefreshInterceptor(quickbooksApi, this.authRefresh.bind(this));
  }

  async authRefresh(failedRequest) {
    const {
      access_token: updatedAccessToken,
      refresh_token: updatedRefreshToken,
    } = await this.authAccount(
      "refresh_token",
      null,
      this.refresh_token,
      this.realm_id
    );
    failedRequest.response.config.headers[
      "Authorization"
    ] = `Bearer ${updatedAccessToken}`;
    return Promise.resolve();
  }

  async authAccount(grantType, authCode, refreshToken, realmId) {
    const payload = {
      grant_type: grantType,
      client_id: process.env.QUICKBOOKS_CLIENT_ID,
      client_secret: process.env.QUICKBOOKS_CLIENT_SECRET,
      redirect_uri: `${process.env.SERVER_URL}/plugins/quickbooks/oauth`,
    };
    if (grantType === "authorization_code") {
      payload.code = authCode;
    } else if (grantType === "refresh_token") {
      payload.refresh_token = refreshToken;
    }
    const { data } = await axios
      .post(`${oAuthURL}/oauth2/v1/tokens/bearer`, qs.stringify(payload), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .catch((err) =>
        console.log("Problem fetching quickbooks oAuth token!", err.message)
      );
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.realm_id = realmId;
    if (grantType === "refresh_token") {
      if (this.phone_number) {
        await updateMerchantXrphoneAccount(this.phone_number, {
          app_integration: {
            id: "quickbooks",
            access_token: this.access_token,
            refresh_token: this.refresh_token,
            realm_id: this.realm_id,
          },
        });
      }
    }
    return {
      access_token: this.access_token,
      refresh_token: this.refresh_token,
      realm_id: this.realm_id,
    };
  }

  async getInvoiceByInvoiceNumber(invoiceNumber) {
    const { data } = await quickbooksApi.get(
      `/v3/company/${this.realm_id}/query`,
      {
        params: {
          query: `SELECT Id, CustomerRef, Balance, CurrencyRef FROM Invoice WHERE DocNumber = '${invoiceNumber}'`,
        },
      }
    );
    if (data.QueryResponse && data.QueryResponse.Invoice) {
      const invoice = data.QueryResponse.Invoice[0];
      this.invoice = {
        invoice_number: invoiceNumber,
        id: invoice.Id,
        accountid: invoice.CustomerRef.value,
        outstanding: {
          amount: invoice.Balance,
          code: invoice.CurrencyRef.value,
        },
      };
    }
    return this.invoice;
  }

  async getXrpPaymentMethodRefId() {
    const { data: paymentMethods } = await quickbooksApi.get(
      `/v3/company/${this.realm_id}/query`,
      {
        params: {
          query: `SELECT Id, Name FROM PaymentMethod`,
        },
      }
    );
    if (
      paymentMethods.QueryResponse &&
      paymentMethods.QueryResponse.PaymentMethod
    ) {
      const xrpPaymentMethod = paymentMethods.QueryResponse.PaymentMethod.find(
        (paymentMethod) => paymentMethod.Name === "XRP"
      );
      if (xrpPaymentMethod) {
        return xrpPaymentMethod.Id;
      }
      const { data: paymentMethod } = await quickbooksApi.post(
        `/v3/company/${this.realm_id}/paymentmethod`,
        {
          Name: "XRP",
        }
      );
      if (paymentMethod && paymentMethod.PaymentMethod) {
        return paymentMethod.PaymentMethod.Id;
      }
    }
    return null;
  }

  async getXphoPaymentMethodRefId() {
    const { data: paymentMethods } = await quickbooksApi.get(
      `/v3/company/${this.realm_id}/query`,
      {
        params: {
          query: `SELECT Id, Name FROM PaymentMethod`,
        },
      }
    );
    if (
      paymentMethods.QueryResponse &&
      paymentMethods.QueryResponse.PaymentMethod
    ) {
      const xphoPaymentMethod = paymentMethods.QueryResponse.PaymentMethod.find(
        (paymentMethod) => paymentMethod.Name === "XPHO"
      );
      if (xphoPaymentMethod) {
        return xphoPaymentMethod.Id;
      }
      const { data: paymentMethod } = await quickbooksApi.post(
        `/v3/company/${this.realm_id}/paymentmethod`,
        {
          Name: "XPHO",
        }
      );
      if (paymentMethod && paymentMethod.PaymentMethod) {
        return paymentMethod.PaymentMethod.Id;
      }
    }
    return null;
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
    const paymentMethodRefId = currency && currency.toLowerCase() === 'xpho' ?
      await this.getXphoPaymentMethodRefId() :
      await this.getXrpPaymentMethodRefId();
    const { data } = await quickbooksApi
      .post(`/v3/company/${this.realm_id}/payment`, {
        TotalAmt: usdAmount, // e.g 1.00
        CustomerRef: {
          value: accountId, // e.g "9",
        },
        PaymentMethodRef: {
          value: paymentMethodRefId,
        },
        PrivateNote: (() => {
          if (currency && currency.toLowerCase() === 'xpho') {
            return `Paid (${xphoAmount}) XPHO via XRPhone - XRPL Transaction: ${xrpTransactionId}`;
          }
          return `Paid (${xrpAmount} XRP) via XRPhone - XRPL Transaction: ${xrpTransactionId}`
        })(),
        ProcessPayment: false,
        Line: [
          {
            Amount: usdAmount, // e.g 1.00
            LinkedTxn: [
              {
                TxnId: invoiceId, // e.g 13
                TxnType: "Invoice",
              },
            ],
          },
        ],
      })
    return data.Payment;
  }
}

module.exports = Quickbooks;
