const moment = require("moment");
const timeFormat = "hh:mm";
const config = require("config");
const openTime = config.get("bot.openTime");
const closeTime = config.get("bot.closeTime");

function isTestAvailableByTime() {
  const timeNow = moment();
  const timeStartTest = moment(openTime, timeFormat);
  const timeEndTest = moment(closeTime, timeFormat);
  return timeNow.isBetween(timeStartTest, timeEndTest);
}

module.exports = {
  isTestAvailableByTime
};
