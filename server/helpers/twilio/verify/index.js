const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

function sendSmsVerificationCode(phoneNumber) {
  return client.verify
    .services(verifySid)
    .verifications.create({ to: phoneNumber, channel: "sms" });
}

function checkSmsVerificationCode(phoneNumber, code) {
  return client.verify.services(verifySid).verificationChecks.create({
    to: phoneNumber,
    code,
  });
}

module.exports = {
  sendSmsVerificationCode,
  checkSmsVerificationCode,
};
