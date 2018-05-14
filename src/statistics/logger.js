const config = require("config");
module.exports = require("../logger")(config.get("api_server.logDest"));
