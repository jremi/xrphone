const { sendSmsVerificationCode } = require("../../../helpers/twilio/verify");

module.exports = async (req, res) => {
  const sendVerificationCheck = await sendSmsVerificationCode(
    req.body.phoneNumber
  ).catch((err) => res.sendStatus(500));
  res.json(sendVerificationCheck.status);
};
