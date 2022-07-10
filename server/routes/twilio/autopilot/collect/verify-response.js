"use strict";

const { lookupMerchantXrphoneAccount, lookupDeveloperAppById } = require("../../../../db/supabase");

const Freshbooks = require("../../../../helpers/freshbooks/freshbooks-wrapper");
const Quickbooks = require("../../../../helpers/quickbooks/quickbooks-wrapper");
const Xero = require("../../../../helpers/xero/xero-wrapper");
const CustomApp = require("../../../../helpers/xrphone/custom-app-wrapper");

module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { CallSid } = memory.twilio.voice;

  const { CollectName, ValidateFieldName, ValidateFieldAnswer } = req.body;

  let isValid = false;

  console.log('ValidateFieldAnswer', ValidateFieldAnswer);
  console.log('CollectName', CollectName);
  console.log('ValidateFieldName', ValidateFieldName);

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

    if (ValidateFieldName === "xrphone_token_currency") {
      const tokenCurrencyOption = ValidateFieldAnswer;
      const { merchantAccountHolder } = global.transactionCache.get(CallSid);
      if (tokenCurrencyOption == "1" || tokenCurrencyOption == "2") {
        const tokenCurrency = tokenCurrencyOption == '1' ? 'XRP' : 'XPHO';
        global.transactionCache.set(CallSid, {
          merchantAccountHolder,
          tokenCurrency
        });
        isValid = true;
      }
    }

    if (ValidateFieldName === "xrphone_merchant_invoice_number") {
      const { phone_number: customerPhoneNumber } = memory.regularAccountHolder;
      const merchantInvoiceNumber = ValidateFieldAnswer;
      const { merchantAccountHolder, tokenCurrency } = global.transactionCache.get(CallSid);
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
                tokenCurrency,
                invoice: freshbooks.invoice,
              });
              return true;
            }
          }
        } catch (err) {
          console.log("Error with invoice lookup:", err);
        }
      } else if (merchantAccountAppIntegration.id === 'quickbooks') {
        const quickbooks = new Quickbooks({
          phone_number: merchantAccountHolder.phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
          realm_id: merchantAccountAppIntegration.realm_id
        });
        try {
          await quickbooks.getInvoiceByInvoiceNumber(merchantInvoiceNumber);
          if (quickbooks.invoice) {
            global.transactionCache.set(CallSid, {
              merchantAccountHolder,
              tokenCurrency,
              invoice: quickbooks.invoice,
            });
            return true;
          }
        } catch (err) {
          console.log("Error with invoice lookup:", err);
        }
      } else if (merchantAccountAppIntegration.id === 'xero') {
        const xero = new Xero({
          phone_number: merchantAccountHolder.phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
          tenant_id: merchantAccountAppIntegration.tenant_id
        });
        try {
          await xero.getInvoiceByInvoiceNumber(merchantInvoiceNumber);
          console.log('xero.invoice', xero.invoice);
          if (xero.invoice) {
            global.transactionCache.set(CallSid, {
              merchantAccountHolder,
              tokenCurrency,
              invoice: xero.invoice,
            });
            return true;
          }
        } catch (err) {
          console.log("Error with invoice lookup:", err);
        }
      } 
      // Custom app integration via XRPhone developer portal
      else if (typeof merchantAccountAppIntegration.id === "number") {
        const { data: app } = await lookupDeveloperAppById(merchantAccountAppIntegration.id);
        const customApp = new CustomApp(app, {
          phone_number: merchantAccountHolder.phone_number,
          access_token: merchantAccountAppIntegration.access_token,
          refresh_token: merchantAccountAppIntegration.refresh_token,
        });
        try {
          await customApp.getInvoiceByInvoiceNumber(merchantInvoiceNumber);
          console.log('customApp.invoice', customApp.invoice);
          if (customApp.invoice) {
            global.transactionCache.set(CallSid, {
              merchantAccountHolder,
              tokenCurrency,
              invoice: customApp.invoice,
            });
            return true;
          }
        } catch (err) {
          console.log("Error with invoice lookup:", err);
        }
      }
    }
  }

  if (CollectName === "collect_invoice_amount") {
    const { tokenCurrency } = global.transactionCache.get(CallSid);
    const invoice = memory.invoice;
    if (ValidateFieldName === "amount") {
      const usdAmountToPay = parseFloat(
        ValidateFieldAnswer.replace(/\*/g, ".")
      );
      global.transactionCache.set(CallSid, { usdAmountToPay, tokenCurrency });
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
