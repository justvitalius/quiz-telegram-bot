const moment = require("moment");
const timeFormat = "hh:mm";

function isTestAvailableByTime() {
  const timeNow = moment();
  const timeStartTest = moment("09:00", timeFormat);
  const timeEndTest = moment("19:00", timeFormat);
  return timeNow.isBetween(timeStartTest, timeEndTest);
}

module.exports = {
  isTestAvailableByTime
};
