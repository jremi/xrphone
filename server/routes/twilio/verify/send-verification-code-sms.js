const { sendSmsVerificationCode } = require("../../../helpers/twilio/verify");

module.exports = async (req, res) => {
  const sendVerificationCheck = await sendSmsVerificationCode(
    req.body.phoneNumber
  );
  res.json(sendVerificationCheck.status);
};
