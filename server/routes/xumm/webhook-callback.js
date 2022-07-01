const { XummSdk } = require("xumm-sdk");
const {
  updateRegularXrphoneAccount,
  lookupMerchantXrphoneAccount,
} = require("../../db/supabase");
const Freshbooks = require("../../helpers/freshbooks/freshbooks-wrapper");
const Quickbooks = require("../../helpers/quickbooks/quickbooks-wrapper");

const Sdk = new XummSdk();

module.exports = async (req, res) => {
  const { custom_meta, payloadResponse, userToken } = req.body;
  const customMeta = JSON.parse(custom_meta.blob);

  if (customMeta && customMeta.type) {
    switch (customMeta.type) {
      /*
        NOTE: The XUMM_SIGN_IN_AGAIN is only hit via the XUMM webhook
        when a regular (non merchant) XRPhone account is attempting to 
        "re-connect" "re-sign-in" via the client app dasboard page.

        When the regular XRPhone (non merchant) XRPhone account is 
        initially being setup/created during onboarding registration
        the client is using the XUMM provided websocket status flow.
      */
      case "XUMM_SIGN_IN_AGAIN":
        await updateRegularXrphoneAccount(
          customMeta.customerPhoneNumber,
          {
            xumm_user_token: userToken.user_token,
          }
        );
        break;
      case "INVOICE_PAYMENT":
        finalizeInvoicePayment();
        break;
    }
  }

  async function finalizeInvoicePayment() {
    const { response } = await Sdk.payload.get(payloadResponse.payload_uuidv4);
    const dispatchedResult = response.dispatched_result;
    const xrpTransactionId = response.txid;

    if (dispatchedResult === "tesSUCCESS") {
      console.log(
        `XUMM wallet linked to XRPhone # ${customMeta.customerPhoneNumber} SUCCESSFULLY made payment! (${dispatchedResult})`
      );
      if (customMeta.merchantAppIntegration === "freshbooks") {
        const {
          data: {
            phone_number,
            app_integration: merchantAccountAppIntegration,
          },
        } = await lookupMerchantXrphoneAccount(customMeta.merchantPhoneNumber);
        const freshbooks = new Freshbooks({
          phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
        });
        await freshbooks.applyPaymentToInvoice(
          customMeta.accountId,
          customMeta.invoiceId,
          customMeta.usdAmount,
          customMeta.currency,
          customMeta.xrpAmount,
          customMeta.xphoAmount,
          xrpTransactionId
        );
      }
      else if (customMeta.merchantAppIntegration === 'quickbooks') {
        const {
          data: {
            phone_number,
            app_integration: merchantAccountAppIntegration,
          },
        } = await lookupMerchantXrphoneAccount(customMeta.merchantPhoneNumber);
        const quickbooks = new Quickbooks({
          phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
          realm_id: merchantAccountAppIntegration.realm_id,
        });
        await quickbooks.applyPaymentToInvoice(
          customMeta.accountId,
          customMeta.invoiceId,
          customMeta.usdAmount,
          customMeta.currency,
          customMeta.xrpAmount,
          customMeta.xphoAmount,
          xrpTransactionId
        );
      }
    } else {
      console.log(
        `XUMM wallet linked to XRPhone # ${customMeta.customerPhoneNumber} DECLINED payment!`
      );
    }
  }

  res.sendStatus(200);
};
