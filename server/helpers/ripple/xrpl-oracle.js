"use strict";

// https://dev.to/wietse/aggregated-xrp-usd-price-info-on-the-xrp-ledger-1087

const axios = require("axios");
const xrplLabsPriceOracle = "rXUMMaPpZqPutoRszR29jtC8amWq3APkx";

module.exports = async () => {
  const { data } = await axios.post(
    "https://xrpl.ws",
    JSON.stringify({
      method: "account_lines",
      params: [{ account: xrplLabsPriceOracle }],
    })
  );
  const lines = data.result.lines;
  const xrpPrice = parseFloat(lines[0].limit);
  return xrpPrice;
};
