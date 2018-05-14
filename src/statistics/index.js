const config = require("config");

const express = require("express");
const app = express();
const port = config.get("api_server.port");
const bodyParser = require("body-parser");
const endpoints = require("./endpoints");
const { connect } = require("../database");
const logger = require("./logger");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

connect()
  .then(() => {
    endpoints(app);
    app.listen(port);
    logger.info("Statistic RESTful API server started on: $s", port);
  })
  .catch(err => {
    throw err;
  });
