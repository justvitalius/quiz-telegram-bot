const config = require("config");
module.exports = require("../logger")(config.get("bot.logDest"));
