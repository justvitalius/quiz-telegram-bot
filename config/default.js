module.exports = {
  telegramBotToken: "<insert token into development.json>",
  mongo: {
    host: "mongodb://localhost:27017/",
    dbName: "quiz_db"
  },
  bot_server: {
    port: 5000
  },

  api_server: {
    port: process.env.PORT || 3000
  }
};
