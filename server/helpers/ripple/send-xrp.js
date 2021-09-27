"use strict";

// const path = require("path");

// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const server = process.env.RIPPLE_XRP_WSS_FAUCET_TESTNET;
const secret = process.env.RIPPLE_XRP_CREDENTIALS_SECRET_TESTNET;

const ripple = require("ripple-lib");
const api = new ripple.RippleAPI({ server });

module.exports = function ({ fromAddress, toAddress, xrpAmount }) {
  return new Promise((resolve, reject) => {
    api.connect();
    api.on("connected", async () => {
      console.log("connected!");
      // Prepare transaction -------------------------------------------------------
      const preparedTx = await api.prepareTransaction(
        {
          TransactionType: "Payment",
          Account: fromAddress,
          Amount: api.xrpToDrops(xrpAmount), // Same as "Amount": "22000000"
          Destination: toAddress, // To: (receivers address)
        },
        {
          // Expire this transaction if it doesn't execute within ~5 minutes:
          maxLedgerVersionOffset: 75,
        }
      );
      const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion;
      // console.log("Prepared transaction instructions:", preparedTx.txJSON);
      // console.log("Transaction cost:", preparedTx.instructions.fee, "XRP");
      // console.log("Transaction expires after ledger:", maxLedgerVersion);

      // Sign prepared instructions ------------------------------------------------
      const signed = api.sign(preparedTx.txJSON, secret);
      const txID = signed.id;
      const tx_blob = signed.signedTransaction;
      // console.log("Identifying hash:", txID);
      // console.log("Signed blob:", tx_blob);

      // Submit signed blob --------------------------------------------------------
      // The earliest ledger a transaction could appear in is the first ledger
      // after the one that's already validated at the time it's *first* submitted.
      const earliestLedgerVersion = (await api.getLedgerVersion()) + 1;
      const result = await api.submit(tx_blob);
      // console.log("Tentative result code:", result.resultCode);
      // console.log("Tentative result message:", result.resultMessage);

      // Wait for validation -------------------------------------------------------
      let has_final_status = false;
      api.request("subscribe", { accounts: [fromAddress] });
      api.connection.on("transaction", (event) => {
        if (event.transaction.hash == txID) {
          // console.log("Transaction has executed!", event);
          has_final_status = true;
          resolve(event);
          api.disconnect();
        }
      });
      api.on("ledger", (ledger) => {
        if (ledger.ledgerVersion > maxLedgerVersion && !has_final_status) {
          // console.log("Ledger version", ledger.ledgerVersion, "was validated.");
          // console.log(
          //   "If the transaction hasn't succeeded by now, it's expired"
          // );
          has_final_status = true;
        }
      });

      // Check transaction results -------------------------------------------------
      try {
        tx = await api.getTransaction(txID, {
          minLedgerVersion: earliestLedgerVersion,
        });
        // console.log("Transaction result:", tx.outcome.result);
        // console.log(
        //   "Balance changes:",
        //   JSON.stringify(tx.outcome.balanceChanges)
        // );
      } catch (error) {
        // console.log("Couldn't get transaction outcome:", error);
        // reject(error);
      }
    });
  });
};
