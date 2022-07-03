const { XummSdk } = require("xumm-sdk");
const { xrpToDrops } = require("../ripple");

const Sdk = new XummSdk();

module.exports = function (
  xummUserToken,
  merchantXrpAccount,
  merchantDestinationTag,
  xrpAmount,
  metadata = {
    usdAmount: null,
    currency: null,
    xphoAmount: null,
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
            Amount: (() => {
              if (metadata.currency && metadata.currency.toLowerCase() === 'xpho') {
                return {
                  currency: '5850484F00000000000000000000000000000000',
                  value: metadata.xphoAmount,
                  issuer: 'rsVZrh3cvisTSHFcEZqPK1ioRzxbeG4PBk'
                }
              }
              return xrpToDrops(xrpAmount)
            })(),
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
        if (merchantDestinationTag) {
          transaction[DestinationTag] = parseInt(merchantDestinationTag)
        }
        const payment = await Sdk.payload.create(transaction).catch(err => console.log('err', err));
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
