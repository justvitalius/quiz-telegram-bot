const util = require("util");
const path = require("path");

const { createLogger, format, transports } = require("winston");
const { combine, printf, timestamp } = format;

const myFormat = printf(info => {
  const { splat = [] } = info;
  const jsonable = splat.map(m => JSON.stringify(m, null, 4));
  return util.format(
    `${info.timestamp} ${info.level}: ${info.message}`,
    ...jsonable
  );
});

module.exports = logDest => {
  console.info(`Logger configured to ${logDest} destination`);
  return createLogger({
    format: combine(timestamp(), myFormat),
    transports: [
      new transports.File({
        filename: path.resolve(logDest, "errors.log"),
        level: "error"
      }),
      new transports.File({
        filename: path.resolve(logDest, "warning.log"),
        level: "warn"
      }),
      new transports.File({
        filename: path.resolve(logDest, "info.log"),
        level: "info"
      }),
      new transports.File({ filename: path.resolve(logDest, "all.log") }),
      new transports.Console()
    ]
  });
};
