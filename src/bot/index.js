const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const TOKEN = config.get("telegramBotToken");

const bot = new TelegramBot(TOKEN, { polling: true });

const http = require("http");
http
  .createServer((req, res) => res.end("ok"))
  .listen(config.get("server.port"));

const getQuestion = require("./quizer/index");
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
  startQuiz
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

bot.onText(/\d+/, msg => {
  checkForExistingUser(msg)
    .then(user => handleUserAnswer(user, msg))
    .then(({ id, msg }) => bot.sendMessage(id, msg))
    .catch(({ id, msg }) => bot.sendMessage(id, msg));
});

setInterval(() => {
  getAllUsers()
    .then(users => {
      users
        .filter(user => ["wait-question", "new"].includes(user.status))
        .forEach(user => {
          getAllQuestionnaires()
            .then(results => {
              let answers = user.answers.map(answer => answer.id) || [];
              results = results.filter(result => !answers.includes(result.id));
              const questionnaire = getQuestion(results, [0], 2);
              if (!questionnaire) {
                user.status = "end";
                updateUser(user)
                  .then(() => {
                    bot.sendMessage(
                      user.id,
                      "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
                    );
                  })
                  .catch(err => console.log(err));
                return;
              }
              setNextStatus(user);
              user.answers = user.answers.concat(questionnaire);
              updateUser(user)
                .then(() => {
                  bot.sendMessage(
                    user.id,
                    renderQuestion({
                      question: questionnaire.question,
                      options: questionnaire.options
                    }),
                    { parse_mode: "HTML" }
                  );
                })
                .catch(err => console.log(err));
            })
            .catch(err => {
              user.status = "end";
              bot.sendMessage(
                user.id,
                "Невозможно получить вопрос из базы данных. Пожалуйста, попробуйте позже"
              );
              console.log(err);
            });
        });
    })
    .catch(err => console.log(err));
}, 2000);
