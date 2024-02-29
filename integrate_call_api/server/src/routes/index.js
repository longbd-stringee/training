const config = require("../config");
const state = require("../utils/state");
const { getAccessToken } = require("../utils");

const getAvailableUserId = () => {
    return state.userIds[0];
};

const initRoute = (app) => {
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

        if (state.isForwarded && state.forwardedNumber.trim()) {
            scco = [
                {
                    action: "connect",
                    from: {
                        type: fromInternal === "true" ? "internal" : "external",
                        number: from,
                        alias: config.hotline,
                    },
                    to: {
                        type: "external",
                        number: state.forwardedNumber,
                        alias: state.forwardedNumber,
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

        state.userIds.push(userId);

        return res.json({
            data: token,
        });
    });

    app.post("/toggle-forward-number", (req, res) => {
        const { number, disabled } = req.body;

        state.isForwarded = !disabled;
        state.forwardedNumber = number;

        return res.json({
            data: true,
        });
    });
};

module.exports = initRoute;
