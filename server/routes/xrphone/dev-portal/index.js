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

/** Dev Portal (Dashboard) */

// Dashboard - Stats
routes.get("/dashboard/stats", requiresAuth, async (req, res) => {
    const { error, count: appCount } = await supabase.from('devportal_application').select('*', { count: 'exact' }).eq("userId", req.user.sub);
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json({
        apps: appCount
    })
});

/** Dev Portal (Apps) */

// Apps - Create
routes.post("/apps", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").insert([{ ...req.body, userId: req.user.sub }]);
    if (error) {
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

// Apps - Delete
routes.delete("/apps/:id", requiresAuth, async (req, res) => {
    const { error, data } = await supabase.from("devportal_application").delete().match({ id: req.params.id, userId: req.user.sub });
    if (error) {
        res.status(500).send(error);
        return;
    }
    res.json(data);
});

module.exports = routes;