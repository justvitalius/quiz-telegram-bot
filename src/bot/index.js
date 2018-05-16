const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const { isTestAvailableByTime } = require("./game/dateutils");
const TOKEN = config.get("telegramBotToken");

const bot = new TelegramBot(TOKEN, { polling: true });

const logger = require("./logger");
const http = require("http");

http
  .createServer((req, res) => {
    logger.info("server started");
    res.end("ok");
  })
  .listen(config.get("bot_server.port"));

const { renderQuestion } = require("./messages");
const { initQuestions } = require("../database");
const { renderHelp } = require("./messages");
const { parseMsg } = require("./messages/parsers");

const {
  destroyUserProfile,
  handleUserAnswer,
  checkForExistingUser,
  startQuiz,
  processWaitingUsers,
  clearUserProfile,
  handleAlreadyExistsGamer
} = require("./game/actions");

initQuestions();

bot.onText(/\/clear/, msg => {
  logger.info("command /clear %s", msg);
  clearUserProfile(msg).then(({ id, msg }) => bot.sendMessage(id, msg));
});

bot.onText(/\/help/, msg => {
  logger.info("command /help %s", msg);
  const { telegramId } = parseMsg(msg);
  bot.sendMessage(telegramId, renderHelp(), { parse_mode: "HTML" });
});

bot.onText(/\/start/, incomeMsg => {
  if (isTestAvailableByTime()) {
    logger.info("command /start %s", incomeMsg);
    checkForExistingUser(incomeMsg)
      .catch(_ => startQuiz(incomeMsg))
      .then(handleAlreadyExistsGamer(parseMsg(incomeMsg)))
      .then(({ id, msg }) => bot.sendMessage(id, msg))
      .catch(({ id, msg }) => bot.sendMessage(id, msg));
  } else {
    const { chat: { id } } = incomeMsg;
    bot.sendMessage(id, "Извините, в данное время работа бота невозможна");
  }
});

setInterval(() => {
  if (isTestAvailableByTime()) {
    processWaitingUsers()
      .then(messages =>
        messages.map(({ id, msg, opts }) => {
          bot.sendMessage(id, renderQuestion(msg), opts);
        })
      )
      .catch(logger.error);
  }
}, 2000);

bot.on("callback_query", callbackQuery => {
  // TODO: убрать этот ужас. И сделать чистую функцию, которая парсит msg и передает в другие функции
  const msg = callbackQuery.message;
  msg.text = callbackQuery.data;
  msg.from = callbackQuery.from;
  logger.info("Callback %s", msg);

  checkForExistingUser(msg)
    .then(user => handleUserAnswer(user, msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(console.log);
});

bot.on("polling_error", logger.error);
