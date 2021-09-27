const { XummSdk } = require("xumm-sdk");

const Sdk = new XummSdk();

module.exports = async function (req, res) {
  try {
    const transaction = {
      txjson: {
        TransactionType: "SignIn",
      },
    };
    if (req.query.customerPhoneNumber) {
      transaction.custom_meta = {
        blob: JSON.stringify(req.query)
      }
    }
    const signIn = await Sdk.payload.create(transaction);
    res.json(signIn);
  } catch (err) {
    res.json({ error: true, errorMessage: err.message });
  }
};
