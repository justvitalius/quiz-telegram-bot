const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "437490297:AAG4HUywKyNBtEsqKVv6tMmGbRsNeDFsSSo";

// const bot = new TelegramBot(TOKEN, { polling: true });

const port = process.env.PORT || 443;
const host = process.env.HOST || "0.0.0.0";
const externalUrl =
  process.env.CUSTOM_ENV_VARIABLE ||
  "https://sheltered-brook-50261.herokuapp.com";
const bot = new TelegramBot(process.env.TOKEN, {
  webHook: { port: port, host: host }
});
bot.setWebHook(externalUrl + ":443/bot" + TOKEN);

const questionnaires = require("../questionaries");
const getQuestion = require("../quizer");
const compareAnswer = require("../compare-answer");
const { generateUser, setNextStatus } = require("../user");
const { renderQuestion } = require("./message");

const userProfiles = new Map();

const userProfile = {
  answers: []
};

bot.onText(/\/clear/, msg => {
  userProfiles.delete(msg.from.id);

  bot.sendMessage(
    msg.chat.id,
    `Профиль пользователя ${msg.from.username} уничтожен`
  );
});

bot.onText(/\/start/, msg => {
  const userProfile = generateUser({
    chatId: msg.chat.id,
    id: msg.from.id,
    username: msg.from.username
  });

  userProfiles.set(userProfile.id, userProfile);

  bot.sendMessage(
    userProfile.id,
    `
Приветствую, ${msg.from.username}!
Вы добавлены в список анкетирующихся.
Через некоторое время вы получите вопрос.
  `
  );
});

bot.onText(/\d+/, msg => {
  const userProfile = userProfiles.get(msg.from.id);
  if (!userProfile) {
    bot.sendMessage(
      msg.chat.id,
      "Вы не найдены в базе анкетирования. Отравьте /start, чтобы я включил вас в список."
    );
  }

  if (userProfile.status === "end") {
    bot.sendMessage(
      msg.chat.id,
      "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
    );
  }

  if (userProfile.status === "with-question") {
    setNextStatus(userProfile);
    const answer = msg.text;
    const isCorrectAnswer = compareAnswer(
      userProfile.answers[userProfile.answers.length - 1],
      answer
    );
    bot.sendMessage(
      userProfile.id,
      `
      ${isCorrectAnswer ? "Правильный" : "Неправильный"} ответ
    `
    );
  }
});

setInterval(() => {
  Array.from(userProfiles.values())
    .filter(user => ["wait-question", "new"].includes(user.status))
    .forEach(user => {
      const questionnaire = getQuestion(questionnaires, [0], 2, userProfile);
      if (!questionnaire) {
        user.status = "end";
        bot.sendMessage(
          user.id,
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
        );
      }
      setNextStatus(user);
      user.answers = user.answers.concat(questionnaire);
      console.log(
        renderQuestion({
          question: questionnaire.question,
          options: questionnaire.options
        })
      );
      bot.sendMessage(
        user.id,
        renderQuestion({
          question: questionnaire.question,
          options: questionnaire.options
        }),
        { parse_mode: "HTML" }
      );
    });
}, 2000);
