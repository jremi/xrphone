const { XummSdk } = require("xumm-sdk");
const { lookupMerchantXrphoneAccount } = require("../../db/supabase");
const Freshbooks = require("../../helpers/freshbooks/freshbooks-wrapper");

const Sdk = new XummSdk();

module.exports = async (req, res) => {
  const { custom_meta, payloadResponse } = req.body;
  const metadata = JSON.parse(custom_meta.blob);

  console.log(metadata);

  switch (metadata.type) {
    case "INVOICE_PAYMENT":
      finalizeInvoicePayment();
      break;
  }

  async function finalizeInvoicePayment() {
    const { response } = await Sdk.payload.get(payloadResponse.payload_uuidv4);
    const dispatchedResult = response.dispatched_result;
    const xrpTransactionId = response.txid;

    if (dispatchedResult === "tesSUCCESS") {
      console.log(
        `XUMM wallet linked to XRPhone # ${metadata.customerPhoneNumber} SUCCESSFULLY made XRP payment! (${dispatchedResult})`
      );
      if (metadata.merchantAppIntegration === "freshbooks") {
        const {
          data: { phone_number, app_integration: merchantAccountAppIntegration },
        } = await lookupMerchantXrphoneAccount(metadata.merchantPhoneNumber);
        const freshbooks = new Freshbooks({
          phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
        });
        await freshbooks.applyPaymentToInvoice(
          metadata.accountId,
          metadata.invoiceId,
          metadata.usdAmount,
          metadata.xrpAmount,
          xrpTransactionId
        );
      }
    } else {
      console.log(
        `XUMM wallet linked to XRPhone # ${metadata.customerPhoneNumber} DECLINED payment!`
      );
    }
  }

  res.sendStatus(200);
};
