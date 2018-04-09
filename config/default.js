module.exports = {
  telegramBotToken: "<insert token into development.json>",
  mongo: {
    host: "mongodb://localhost:27017/",
    dbName: "quiz_db"
  },
  server: {
    port: process.env.PORT || 5000,
    apiPort: process.env.API_PORT || 3000
  }
};
