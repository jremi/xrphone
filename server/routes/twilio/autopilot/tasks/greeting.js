const { lookupRegularXrphoneAccount } = require("../../../../db/supabase");

module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { From } = memory.twilio.voice;

  const { data: regularAccountHolder } = await lookupRegularXrphoneAccount(From);

  // console.log("\n#######################################");
  // console.log("📱 XRPhone Regular Account: ", regularAccountHolder);
  // console.log("#######################################");

  if (!regularAccountHolder) {
    res.json({
      actions: [
        {
          say: `Hello! Welcome to XRP Phone!
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
        say: `Hello! Welcome to XRP Phone! 
        The fast and easy way to pay invoices 
        using Ripple XRP!`,
      },
      {
        collect: {
          name: "collect_invoice_details",
          questions: [
            {
              question:
                "Please say or enter the merchants XRP Phone number including the country and area code followed by the pound sign.",
              name: "xrphone_merchant_phone_number",
              type: "Twilio.NUMBER_SEQUENCE",
              voice_digits: {
                finish_on_key: '#',
              },
              barge: false,
              validate: {
                webhook: {
                  url: `${process.env.CLIENT_APP_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
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
                  url: `${process.env.CLIENT_APP_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
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
