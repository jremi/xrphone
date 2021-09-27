const { XrpPayIdClient } = require("xpring-js");

module.exports = async (req, res) => {
  const { paystring: payId, xrplNetwork } = req.body;

  const xrpPayIdClient = new XrpPayIdClient(xrplNetwork.toLowerCase());

  try {
    const xrpAddress = await xrpPayIdClient.xrpAddressForPayId(payId);
    res.json({
      xrpAddress,
    });
  } catch (err) {
    res.json({
      xrpAddress: null,
    });
  }
};
