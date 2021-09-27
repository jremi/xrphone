const { XummSdk } = require("xumm-sdk");
const { xrpToDrops } = require("../ripple");

const Sdk = new XummSdk();

module.exports = function (
  xummUserToken,
  merchantXrpAccount,
  xrpAmount,
  metadata = {
    usdAmount: null,
    invoiceId: null,
    invoiceNumber: null,
    merchantXrphone: null,
  }
) {
  return new Promise((resolve, reject) => {
    const sendPayment = async () => {
      try {
        const transaction = {
          user_token: xummUserToken,
          txjson: {
            TransactionType: "Payment",
            Destination: merchantXrpAccount,
            Amount: xrpToDrops(xrpAmount),
            Memos: [
              {
                Memo: {
                  MemoData: Buffer.from(
                    `XRPhone Payment (Invoice #${metadata.invoiceNumber})`
                  )
                    .toString("hex")
                    .toUpperCase(),
                },
              },
            ],
          },
          custom_meta: {
            blob: JSON.stringify(metadata),
          },
        };
        const payment = await Sdk.payload.create(transaction);
        resolve(payment);
        /*
        await Sdk.payload.subscribe(payment, async ({ data }) => {
          const dataPayload = await Sdk.payload.get(data.payload_uuidv4);
          if (dataPayload.response && dataPayload.response.resolved_at) {
            const resultObject = (result) => ({
              result,
              // XRPhoneNumber: user.XRPhoneNumber,
            });
            resolve(
              dataPayload.response.dispatched_result === "tesSUCCESS"
                ? resultObject("SUCCESS")
                : resultObject("DECLINED")
            );
            return true;
          }
        });
        */
      } catch (err) {
        reject(err);
      }
    };
    sendPayment();
  });
};
