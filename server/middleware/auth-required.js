const jwt = require("jsonwebtoken");

function authRequired(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers.authorization;
  // Check Bearer exists
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authUserData) => {
      if (err) res.sendStatus(401);
      else {
        req.user = authUserData;
        next();
      }
    });
  } else {
    res.sendStatus(401);
  }
}

module.exports = authRequired;
