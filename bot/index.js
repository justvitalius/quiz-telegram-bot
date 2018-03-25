const TelegramBot = require("node-telegram-bot-api");
const TOKEN = "588143760:AAEjsGv8eirVN2CAmnBRQtIKsqrycWQCwXw";

console.log(process.env);

const bot = new TelegramBot(TOKEN, { polling: true });

const http = require("http");
http.createServer((req, res) => res.end("ok")).listen(process.env.PORT || 5000);

const getQuestion = require("../quizer");
const compareAnswer = require("../compare-answer");
const { generateUser, setNextStatus } = require("../user");
const { renderQuestion } = require("./message");
const { connect, getAllQuestionnaires } = require("../database");

connect();

const userProfiles = new Map();

const userProfile = {
  answers: []
};

bot.onText(/\/clear/, msg => {
  //TODO брать из БД
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

  //TODO брать из БД
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
  //TODO брать из БД
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
  //TODO брать из БД
  Array.from(userProfiles.values())
    .filter(user => ["wait-question", "new"].includes(user.status))
    .forEach(user => {
      getAllQuestionnaires(function(results) {
        console.log("From DB: " + results);
        const questionnaire = getQuestion(results, [0], 2, userProfile);
        if (!questionnaire) {
          user.status = "end";
          bot.sendMessage(
            user.id,
            "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
          );
        }
        setNextStatus(user);
        user.answers = user.answers.concat(questionnaire);
        bot.sendMessage(
          user.id,
          renderQuestion({
            question: questionnaire.question,
            options: questionnaire.options
          }),
          { parse_mode: "HTML" }
        );
      });
    });
}, 2000);
