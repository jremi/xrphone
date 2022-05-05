const { checkSmsVerificationCode } = require("../../../helpers/twilio/verify");

module.exports = async (req, res) => {
  try {
    const verificationCheck = await checkSmsVerificationCode(
      req.body.phoneNumber,
      req.body.code
    );
    res.json(verificationCheck.status);
  } catch (e) {
    res.sendStatus(404);
  }
};
