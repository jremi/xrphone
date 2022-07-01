"use strict";

const axios = require("axios");
const currency = "XPHO";
const issuer = "rsVZrh3cvisTSHFcEZqPK1ioRzxbeG4PBk"

module.exports = async () => {
    const { data } = await axios.get(`https://api.onthedex.live/public/v1/ticker/${currency}.${issuer}`);
    return data.pairs[0].last
};
