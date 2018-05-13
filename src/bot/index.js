const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const TOKEN = config.get("telegramBotToken");
const url = config.get("url");
const bot_server = config.get("bot_server");
const { port, key, cert } = bot_server;

const options = {
  webHook: {
    port,
    key,
    cert
  }
};

//TODO сделать разделени конфигураций на основе текущего профиля, а не закоменченным кодом
//Для локального старта использовать ngrok и конфигурацию без сертификатов
/*
const options = {
  webHook: {
    port
  }
};
*/

const bot = new TelegramBot(TOKEN, options);

bot.setWebHook(`${url}/bot${TOKEN}`, {
  certificate: options.webHook.cert
});

//TODO сделать разделени конфигураций на основе текущего профиля, а не закоменченным кодом
//Для локального старта использовать ngrok и конфигурацию без сертификатов
//bot.setWebHook(`${url}/bot${TOKEN}`);

const getQuestion = require("./questionnaires/index");
const { renderQuestion } = require("./messages");
const { initQuestions } = require("../database");

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
  checkForExistingUser(msg, true)
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch((response = {}) => {
      if (response.id && response.msg) {
        bot.sendMessage(response.id, response.msg);
      }
      startQuiz(msg)
        .then(({ id, msg }) => bot.sendMessage(id, msg))
        .catch(({ id, msg }) => bot.sendMessage(id, msg));
    });
});

setInterval(() => {
  processWaitingUsers()
    .then(messages =>
      messages.map(({ id, msg, replies }) => {
        // TODO: пока не удалось сериализовать объект и передать его в кнопку. Поэтому вот так странно создаем callback_data
        const keyboard = replies.map((reply, i) => [
          { text: reply.value, callback_data: `${reply.id}--${i + 1}` }
        ]);
        bot.sendMessage(id, renderQuestion(msg), {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: keyboard
          }
        });
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

  checkForExistingUser(msg, false)
    .then(user => handleUserAnswer(user, msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(console.log);
});

bot.on("webhook_error", error => {
  console.log(error.code); // => 'EPARSE'
});
