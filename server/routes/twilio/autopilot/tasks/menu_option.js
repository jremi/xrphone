module.exports = async (req, res) => {
  const memory = JSON.parse(req.body["Memory"]);
  const { collect_menu_option } = memory.twilio.collected_data;
  const selectedMenuOption = collect_menu_option.answers.menu_option.answer;
  const { rippleHelper } = require("../../../../helpers");
  const { accountInfo, sendXrp } = rippleHelper;

  let say;

  if (selectedMenuOption == 1) {
    try {
      const xrpBalance = await accountInfo(memory.accountHolder.xrpAddress);
      console.log("accountBalance:result", xrpBalance);
      say = `Your accounts current XRP balance is: ${xrpBalance}`;
    } catch (err) {
      say = "I had a problem pulling up the account info.";
      console.log("accountBalance:err", err);
    }
  } else if (selectedMenuOption == 2) {
    say = "This feature is not currently available. Please check back later";
    // TODO: Collect two questions from caller:
    // 1. How many XRP would you like to send?
    // 2. Please enter the XRPhone telephone number you would like to send this XRP.
    /*
      try {
        const result = await sendXrp({
          fromAddress: "rwGte5VhVQRDMUT82zPnVwcq2mGGnk9xLj",
          toAddress: "rUCzEr6jrEyMpjhs4wSdQdz4g8Y382NxfM",
          xrpAmount: 0.02,
        });
        console.log("sendXrp:result", result);
      } catch (err) {
        console.log("sendXrp:err", err);
      }
    */
  }

  res.json({
    actions: [
      {
        say,
      },
      {
        redirect: "task://main_menu",
      },
    ],
  });
};
