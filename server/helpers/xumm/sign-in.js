const { XummSdk } = require("xumm-sdk");

const Sdk = new XummSdk();

module.exports = async function (req, res) {
  try {
    const transaction = {
      txjson: {
        TransactionType: "SignIn",
      },
    };
    const signIn = await Sdk.payload.create(transaction);
    // console.log("\n**********************************************");
    // console.log("USE ON FRONTEND QR CODE TO SIGN-IN");
    // console.log(signIn);
    // console.log("**********************************************");
    res.json(signIn);
    // await Sdk.payload.subscribe(signIn, async ({ data }) => {
    //   const dataPayload = await Sdk.payload.get(data.payload_uuidv4);
    //   // TODO: 'Do something with this sign-in on the front-end
    //   // TODO: Check db if this user is already registered with XRPhone
    //   const user = global.$db.users.find(
    //     (user) =>
    //       user.xumm &&
    //       user.xumm.userToken &&
    //       user.xumm.userToken.user_token ===
    //         dataPayload.application.issued_user_token
    //   );
    //   console.log({
    //     xrpAccount: dataPayload.response.account,
    //     xummUserToken: dataPayload.application.issued_user_token,
    //   });
    //   if (user) {
    //     console.log('user found:', user.phoneNumber);
    //   } else {
    //     console.log('user not found!');
    //   }
    //   return true;
    // });
  } catch (err) {
    console.log("err", err);
    res.json({ error: true, errorMessage: err.message });
  }
};
