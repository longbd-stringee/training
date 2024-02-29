const express = require("express");

const applyMiddlewares = require("./middleware");
const initRoute = require("./routes");
const config = require("./config");

const app = express();

// Middleware
applyMiddlewares(app);

// Init route
initRoute(app);

app.listen(config.port, () => {
    console.log("App listen on port", config.port);
});
