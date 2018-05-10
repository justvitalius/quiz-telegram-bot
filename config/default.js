module.exports = {
  telegramBotToken: "<insert token into development.json>",
  url: "<insert server https url here>",
  mongo: {
    host: "mongodb://localhost:27017/",
    dbName: "quiz_db"
  },
  bot_server: {
    port: 5000,
    key: `${__dirname}/../../certs/webhook_pkey.pem`,
    cert: `${__dirname}/../../certs/webhook_cert.pem`
  },

  api_server: {
    port: process.env.PORT || 3000
  }
};
