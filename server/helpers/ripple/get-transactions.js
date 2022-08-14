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
  try {
    // TODO: If the merchant address is using a destination tag then we need to 
    // lookup the transactions from the exchange level account for the specific destination tag.
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
        timestamp: txn.outcome.timestamp,
        deliveredAmount: `${txn.outcome.deliveredAmount.value} ${txn.outcome.deliveredAmount.currency.length <= 3
          ? txn.outcome.deliveredAmount.currency
          : Buffer.from(txn.outcome.deliveredAmount.currency, 'hex').toString('utf8')}`,
        memo: txn.specification.memos[0].data,
        xrplExplorer:
          xrplNetwork === "MAINNET"
            ? `https://livenet.xrpl.org/transactions/${txn.id}`
            : `https://testnet.xrpl.org/transactions/${txn.id}`,
      }));
    return xrphoneTxns;
  } catch (err) {
    console.log("get-transactions:catch:err", err.message);
    return [];
  }
}

module.exports = getTransactions;
