const { 
    lookupDeveloperAppsListed, 
    lookupDeveloperAppsSandboxedByMerchantNumber, 
    lookupDeveloperAppById 
} = require("../../../db/supabase");

async function customAppsListed(req, res) {
    const { error, data } = await lookupDeveloperAppsListed();
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
}

async function customAppsSandboxed(req, res) {
    const { error, data } = await lookupDeveloperAppsSandboxedByMerchantNumber(req.query.merchant_number);
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
}

async function customAppsLookupById(req, res) {
    const { error, data } = await lookupDeveloperAppById(req.params.id);
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
}

module.exports = {
    customAppsListed,
    customAppsSandboxed,
    customAppsLookupById
};