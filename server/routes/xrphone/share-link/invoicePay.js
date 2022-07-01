const xrplOracle = require("../../../helpers/ripple/xrpl-oracle");
const createSendPaymentPayload = require("../../../helpers/xumm/send-payment");

async function invoicePay(req, res) {
    const integration = req.body.integration;
    const phone_number = req.body.merchant.phone_number;
    const xrp_account = req.body.merchant.xrp_account;
    const destination_tag = req.body.merchant.destination_tag;
    const usdAmountToPay = req.body.usdAmountToPay;
    const currentXrpUsdSpotPrice = await xrplOracle();
    const xrpAmount = (
        parseFloat(usdAmountToPay) / currentXrpUsdSpotPrice
    ).toFixed(2);
    const metadata = {
        type: "INVOICE_PAYMENT",
        customerPhoneNumber: "none",
        merchantPhoneNumber: phone_number,
        merchantAppIntegration: integration,
        invoiceNumber: req.body.invoice.invoice_number,
        accountId: req.body.invoice.accountid,
        invoiceId: req.body.invoice.id,
        usdAmount: usdAmountToPay,
        xrpAmount,
    };
    const result = await createSendPaymentPayload(
        null,
        xrp_account,
        destination_tag,
        xrpAmount,
        metadata
    );
    res.json(result);
}

module.exports = invoicePay;
