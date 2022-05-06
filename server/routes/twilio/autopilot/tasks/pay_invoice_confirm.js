const xrplOracle = require("../../../../helpers/ripple/xrpl-oracle");
const sendXummPaymentToCaller = require("../../../../helpers/xumm/send-payment");

module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { xumm_user_token: xummUserToken, phone_number: customerPhoneNumber } =
    memory.regularAccountHolder;
  const {
    xrp_account: merchantXrpAccount,
    destination_tag: merchantDestinationTag,
    phone_number: merchantPhoneNumber,
    app_integration: merchantAppIntegration,
  } = memory.merchantAccountHolder;
  const invoice = memory.invoice;
  const { CallSid } = memory.twilio.voice;
  const { usdAmountToPay } = global.transactionCache.get(CallSid);
  const currentXrpUsdSpotPrice = await xrplOracle();
  const xrpAmount = (
    parseFloat(usdAmountToPay) / currentXrpUsdSpotPrice
  ).toFixed(2);

  await sendXummPaymentToCaller(xummUserToken, merchantXrpAccount, merchantDestinationTag, xrpAmount, {
    type: "INVOICE_PAYMENT",
    xrpAmount,
    usdAmount: usdAmountToPay,
    customerPhoneNumber,
    merchantPhoneNumber,
    accountId: invoice.accountid,
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    merchantAppIntegration: merchantAppIntegration.id,
  });

  res.json({
    actions: [
      {
        say: `I just sent you a wallet payment request for the invoice 
        in the amount of ${xrpAmount} XRP. Please note: the current market rate is 
        ${currentXrpUsdSpotPrice.toFixed(
          2
        )} XRP per US dollar. If you wait to accept the wallet request 
        the XRP value may adjust due to current market rate`,
      },
      {
        redirect: "task://goodbye",
      },
    ],
  });
};
