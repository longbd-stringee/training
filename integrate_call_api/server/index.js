const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { getAccessToken } = require("./utils");

const app = express();

const port = 8080;
const hotline = "842471098552";
let isForwarded = false;
let forwardedNumber = "";

let userIds = [];

const getAvailableUserId = () => {
    return userIds[0];
};

app.use(cors({ origin: "*" }));
app.use(morgan("common"));
app.use(express.json());

app.get("/project_answer_url", (req, res) => {
    let { from, to, fromInternal } = req.query;
    from = decodeURIComponent(from);
    to = decodeURIComponent(to);

    const toType = !to.startsWith("84") ? "internal" : "external";

    const connectAction = {
        action: "connect",
        from: {
            type: fromInternal === "true" ? "internal" : "external",
            number: from,
            alias: from,
        },
        to: {
            type: toType,
            number: to,
            alias: to,
        },
        customData: `custom-data-from-server`,
    };

    return res.json([connectAction]);
});

app.get("/answer_url", (req, res) => {
    const { userId, from, to, fromInternal } = req.query;

    let callTo = userId;
    if (!callTo) {
        callTo = getAvailableUserId();
    }

    let scco = [
        {
            action: "connect",
            from: {
                type: fromInternal === "true" ? "internal" : "external",
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

    if (isForwarded && forwardedNumber.trim()) {
        scco = [
            {
                action: "connect",
                from: {
                    type: fromInternal === "true" ? "internal" : "external",
                    number: from,
                    alias: hotline,
                },
                to: {
                    type: "external",
                    number: forwardedNumber,
                    alias: forwardedNumber,
                },
                customData: "test-custom-data",
            },
        ];
    }

    return res.json(scco);
});

app.post("/project_event_url", (req, res) => {
    console.log("🚀 ~ project_event_url:", req.body);

    return res.json({
        data: true,
    });
});

app.post("/event_url", (req, res) => {
    console.log("🚀 ~ event_url:", req.body);

    return res.json({
        data: true,
    });
});

app.get("/access_token", (req, res) => {
    const { userId } = req.query;

    const token = getAccessToken(userId);

    userIds.push(userId);

    return res.json({
        data: token,
    });
});

app.post("/toggle-forward-number", (req, res) => {
    const { number, disabled } = req.body;

    isForwarded = !disabled;
    forwardedNumber = number;

    return res.json({
        data: true,
    });
});

app.listen(port, () => {
    console.log("App listen on port", port);
});
