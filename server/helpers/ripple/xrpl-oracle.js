"use strict";

const RippleAPI = require("ripple-lib").RippleAPI;

const api = new RippleAPI({
  server: "wss://s1.ripple.com",
});

// https://dev.to/wietse/aggregated-xrp-usd-price-info-on-the-xrp-ledger-1087

const xrplLabsPriceOracle = "rXUMMaPpZqPutoRszR29jtC8amWq3APkx";

module.exports = () => {
  return api
    .connect()
    .then(() => api.getTrustlines(xrplLabsPriceOracle))
    .then((info) => {
      // console.log(
      //   "XRPL:oracle",
      //   `$${info[0].specification.limit} ${info[0].specification.currency}`
      // );
      api.disconnect();
      return parseFloat(info[0].specification.limit);
    })
    .catch((err) => {
      console.log(err);
    });
};
