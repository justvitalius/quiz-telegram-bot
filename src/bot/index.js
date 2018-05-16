const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const { isTestAvailableByTime } = require("./game/dateutils");
const TOKEN = config.get("telegramBotToken");

const bot = new TelegramBot(TOKEN, { polling: true });

const logger = require("./logger");

require("./server").start(bot);

const { initQuestions } = require("../database");
const { renderHelp } = require("./messages");
const { parseMsg } = require("./messages/parsers");

const {
  handleUserAnswer,
  checkForExistingUser,
  startQuiz,
  processWaitingUsers,
  clearUserProfile,
  handleStartForAlreadyExistsGamer,
  stopEmptyMessage
} = require("./game/actions");

initQuestions();

bot.onText(/\/clear/, msg => {
  logger.info("command /clear %s", msg);
  clearUserProfile(msg).then(({ id, msg }) => sendMessage(id, msg));
});

bot.onText(/\/help/, msg => {
  logger.info("command /help %s", msg);
  const { telegramId } = parseMsg(msg);
  sendMessage(telegramId, renderHelp(), { parse_mode: "HTML" });
});

bot.onText(/\/start/, incomeMsg => {
  if (isTestAvailableByTime()) {
    logger.info("command /start %s", incomeMsg);
    checkForExistingUser(incomeMsg)
      .then(handleStartForAlreadyExistsGamer)
      .catch(_ => startQuiz(incomeMsg))
      .then(({ id, msg, opts }) => sendMessage(id, msg, opts))
      .catch(({ id, msg }) => sendMessage(id, msg));
  } else {
    const { chat: { id } } = incomeMsg;
    sendMessage(id, "Извините, в данное время работа бота невозможна");
  }
});

setInterval(() => {
  if (isTestAvailableByTime()) {
    processWaitingUsers()
      .then(messages =>
        messages.map(({ id, msg, opts }) => {
          sendMessage(id, msg, opts);
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
    .then(stopEmptyMessage)
    .catch(logger.error)
    .then(({ id, msg }) => sendMessage(id, msg))
    .catch(({ id, msg }) => sendMessage(id, msg));
});

bot.on("polling_error", err => logger.error(err));

function sendMessage(id, msg, opts) {
  return bot
    .sendMessage(id, msg, opts)
    .then(_ => logger.info("Success send to gamer=%s, msg=%s", id, msg))
    .catch(err => {
      logger.error("Error with send to gamer=%s, msg=%s. \n%s", id, msg, err);
    });
}
