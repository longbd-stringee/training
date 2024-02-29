const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const applyMiddlewares = (app) => {
    app.use(cors({ origin: "*" }));
    app.use(morgan("common"));
    app.use(express.json());
};

module.exports = applyMiddlewares;
