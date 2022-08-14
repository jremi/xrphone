const {
    lookupMerchantXrphoneAccountByQuickbooksRealmId,
} = require("../../../db/supabase");
const Quickbooks = require("../../../helpers/quickbooks/quickbooks-wrapper");

async function invoiceLookup(req, res) {
    switch (req.body.integration) {
        case "quickbooks":
            if (!req.body.realmId || !req.body.invoiceNumber) {
                return res.sendStatus(500);
            }
            const { error, data } =
                await lookupMerchantXrphoneAccountByQuickbooksRealmId(req.body.realmId);
            if (error) return res.json(error);
            const { access_token, refresh_token, realm_id } = data.app_integration;
            const quickbooks = new Quickbooks({
                access_token,
                refresh_token,
                realm_id,
            });
            const invoice = await quickbooks.getInvoiceByInvoiceNumber(
                req.body.invoiceNumber
            );
            if (invoice) {
                return res.json({
                    invoice,
                    merchant: {
                        phone_number: data.phone_number,
                        xrp_account: data.xrp_account,
                        destination_tag: data.destination_tag
                    }
                });
            }
            break;
        default:
            return res.sendStatus(500);
    }
    res.sendStatus(200);
}

module.exports = invoiceLookup;
