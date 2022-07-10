const { lookupRegularXrphoneAccount } = require("../../../../db/supabase");

module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  // Should be const after demo TODO: change from let to const
  let { From } = memory.twilio.voice;
  console.log('From', From);

  // Temporary hack for demo TODO: REMOVE WHEN DONE
  // if (From === '+16196770504') From = '+16197381017';
  const { data: regularAccountHolder } = await lookupRegularXrphoneAccount(From);
  console.log('regularAccountHolder', regularAccountHolder);

  // console.log("\n#######################################");
  // console.log("📱 XRPhone Regular Account: ", regularAccountHolder);
  // console.log("#######################################");

  if (!regularAccountHolder) {
    res.json({
      actions: [
        {
          say: `Hello! Welcome to XR Phone!
          We do not recognize this phone number your 
          calling from. To use XRP Phone you must 
          activate this phone number. Please visit 
          XRP Phone website w-w-w dot x-r-p-h-o-n-e dot app 
          to get started. Goodbye!`,
        },
      ],
    });
    return;
  }

  res.json({
    actions: [
      {
        remember: {
          regularAccountHolder,
        },
      },
      {
        say: `Hello! Welcome to XR Phone! 
        The fast and easy way to pay invoices!`,
      },
      {
        collect: {
          name: "collect_invoice_details",
          questions: [
            {
              question:
                "Please say or enter the merchants XR Phone number including the country and area code followed by the pound sign.",
              name: "xrphone_merchant_phone_number",
              type: "Twilio.NUMBER_SEQUENCE",
              voice_digits: {
                finish_on_key: '#',
              },
              barge: false,
              validate: {
                webhook: {
                  url: `${process.env.SERVER_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
                  method: "POST",
                },
                on_failure: {
                  messages: [
                    {
                      say: "The merchant number is required for lookup of your invoice.",
                    },
                    {
                      say: "Lets try again.",
                    },
                  ],
                  repeat_question: true,
                },
                on_success: {
                  say: "Ok, got it!",
                },
              },
            },
            {
              question: "To pay with XRP press 1 followed by the pound sign. To pay with XPHO press 2 followed by the pound sign.",
              name: "xrphone_token_currency",
              type: "Twilio.NUMBER",
              voice_digits: {
                finish_on_key: '#'
              },
              barge: false,
              validate: {
                webhook: {
                  url: `${process.env.SERVER_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
                  method: "POST",
                },
                on_failure: {
                  messages: [
                    {
                      say: "The token currency is required for make payment on your invoice.",
                    },
                    {
                      say: "Lets try again.",
                    },
                  ],
                  repeat_question: true,
                },
                on_success: {
                  say: "Great!",
                },
              }
            },
            {
              question:
                "Please say or enter the invoice number followed by pound key.",
              name: "xrphone_merchant_invoice_number",
              type: "Twilio.ALPHANUMERIC",
              voice_digits: {
                finish_on_key: '#',
              },
              barge: false,
              validate: {
                webhook: {
                  url: `${process.env.SERVER_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
                  method: "POST",
                },
                on_failure: {
                  messages: [
                    {
                      say: "The invoice number is required to make payment.",
                    },
                    {
                      say: "Lets try again.",
                    },
                  ],
                  repeat_question: true,
                },
                on_success: {
                  say: "Excellent!",
                },
              },
            },
          ],
          on_complete: {
            redirect: "task://pay_invoice"
          },
        },
      },
    ],
  });
};
