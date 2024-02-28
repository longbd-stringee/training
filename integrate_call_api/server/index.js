const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const { getAccessToken } = require("./utils");

const app = express();

const port = 8080;

let userIds = [];
let busyUserIds = [];

const getAvailableUserId = () => {
    const ids = userIds.filter((id) => !busyUserIds.includes(id));

    return ids.length ? ids[0] : null;
};

app.use(cors({ origin: "*" }));
app.use(morgan("common"));
app.use(express.json());

app.get("/project_answer_url", (req, res) => {
    let { from, to, userId } = req.query;
    from = decodeURIComponent(from);
    to = decodeURIComponent(to);

    const toType = !to.startsWith("84") ? "internal" : "external";

    busyUserIds.push(userId);

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
        customData: `custom-data-from-server`,
    };

    return res.json([connectAction]);
});

app.get("/answer_url", (req, res) => {
    const { userId, from, to } = req.query;

    let callTo = userId;
    if (!callTo || busyUserIds.includes(callTo)) {
        callTo = getAvailableUserId();
    }

    if (callTo) {
        busyUserIds.push(callTo);
    }

    // const scco = [
    //     {
    //         action: "connect",
    //         from: {
    //             type: "external",
    //             number: from,
    //             alias: "842471098552",
    //         },
    //         to: {
    //             type: "external",
    //             number: "84972105290",
    //             alias: "84972105290",
    //         },
    //         customData: "test-custom-data",
    //     },
    // ];

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

    userIds.push(userId);

    return res.json({
        data: token,
    });
});

app.post("/hang-up", (req, res) => {
    const { userId } = req.body;

    busyUserIds = busyUserIds.filter((id) => id !== userId);

    return res.json({
        data: true,
    });
});

app.post("/disconnect", (req, res) => {
    const { userId } = req.body;

    busyUserIds = busyUserIds.filter((id) => id !== userId);
    userIds = userIds.filter((id) => id !== userId);

    return res.json({
        data: true,
    });
});

app.listen(port, () => {
    console.log("App listen on port", port);
});
