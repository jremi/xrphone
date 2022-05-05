"use strict";

const RippleAPI = require("ripple-lib").RippleAPI;

const moment = require("moment");

async function getTransactions(xrpAddress, xrplNetwork) {
  const api = new RippleAPI({
    server:
      xrplNetwork === "MAINNET"
        ? process.env.RIPPLE_XRP_WSS_FAUCET_MAINNET
        : process.env.RIPPLE_XRP_WSS_FAUCET_TESTNET,
  });
  await api.connect();
  const ledgerVersion = await api.getLedgerVersion();
  const transactions = await api.getTransactions(xrpAddress, {
    minLedgerVersion: ledgerVersion - 999999,
    earliestFirst: false,
    limit: 20,
    types: ["payment"],
  });
  api.disconnect();
  const xrphoneTxns = transactions
    .filter((txn) => {
      if (txn.specification.memos) {
        return txn.specification.memos.find((memo) =>
          memo.data.match("XRPhone")
        );
      }
    })
    .map((txn) => ({
      txnId: txn.id,
      sourceAddress: txn.specification.source.address,
      destinationAddress: txn.specification.destination.address,
      timestamp:txn.outcome.timestamp,
      deliveredAmount: `${txn.outcome.deliveredAmount.value} ${txn.outcome.deliveredAmount.currency}`,
      memo: txn.specification.memos[0].data,
      xrplExplorer:
        xrplNetwork === "MAINNET"
          ? `https://livenet.xrpl.org/transactions/${txn.id}`
          : `https://testnet.xrpl.org/transactions/${txn.id}`,
    }));
  return xrphoneTxns;
}

module.exports = getTransactions;
