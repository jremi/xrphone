const { XummSdk } = require("xumm-sdk");

const Sdk = new XummSdk();

module.exports = async function (req, res) {
  try {
    const dataPayload = await Sdk.payload.get(req.body.payload_uuidv4);
    res.json({
      xrpAccount: dataPayload.response.account,
      xummUserToken: dataPayload.application.issued_user_token,
    });
  } catch (err) {
    res.json({ error: true, errorMessage: err.message });
  }
};
