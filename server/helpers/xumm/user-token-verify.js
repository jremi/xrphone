const { XummSdk } = require("xumm-sdk");

const Sdk = new XummSdk();

const encodeJwt = require("../auth/jwt/encode-jwt");

module.exports = async function (req, res) {
  try {
    const account = req.body.regular || req.body.merchant;
    if (!account)
      throw new Error(
        "Missing XRPhone user account data in the body of payload!"
      );
    const userTokenValidity = await Sdk.verifyUserToken(
      account.xumm_user_token
    );
    if (userTokenValidity) {
      // Create JWT for XRPhone usage
      // For now this is being used specifically for the xApp by
      // XRPhone regular account users.
      const accountDetails = {
        id: account.id,
        accountType: 'regular',
        phoneNumber: account.phone_number,
        xrpAccount: account.xrp_account,
        xrplNetwork: account.xrpl_network,
      };
      encodeJwt(accountDetails, null, (err, jwt) => {
        if (err) return res.sendStatus(500);
        return res.json({ ...userTokenValidity, jwt });
      });
    }
  } catch (err) {
    return res.json({ error: true, errorMessage: err.message });
  }
};
