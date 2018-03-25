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
const {
  connect,
  getAllQuestionnaires,
  getAllUsers,
  updateUser,
  createUser,
  getUserById,
  deleteUser
} = require("../database");

connect();

bot.onText(/\/clear/, msg => {
  deleteUser(msg.from.id)
    .then(() => {
      console.log("User was deleted, id=", msg.from.id);
      bot.sendMessage(
        msg.chat.id,
        `Профиль пользователя ${msg.from.username} уничтожен`
      );
    })
    .catch(err => console.log(err));
});

bot.onText(/\/start/, msg => {
  getUserById(msg.from.id)
    .then(user => {
      if (!user || !user.length) {
        const newUser = generateUser({
          chatId: msg.chat.id,
          id: msg.from.id,
          username: msg.from.username
        });

        createUser(newUser)
          .then(() => {
            bot.sendMessage(
              newUser.id,
              `Приветствую, ${
                msg.from.username
              }! Вы добавлены в список анкетирующихся. Через некоторое время вы получите вопрос.`
            );
          })
          .catch(err => console.log(err));
      } else {
        bot.sendMessage(
          msg.chat.id,
          `${msg.from.username}, вы уже стартовали тест!`
        );
      }
    })
    .catch(err => console.log(err));
});

bot.onText(/\d+/, msg => {
  getUserById(msg.from.id)
    .then(user => {
      if (!user || !user.length) {
        bot.sendMessage(
          msg.chat.id,
          "Вы не найдены в базе анкетирования. Отравьте /start, чтобы я включил вас в список."
        );
      }

      user = user[0];

      if (user.status === "end") {
        bot.sendMessage(
          msg.chat.id,
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
        );
      }

      if (user.status === "with-question") {
        console.log("Answer was ", msg.text);
        setNextStatus(user);
        console.log("user: ", user.answers);
        const answer = msg.text;
        const isCorrectAnswer = compareAnswer(
          user.answers[user.answers.length - 1],
          answer
        );
        updateUser(user)
          .then(() => {
            bot.sendMessage(
              user.id,
              `${isCorrectAnswer ? "Правильный" : "Неправильный"} ответ`
            );
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
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
