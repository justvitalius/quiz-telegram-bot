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

// TODO: Вместо этого используется on callback_query
// bot.onText(/\w+/, msg => {
//   console.log("Income message", msg);
//   checkForExistingUser(msg)
//     .then(user => handleUserAnswer(user, msg))
//     .then(({ id, msg }) => bot.sendMessage(id, msg))
//     .catch(({ id, msg }) => bot.sendMessage(id, msg));
// });

setInterval(() => {
  processWaitingUsers()
    .then(messages =>
      messages.map(({ id, msg, replies }) => {
        // TODO: пока не удалось сериализовать объект и передать его в кнопку. Поэтому вот так странно создаем callback_data
        if (replies) {
          const keyboard = replies.map((reply, i) => [
            { text: reply.value, callback_data: `${reply.id}--${i}` }
          ]);
          bot.sendMessage(id, renderQuestion(msg), {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: keyboard
            }
          });
        } else {
          bot.sendMessage(id, msg);
        }
      })
    )
    .catch(console.log);
}, 2000);

bot.on("callback_query", callbackQuery => {
  // TODO: убрать этот ужас. И сделать чистую функцию, которая парсит msg и передает в другие функции
  const msg = callbackQuery.message;
  msg.text = callbackQuery.data;
  msg.from = callbackQuery.from;
  console.log(msg);

  checkForExistingUser(msg)
    .then(user => handleUserAnswer(user, msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg));
  // .catch(console.log);
});

bot.on("polling_error", error => {
  console.log(error); // => 'EFATAL'
});
