const config = require("config");

const express = require("express");
const app = express();
const port = config.get("api_server.port");
const bodyParser = require("body-parser");
const endpoints = require("./endpoints");
const { connect } = require("../database");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

connect()
  .then(() => {
    endpoints(app);
    app.listen(port);
    console.log("Statistic RESTful API server started on: " + port);
  })
  .catch(err => {
    throw err;
  });
