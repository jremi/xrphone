const axios = require("axios");
const { default: createAuthRefreshInterceptor } = require("axios-auth-refresh");
const { updateMerchantXrphoneAccount } = require("../../db/supabase");
const moment = require("moment");

const freshbooksBaseURL = "https://api.freshbooks.com";

const freshbooksApi = axios.create({
  baseURL: freshbooksBaseURL,
});

class Freshbooks {
  constructor(options = {}) {
    this.phone_number = options.phone_number || null;
    this.access_token = options.access_token || null;
    this.refresh_token = options.refresh_token || null;
    freshbooksApi.interceptors.request.use((request) => {
      request.headers["Authorization"] = `Bearer ${this.access_token}`;
      return request;
    });
    createAuthRefreshInterceptor(freshbooksApi, this.authRefresh.bind(this));
  }

  async authRefresh(failedRequest) {
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
      client_id: process.env.FRESHBOOKS_CLIENT_ID,
      client_secret: process.env.FRESHBOOKS_CLIENT_SECRET,
      redirect_uri: `${process.env.SERVER_URL}/plugins/freshbooks/oauth`,
    };
    if (grantType === "authorization_code") {
      payload.code = authCode;
    } else if (grantType === "refresh_token") {
      payload.refresh_token = refreshToken;
    }
    const { data } = await axios
      .post(`${freshbooksBaseURL}/auth/oauth/token`, payload)
      .catch((err) =>
        console.log("Problem fetching freshbooks oAuth token!", err.message)
      );
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    if (grantType === "refresh_token") {
      if (this.phone_number) {
        await updateMerchantXrphoneAccount(this.phone_number, {
          app_integration: {
            id: "freshbooks",
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

  async getAccountId() {
    const { data } = await freshbooksApi.get("/auth/api/v1/users/me");
    this.accountId = data.response.roles[0].accountid; // eOjER4
    return this.accountId;
  }

  async getCustomerIdByPhoneNumber(phoneNumber) {
    // (NOTE): freshbooks not returning phone numbers with “-”.
    // Users should enter the number without hyphens or we need
    // to do extra requests to check if the number is truly not found.
    const { data } = await freshbooksApi.get(
      `/accounting/account/${this.accountId}/users/clients`,
      { params: { "search[phone_like]": phoneNumber.replace(/[^\d.-]/g, "") } }
    );
    this.customerId = data.response.result.clients[0].id; // 105747 (customer_id)
    return this.customerId;
  }

  async getInvoiceByInvoiceNumber(invoiceNumber) {
    const { data } = await freshbooksApi.get(
      `/accounting/account/${this.accountId}/invoices/invoices`,
      { params: { "search[customerid]": this.customerId } }
    );
    if (data.response.result && data.response.result.invoices.length) {
      const invoice = data.response.result.invoices.find(
        (invoice) => invoice.invoice_number == invoiceNumber
      );
      this.invoice = invoice;
      return this.invoice;
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
    const { data } = await freshbooksApi.post(
      `/accounting/account/${accountId}/payments/payments`,
      {
        payment: {
          invoiceid: invoiceId, // 55438,
          amount: {
            amount: usdAmount, // "32.00",
          },
          date: moment().format("YYYY-MM-DD"), // "2021-09-19",
          type: "Cash",
          note: (() => {
            if (currency && currency.toLowerCase() === 'xpho') {
              return `Paid (${xphoAmount}) XPHO via XRPhone`;
            }
            return `Paid (${xrpAmount} XRP) via XRPhone`; // (XRPL Transaction #${xrpTransactionId})`,
          })()
        },
      }
    );
    return data.response.result.payment;
  }
}

module.exports = Freshbooks;
