module.exports = {
  signIn: require("./sign-in"),
  signInVerify: require("./sign-in-verify"),
  sendPayment: require("./send-payment"),
  userTokenVerify: require("./user-token-verify")
};

// (async () => {
//   try {
//     const result = await xummSendPayment(
//       {
//         user_token: "fba4229c-2497-404e-966c-e566dbe55795", // $db.users (xumm.userToken.user_token)
//         XRPhoneNumber: "client:Anonymous", // $db.users (phoneNumber)
//       },
//       "rUCzEr6jrEyMpjhs4wSdQdz4g8Y382NxfM",
//       "10000"
//     );
//     console.log("xummSendPayment:response", result);
//   } catch (error) {
//     console.log("xummSendPayment:error", error);
//   }
// })();

// (async () => {
//   try {
//     const result = await xummSignIn();
//     console.log("xummSignIn:result", result);
//   } catch (error) {
//     console.log("xummSignIn:error", error);
//   }
// })();
