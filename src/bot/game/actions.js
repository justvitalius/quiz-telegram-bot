const R = require("ramda");
const { makeGamerAnswer } = require("../user/answers");
const { getQuestion } = require("../questionnaires");
const logger = require("../logger");

const {
  updateUser,
  updateUserAnswer,
  createUser,
  getUserById,
  deleteUser,
  getAllUsers,
  getAllQuestionnaires,
  getAllCategories
} = require("../../database");

const Question = require("../../database/models/question");

const {
  generateUser,
  filterWaitingUsers,
  setNextStatus,
  clearUser
} = require("../user");
const compareAnswer = require("../compare-answer");

const { parseMsg } = require("../messages/parsers");
const { generateOpts } = require("../messages");

const {
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  processUserEndStatus,
  processUserNewStatus,
  generatePayload
} = require("./pipes");

module.exports = {
  destroyUserProfile,
  startQuiz,
  handleUserAnswer,
  checkForExistingUser,
  processWaitingUsers: getQuestinnairesForWaitingGamers,
  processUserEndStatus,
  processUserNewStatus,
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  clearUserProfile,
  handleAlreadyExistsGamer
};

function destroyUserProfile(msg) {
  const { userId, telegramId, name } = parseMsg(msg);

  return new Promise(resolve =>
    deleteUser(userId)
      .then(_ => {
        logger.info("User was deleted, id=", telegramId);
        resolve({
          id: telegramId,
          msg: `Профиль игрока ${name} уничтожен`
        });
      })
      .catch(err => {
        logger.error(err);
        resolve({
          id: telegramId,
          msg: `Произошла ошибка. ${name} попробуйте еще раз.`
        });
      })
  );
}

function clearUserProfile(msg) {
  const { telegramId } = parseMsg(msg);

  return new Promise((resolve, reject) =>
    getUserById(telegramId)
      .then(user => {
        if (!user || !user.length) {
          reject();
        }
        const clearedUser = clearUser(user[0]);
        return updateUser(clearedUser)
          .then(
            resolve({
              id: telegramId,
              msg:
                "История ваших ответов очищена. Тестирование начнется сначала. Ждите вопрос"
            })
          )
          .catch(reject);
      })
      .catch(err => {
        console.log(err);
        return reject({
          id: telegramId,
          msg: `Произошла ошибка при поиске вашего профиля.\nПожалуйста, очистите профиль /clear.\nИ после этого анкетирование перезапустится автоматически.`
        });
      })
  );
}

function checkForExistingUser(msg) {
  const { userId, telegramId } = parseMsg(msg);
  return new Promise((resolve, reject) =>
    getUserById(userId)
      .then(user => {
        if (!user || !user.length) {
          reject({
            id: telegramId,
            msg:
              "Вы не найдены в базе анкетирования. Отравьте /start, чтобы я включил вас в список."
          });
        }
        return resolve(user[0]);
      })
      .catch(err => {
        logger.error(err);
        return reject({
          id: telegramId,
          msg: "Произошла ошибка при поиске пользователя"
        });
      })
  );
}

function handleUserAnswer(user, msg) {
  const { telegramId } = parseMsg(msg);
  return new Promise((resolve, reject) => {
    if (user.status === "end") {
      resolve({
        id: telegramId,
        msg:
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
      });
    }
    if (user.status === "with-question") {
      logger.info("Gamer %s, answer: %s", telegramId, msg);
      setNextStatus(user);
      const answer = msg.text;
      const questionId = answer.match(/(\w+)--/)[1];
      const answerIndex = answer.match(/--(\d+)/)[1];

      const checkedQuestionId = R.compose(
        R.find(R.equals(questionId)),
        R.map(R.toString),
        R.pluck("questionnaireId")
      )(user.answers);

      Question.findById(checkedQuestionId)
        .then(questionnaire => {
          const isCorrect = compareAnswer(questionnaire, answerIndex);
          const newAnswer = makeGamerAnswer(
            questionnaire,
            answerIndex,
            isCorrect
          );
          // Так как не обновляется значение объекта в массиве, приходится делать это отдельно
          // Далее пользователь обновляется для изменения статуса
          updateUserAnswer(newAnswer)
            .then(_ => {
              updateUser(user)
                .then(_ => {
                  resolve({
                    id: telegramId,
                    msg: `Спасибо, ответ принят.\nЖдите обновлений!`
                  });
                })
                .catch(err => {
                  logger.info(err);
                  reject({
                    id: telegramId,
                    msg: "Произошла ошибка на этапе выдачи вопросов"
                  });
                });
            })
            .catch(err => {
              logger.error(err);
              reject({
                id: telegramId,
                msg: "Произошла ошибка на этапе выдачи вопросов"
              });
            });
        })
        .catch(err => {
          logger.error(err);
          reject({
            id: telegramId,
            msg: "Произошла ошибка на этапе обработки ответа"
          });
        });
    }
  });
}

function startQuiz(msg) {
  const { telegramId, userId, username, name, fio } = parseMsg(msg);
  return new Promise((resolve, reject) => {
    const newUser = generateUser({
      telegramId: telegramId,
      id: userId,
      username,
      fio,
      name
    });

    return createUser(newUser)
      .then(_ => {
        resolve({
          id: telegramId,
          msg: `Приветствую, ${name}! Вы добавлены в список игроков. Через некоторое время вы получите вопрос.`
        });
      })
      .catch(err => {
        logger.error("msg %s \nerror %s", msg, err);
        reject({
          id: telegramId,
          msg:
            "Произошла непредвиденная ошибка при начале теста с вами. Попробуйте еще раз."
        });
      });
  });
}

function getQuestinnairesForWaitingGamers() {
  return Promise.all([
    getAllUsers(),
    getAllQuestionnaires(),
    getAllCategories()
  ])
    .then(R.zipObj(["gamers", "questionnaires", "categories"]))
    .then(result => {
      return Object.assign(result, {
        gamers: filterWaitingUsers(result.gamers)
      });
    })
    .then(({ gamers = [], questionnaires = [], categories = [] }) => {
      return Promise.all(
        gamers.map(gamer =>
          getQuestionnaireForGamer(gamer, questionnaires, categories)
        )
      );
    })
    .then(removeEmptyMessages)
    .then(decorateMessagesOpts);
}

function getQuestionnaireForGamer(gamer, questionnaires, categories) {
  const questionnaire = getQuestion(questionnaires, categories, gamer);
  const processGamer = R.compose(
    processHasQuestionnaireForGamer(questionnaire),
    processNoQuestionnaireForGamer(questionnaire),
    generatePayload
  );
  const payload = processGamer(gamer);
  return updateUser(payload.gamer)
    .then(_ => Promise.resolve(payload.message))
    .catch(err => Promise.reject(err));
}

function removeEmptyMessages(messages) {
  return messages.filter(m => !!m);
}

function decorateMessagesOpts(messages = []) {
  return Promise.resolve(
    messages.map(m =>
      Object.assign(m, {
        opts: generateOpts(m)
      })
    )
  );
}

function handleAlreadyExistsGamer({ name, telegramId }) {
  return () =>
    Promise.resolve({
      id: telegramId,
      msg: `${name} с вашим профилем что-то не так.\nПожалуйста, сбросьте историю ответов через /clear.\nИ опрос перезапустится автоматически.`
    });
}
