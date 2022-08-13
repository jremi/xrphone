const {
    lookupDeveloperAppsListed,
    lookupDeveloperAppsSandboxedByMerchantNumber,
    lookupDeveloperAppById
} = require("../../../db/supabase");

const obfuscateProperty = (propertyName, data) => {
    const allowedProperties = ['appSettingsClientSecret'];
    if (Array.isArray(data)) {
        data = data.map((d) => {
            for (let key in d) {
                let value = d[key];
                if (allowedProperties.includes(key)) {
                    console.log(value);
                    d[key] = value.split('').fill('x').join('');
                }
            }
            return d;
        });
        return;
    }
    if (allowedProperties.includes(propertyName)) {
        data[propertyName] = data[propertyName].split('').fill('x').join('');
    }
};

async function customAppsListed(req, res) {
    const { error, data } = await lookupDeveloperAppsListed();
    if (error) {
        res.status(500).send(error);
        return;
    }
    obfuscateProperty('appSettingsClientSecret', data)
    res.json(data);
}

async function customAppsSandboxed(req, res) {
    const { error, data } = await lookupDeveloperAppsSandboxedByMerchantNumber(req.query.merchant_number);
    if (error) {
        res.status(500).send(error);
        return;
    }
    obfuscateProperty('appSettingsClientSecret', data)
    res.json(data);
}

async function customAppsLookupById(req, res) {
    const { error, data } = await lookupDeveloperAppById(req.params.id);
    if (error) {
        res.status(500).send(error);
        return;
    }
    obfuscateProperty('appSettingsClientSecret', data)
    res.json(data);
}

module.exports = {
    customAppsListed,
    customAppsSandboxed,
    customAppsLookupById
};