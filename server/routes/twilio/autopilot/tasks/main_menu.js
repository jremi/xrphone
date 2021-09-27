module.exports = (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);

  res.json({
    actions: [
      {
        collect: {
          name: "collect_menu_option",
          questions: [
            {
              question: `MAIN MENU: To check your current XRP account balance say or press 1. 
              To send XRP say or press 2.`,
              name: "menu_option",
              type: "Twilio.NUMBER",
              voice_digits: {
                num_digits: 1,
              },
              validate: {
                webhook: {
                  url: `${process.env.CLIENT_APP_URL}/twilio/autopilot/tasks/action/collect/question/webhook`,
                  method: "POST",
                },
                on_failure: {
                  messages: [
                    {
                      say: "The option you selected was not valid.",
                    },
                    {
                      say: "Lets try again. Please make a valid selection to continue.",
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
            redirect: "task://menu_option",
          },
        },
      },
    ],
  });
};
