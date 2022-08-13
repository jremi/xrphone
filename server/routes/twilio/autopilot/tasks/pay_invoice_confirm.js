const xphoOracle = require("../../../../helpers/ripple/xpho-oracle");
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
  let { usdAmountToPay, tokenCurrency } = global.transactionCache.get(CallSid);
  if (!tokenCurrency) {
    tokenCurrency = 'XRP';
  }
  const currentXrpUsdSpotPrice = await xrplOracle();
  const currentXphoXrpSpotPrice = await xphoOracle();
  const xrpAmount = (
    parseFloat(usdAmountToPay) / currentXrpUsdSpotPrice
  ).toFixed(2);
  const xphoAmount = (
    parseFloat(usdAmountToPay) / (currentXrpUsdSpotPrice * currentXphoXrpSpotPrice)
  ).toFixed(2);

  const metadata = {
    type: "INVOICE_PAYMENT",
    customerPhoneNumber,
    merchantPhoneNumber,
    merchantAppIntegration: merchantAppIntegration.id,
    invoiceNumber: invoice.invoice_number,
    accountId: invoice.accountid,
    invoiceId: invoice.id,
    usdAmount: usdAmountToPay,
    currency: tokenCurrency,
    xrpAmount,
    xphoAmount,
  };
  console.log(metadata);
  await sendXummPaymentToCaller(xummUserToken, merchantXrpAccount, merchantDestinationTag, xrpAmount, metadata);

  let responseMessage;

  if (tokenCurrency === 'XRP') {
    responseMessage = `I just sent you a wallet payment request for the invoice 
      in the amount of ${xrpAmount} XRP. Please note: the current market rate is 
      ${currentXrpUsdSpotPrice.toFixed(
      2
    )} XRP per US dollar. If you wait to accept the wallet request 
      the XRP value may adjust due to current market rate`
  };

  if (tokenCurrency === 'XPHO') {
    responseMessage = `I just sent you a wallet payment request for the invoice 
      in the amount of ${xphoAmount} XPHO. Please note: the current market rate is 
      ${currentXphoXrpSpotPrice.toFixed(
      2
    )} XHPO per XRP. If you wait to accept the wallet request 
      the XPHO value may adjust due to current market rate`
  };

  res.json({
    actions: [
      {
        say: responseMessage,
      },
      {
        redirect: "task://goodbye",
      }
    ],
  });
}
