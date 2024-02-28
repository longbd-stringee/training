const jwt = require("jsonwebtoken");

const apiKeySid = "SK.0.IelGISYFk3odR5bgsrL5VPJrRKcYHAma";
const apiKeySecret = "UmNOVHNvM3loS2xvNlRqY2VRT25WdEVGYVJ2ZFBHUXg=";

const getAccessToken = (userId, ttl = 3600 * 24) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttl;

    const header = { cty: "stringee-api;v=1" };
    const payload = {
        jti: apiKeySid + "-" + now,
        iss: apiKeySid,
        exp: exp,
        userId: userId,
    };

    const token = jwt.sign(payload, apiKeySecret, {
        algorithm: "HS256",
        header: header,
    });
    return token;
};

module.exports = {
    getAccessToken,
};
