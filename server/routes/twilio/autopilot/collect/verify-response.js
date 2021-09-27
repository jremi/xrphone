"use strict";

const { lookupMerchantXrphoneAccount } = require("../../../../db/supabase");
const Freshbooks = require("../../../../helpers/freshbooks/freshbooks-wrapper");

module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { CallSid } = memory.twilio.voice;

  const { CollectName, ValidateFieldName, ValidateFieldAnswer } = req.body;

  let isValid = false;

  console.log('ValidateFieldAnswer', ValidateFieldAnswer);

  if (CollectName === "collect_invoice_details") {
    if (ValidateFieldName === "xrphone_merchant_phone_number") {
      // Add "+" for country code identifier 
      // For example: 12223334444 becomes +12223334444
      const merchantPhoneNumber = `+${ValidateFieldAnswer}`;
      const { data: merchantAccountHolder } =
        await lookupMerchantXrphoneAccount(merchantPhoneNumber);
      if (merchantAccountHolder) {
        global.transactionCache.set(CallSid, {
          merchantAccountHolder,
        });
        isValid = true;
      }
    }

    if (ValidateFieldName === "xrphone_merchant_invoice_number") {
      const { phone_number: customerPhoneNumber } = memory.regularAccountHolder;
      const merchantInvoiceNumber = ValidateFieldAnswer;
      const { merchantAccountHolder } = global.transactionCache.get(CallSid);
      const merchantAccountAppIntegration = merchantAccountHolder.app_integration;

      if (merchantAccountAppIntegration.id === "freshbooks") {
        const freshbooks = new Freshbooks({
          phone_number: merchantAccountHolder.phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
        });
        try {
          await freshbooks.getAccountId();
          await freshbooks.getCustomerIdByPhoneNumber(customerPhoneNumber);
          await freshbooks.getInvoiceByInvoiceNumber(merchantInvoiceNumber);
          if (freshbooks.invoice) {
            if (freshbooks.invoice.payment_status !== "paid") {
              global.transactionCache.set(CallSid, {
                merchantAccountHolder,
                invoice: freshbooks.invoice,
              });
              return true;
            }
          }
        } catch (err) {
          console.log("Error with invoice lookup:", err);
        }
      }
    }
  }

  if (CollectName === "collect_invoice_amount") {
    const invoice = memory.invoice;
    if (ValidateFieldName === "amount") {
      const usdAmountToPay = parseFloat(
        ValidateFieldAnswer.replace(/\*/g, ".")
      );
      global.transactionCache.set(CallSid, { usdAmountToPay });
      const invoiceOutstandingAmount = parseFloat(invoice.outstanding.amount);
      if (usdAmountToPay <= invoiceOutstandingAmount) {
        return true;
      }
    }
  }
  // if (CollectName === "collect_menu_option") {
  //   if (ValidateFieldName === "menu_option") {
  //     const validMenuOptions = [1, 2];
  //     const selectedMenuOption = parseInt(ValidateFieldAnswer);
  //     isValid = validMenuOptions.includes(selectedMenuOption);
  //     console.log("\n#######################################");
  //     console.log("Menu option selected", selectedMenuOption);
  //     console.log("Menu option valid", isValid);
  //     console.log("#######################################");
  //   }
  // }

  res.json({
    valid: isValid,
  });
};
