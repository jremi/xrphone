"use strict";

const RippleAPI = require("ripple-lib").RippleAPI;

const api = new RippleAPI({
  server: process.env.RIPPLE_XRP_WSS_FAUCET_TESTNET,
});

module.exports = (xrpAddress) => {
  return new Promise((resolve, reject) => {
    api
      .connect()
      .then(() => {
        console.log("getting account info for", xrpAddress);
        return api.getAccountInfo(xrpAddress);
      })
      .then((info) => {
        console.log(info);
        console.log("getAccountInfo done");
        resolve(info.xrpBalance);
      })
      .then(() => {
        return api.disconnect();
      })
      .then(() => {
        console.log("done and disconnected.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
