module.exports = {
  telegramBotToken: "<insert token into development.json>",
  mongo: {
    host: "mongodb://localhost:27017/",
    dbName: "quiz_db"
  },
  bot: {
    logDest: `${process.cwd()}/logs/bot`,
    openTime: "00:00",
    closeTime: "23:59"
  },
  bot_server: {
    logDest: `${process.cwd()}/logs/server`,
    port: 5000
  },

  api_server: {
    logDest: `${process.cwd()}/logs/api`,
    port: process.env.PORT || 3000
  }
};
