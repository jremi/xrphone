const RippleAPI = require("ripple-lib").RippleAPI;

const api = new RippleAPI({
  server: "wss://xrplcluster.com",
});

module.exports = (xrp) => {
  return api.xrpToDrops(xrp);
};
