const jwt = require("jsonwebtoken");

function encodeJwt(payload, secret, cb) {
  if (!secret) secret = process.env.JWT_SECRET;
  jwt.sign(
    payload,
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN },
    (err, token) => {
      cb(err, token);
    }
  );
}

module.exports = encodeJwt;
