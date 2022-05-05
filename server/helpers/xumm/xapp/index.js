const { XummSdk } = require("xumm-sdk");

const Sdk = new XummSdk();

const crypto = require("crypto");

module.exports = {
  xAppOtt: async function (req, res) {
    /**
     *
     * For debugging: refetch same OTT data from XUMM
     * ==================================================
     * https://xumm.readme.io/reference/re-fetch-ott-data
     * ==================================================
     *
     * xAppToken: process.env.XUMM_XAPP_REFETCH_OTT_XAPPTOKEN
     * xummDeviceId: process.env.XUMM_XAPP_REFETCH_OTT_DEVICEID
     * xummAppSecret: process.env.XUMM_APISECRET
     *
     */
    //******************************************************* */
    const xAppToken = process.env.XUMM_XAPP_REFETCH_OTT_XAPPTOKEN;
    const xummAppSecret = process.env.XUMM_APISECRET;
    const xummDeviceId = process.env.XUMM_XAPP_REFETCH_OTT_DEVICEID;
    const data = `${xAppToken}.${xummAppSecret}.${xummDeviceId}`;
    const hash = crypto
      .createHash("sha1")
      .update(data.toUpperCase())
      .digest("hex");
    try {
      const tokenData =
        process.env.NODE_ENV === "development"
          ? `${xAppToken}/${hash}`
          : req.body.xAppToken;
      res.json(await Sdk.xApp.get(tokenData));
    } catch (err) {
      res.json({ error: true, errorMessage: err.message });
    }
  },
  // NOTE: xApp API endpoint only available for XRPL Labs / XUMM partners.
  xAppPush: async function (req, res) {
    try {
      if (!req.body.xummUserToken)
        throw new Error("xummUserToken missing from payload body!");
      res.json(
        await Sdk.xApp.push({
          user_token: req.body.xummUserToken,
          subtitle: "XRPhone Subtitle Here",
          body: "This is the push notification from XRPhone xApp",
          data: { foo: "bar", mah: "raz" },
        })
      );
    } catch (err) {
      res.json({ error: true, errorMessage: err.message });
    }
  },
  // NOTE: xApp API endpoint only available for XRPL Labs / XUMM partners.
  xAppEvent: async function (req, res) {
    try {
      if (!req.body.xummUserToken)
        throw new Error("xummUserToken missing from payload body!");
      res.json(
        await Sdk.xApp.push({
          user_token: req.body.xummUserToken,
          subtitle: "XRPhone Subtitle Event Here",
          body: "This is the event notification from XRPhone xApp",
          data: { foo: "bar", mah: "raz" },
        })
      );
    } catch (err) {
      res.json({ error: true, errorMessage: err.message });
    }
  },
};
