module.exports = (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { CallSid } = memory.twilio.voice;

  const { merchantAccountHolder, invoice } = global.transactionCache.get(CallSid);

  res.json({
    actions: [
      {
        remember: {
          merchantAccountHolder,
          invoice,
        },
      },
      {
        say: `The current outstanding balance for this invoice is 
        ${invoice.outstanding.amount} ${invoice.outstanding.code}.`,
      },
      {
        collect: {
          name: "collect_invoice_amount",
          questions: [
            {
              question: `Please enter the amount you will be paying followed by the pound sign. For decimal point please use the star sign`,
              name: "amount",
              type: "Twilio.NUMBER",
              voice_digits: {
                finish_on_key: "#",
              },
              validate: {
                webhook: {
                  url: `${process.env.CLIENT_APP_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
                  method: "POST",
                },
                on_failure: {
                  messages: [
                    {
                      say: "The amount you entered was not valid.",
                    },
                    {
                      say: "Lets try again. Please enter the amount.",
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
            redirect: "task://pay_invoice_confirm",
          },
        },
      },
    ],
  });
};
