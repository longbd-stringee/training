const express = require("express");
const morgan = require("morgan");

const { getAccessToken } = require("./utils");

const app = express();

const port = 8080;

app.use(morgan("common"));

app.get("/project_answer_url", (req, res) => {
    let { from, to, fromInternal, userId, projectId, custom } = req.query;
    console.log("🚀 ~ req.query:", req.query);
    from = decodeURIComponent(from);
    to = decodeURIComponent(to);
    custom = decodeURIComponent(custom);

    const toInt = Number(to);
    const toType = toInt < 60000 ? "internal" : "external";

    const connectAction = {
        action: "connect",
        from: {
            type: "internal",
            number: from,
            alias: from,
        },
        to: {
            type: toType,
            number: to,
            alias: to,
        },
        customData: `custom-data-from-server-${custom}`,
        timeout: 45,
        maxConnectTime: -1,
        peerToPeerCall: false,
    };
    console.log("🚀 ~ connectAction:", connectAction);

    return res.json([connectAction]);
});

app.get("/number_answer_url", (req, res) => {
    const { userId, from, to } = req.query;

    const callTo = userId ?? "USER_ID";

    const scco = [
        {
            action: "connect",
            from: {
                type: "external",
                number: from,
                alias: from,
            },
            to: {
                type: "internal",
                number: callTo,
                alias: to,
            },
            customData: "test-custom-data",
        },
    ];

    return res.json(scco);
});

app.get("/access_token", (req, res) => {
    const { userId } = req.query;

    const token = getAccessToken(userId);

    return res.json({
        data: token,
    });
});

app.listen(port, () => {
    console.log("App listen on port", port);
});
