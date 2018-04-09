const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const TOKEN = config.get("telegramBotToken");

const bot = new TelegramBot(TOKEN, { polling: true });

const http = require("http");
http
  .createServer((req, res) => res.end("ok"))
  .listen(config.get("bot_server.port"));

const getQuestion = require("./questionnaires/index");
const { setNextStatus } = require("./user");
const { renderQuestion } = require("./messages");
const {
  initQuestions,
  getAllQuestionnaires,
  getAllUsers,
  updateUser
} = require("../database");

const {
  destroyUserProfile,
  handleUserAnswer,
  checkForExistingUser,
  startQuiz,
  processWaitingUsers
} = require("./game/actions");

initQuestions();

bot.onText(/\/clear/, msg => {
  destroyUserProfile(msg).then(({ id, msg }) => bot.sendMessage(id, msg));
});

bot.onText(/\/start/, msg => {
  checkForExistingUser(msg)
    .catch(_ => startQuiz(msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg));
});

bot.onText(/\w+/, msg => {
  console.log("Income message", msg.text);
  checkForExistingUser(msg)
    .then(user => handleUserAnswer(user, msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg));
});

setInterval(() => {
  processWaitingUsers()
    .then(messages =>
      messages.map(({ id, msg, replies }) =>
        bot.sendMessage(id, renderQuestion(msg), {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: replies.map((text, i) => [{ text }]),
            one_time_keyboard: true
          }
        })
      )
    )
    .catch(console.log);
}, 2000);
