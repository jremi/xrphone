const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const requiresAuth = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://xrphone-developer.us.auth0.com/.well-known/jwks.json",
    }),
    audience: "https://developer-site-api.xrphone.app",
    issuer: "https://xrphone-developer.us.auth0.com/",
    algorithms: ["RS256"],
});

const routes = require("express").Router();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_API_URL,
    process.env.SUPABASE_API_KEY_SECRET
);

const { ManagementClient } = require('auth0');

const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET
});

/** Dev Portal (Dashboard) */

// Dashboard - Stats
routes.get("/dashboard/stats", requiresAuth, async (req, res) => {
    const { errorAppCount, count: appCount } = await supabase.from('devportal_application').select('*', { count: 'exact' }).eq("userId", req.user.sub);
    const { errorLogCount, count: logCount } = await supabase
        .from('devportal_log')
        .select('*,devportal_application(userId)', { count: 'exact' })
        .eq("devportal_application.userId", req.user.sub);
    if (errorAppCount || errorLogCount) {
        res.status(500).send(error);
        return;
    }
    res.json({
        apps: appCount,
        logs: logCount
    })
});

/** Dev Portal (Logs) */

// Logs - Read (Get last 250 logs)
routes.get("/logs", requiresAuth, async (req, res) => {
    const { error, data } = await supabase
        .from("devportal_log")
        .select('*,devportal_application(userId, appName, appIconUrl)')
        .eq("devportal_application.userId", req.user.sub)
        .limit(250)
        .order('created_at', { ascending: false });
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
});

/** Dev Portal (Apps) */

// Apps - Create
routes.post("/apps", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").insert({ ...req.body, userId: req.user.sub }).single();
    if (error) {
        res.status(500).send(error);
        return;
    }
    try {
        const { client_id } = await management.createClient({
            name: `xrphone_sdk_app_id:${data.id}`,
            description: "XRPhone SDK access",
            app_type: "non_interactive",
            grant_types: ["client_credentials"]
        });
        await management.createClientGrant({
            "client_id": client_id,
            "audience": process.env.AUTH0_AUDIENCE,
            "scope": ["xrphone-sdk"]
        });
        const { error } = await supabase.from("devportal_application").update({ appApiKey: client_id }).single().match({ id: data.id });
        if (error) {
            res.status(500).send(error);
            return;
        }
    } catch (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
});

// Apps - Read
routes.get("/apps", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").select().eq("userId", req.user.sub);
    if (error) {
        res.status(500).send(error);
        return;
    }
    for (let x = 0; x < data.length; x++) {
        const { appApiKey } = data[x];
        try {
            const { client_secret } = await management.getClient({ client_id: appApiKey });
            data[x].appApiSecret = client_secret;
        } catch (err) {
            console.log('err', err);
            data[x].appApiSecret = ""
        }
    }
    res.json(data);
});

// Apps - Update
routes.patch("/apps/:id", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").update(req.body).single().match({ id: req.params.id, userId: req.user.sub });
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
});

// Apps - Regenerate "Rotate" Api Secret for specific app 
routes.post("/apps/regenerate-api-secret", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").select('id').single().match({ appApiKey: req.body.appApiKey, userId: req.user.sub });
    if (error) {
        res.status(500).send(error);
        return;
    }
    if (!data) {
        res.status(404).send('Unable to locate app API Key for user making request!')
        return;
    }
    let client_secret;
    try {
        const response = await management.clients.rotateClientSecret({ client_id: req.body.appApiKey })
        client_secret = response.client_secret;
    } catch (error) {
        res.status(500).send(error);
        return;
    }
    res.json({ appApiSecret: client_secret });
});

// Apps - Delete
routes.delete("/apps/:id", requiresAuth, async (req, res) => {
    const matchCriteria = { id: req.params.id, userId: req.user.sub };
    const { error: errorSelect, data: dataSelect } = await supabase.from("devportal_application").select('appApiKey').single().match(matchCriteria);
    const { error: errorDelete, data: dataDelete } = await supabase.from("devportal_application").delete().match(matchCriteria);
    if (errorSelect || errorDelete) {
        res.status(500).send(error);
        return;
    }
    try {
        await management.deleteClient({ client_id: dataSelect.appApiKey });
    } catch (error) {
        res.status(500).send(error);
        return;
    }
    res.json(dataDelete);
});

module.exports = routes;
