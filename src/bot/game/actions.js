const { isTestAvailableByTime } = require("./dateutils");
const R = require("ramda");
const { makeGamerAnswer, alreadyAnswered } = require("../user/answers");
const { getQuestion } = require("../questionnaires");
const { WITH_QUESTIONS_STATUS, FINISH_STATUS } = require("../user");
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
const { generateOpts, generateMessage } = require("../messages");

const {
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  processUserEndStatus,
  processUserNewStatus,
  generatePayload
} = require("./pipes");

const { countCorrectAnswers } = require("./helpers");
const config = require("config");
const SIMPLE_PRIZE_SCORE = config.get("bot.simple_prize_score");

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
  stopEmptyMessage,
  handleStartForAlreadyExistsGamer
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
                "История ваших ответов очищена. Тестирование начнется сначала. Обновление придет автоматически"
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
              "Вы не найдены в базе анкетирования. Отравьте /start, чтобы попасть в список участников"
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
    const answer = msg.text;
    const questionId = answer.match(/(\w+)--/)[1];
    const answerIndex = answer.match(/--(\d+)/)[1];

    if (alreadyAnswered(user, questionId)) {
      return resolve();
    }

    if (user.status === "with-question") {
      logger.info("Gamer %s, answer: %s", telegramId, msg);
      setNextStatus(user);
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
          logger.info(
            "Gamer %s, isCorrect=%s, newAnswer=%s",
            telegramId,
            isCorrect,
            newAnswer
          );
          // Так как не обновляется значение объекта в массиве, приходится делать это отдельно
          // Далее пользователь обновляется для изменения статуса
          updateUserAnswer(user._id, newAnswer)
            .then(_ => {
              updateUser(user)
                .then(updatedUser => {
                  logger.info(
                    "Gamer %s updated to %s",
                    telegramId,
                    updatedUser
                  );
                  const { answers = [] } = user;
                  //Чтобы не вычитывать пользователя из БД и т.к. в user.answers на данном этапе хранится на один вопрос
                  //меньше, чем реально отвечено, а ответ на последний вопрос находится в newAnswer в isCorrect, то добавляем доп. проверку
                  const score =
                    countCorrectAnswers(answers) + (isCorrect ? 1 : 0);
                  let scoreMsg = "";
                  if (score == SIMPLE_PRIZE_SCORE && isCorrect) {
                    scoreMsg +=
                      "\n\nВы набрали балл, достаточный для получения подарка. Покажите это сообщение сотрудникам на стойке Сбертеха и получите его.\nПродолжайте участвовать и вы сможете получить более крутые призы!";
                  }
                  if (isTestAvailableByTime()) {
                    resolve({
                      id: telegramId,
                      msg: `Ответ принят, спасибо! Следующее обновление придет автоматически.${scoreMsg}`
                    });
                  } else {
                    resolve({
                      id: telegramId,
                      msg: `Ответ принят, спасибо!.\nК сожалению, бот активен только во время конференции, сейчас он недоступен.${scoreMsg}`
                    });
                  }
                })
                .catch(err => {
                  logger.info(err);
                  reject({
                    id: telegramId,
                    msg:
                      "Произошла ошибка. Обратитесь на стойку к сотрудникам Сбертеха."
                  });
                });
            })
            .catch(err => {
              logger.error(err);
              reject({
                id: telegramId,
                msg:
                  "Произошла ошибка. Обратитесь на стойку к соткрудникам Сбертеха."
              });
            });
        })
        .catch(err => {
          logger.error(err);
          reject({
            id: telegramId,
            msg: "Произошла ошибка. Обратитесь на стойку к hr."
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
          msg: `Приветствую, ${name}! Вы добавлены в список участников.\nЧерез время вам будет выслан первый вопрос.`
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
  return Promise.resolve(messages.map(generateMessage));
}

function handleStartForAlreadyExistsGamer(gamer) {
  if (gamer.status === WITH_QUESTIONS_STATUS) {
    logger.info("handleStartForAlreadyExistsGamer: %s", gamer);
    const notAnswered = gamer.answers.filter(a => !a.answered);
    const lastAnswer = notAnswered[notAnswered.length - 1];
    const questionnaireId = lastAnswer.questionnaireId;
    logger.info(
      "with answer: %s and questionnaireId: %s",
      lastAnswer,
      questionnaireId
    );
    return Question.findById(questionnaireId)
      .then(questionnaire => {
        const processGamer = R.compose(
          processHasQuestionnaireForGamer(questionnaire),
          generatePayload
        );
        return Promise.resolve(generateMessage(processGamer(gamer).message));
      })
      .catch(logger.error);
  }

  if (gamer.status === FINISH_STATUS) {
    const processGamer = R.compose(
      processNoQuestionnaireForGamer(null),
      generatePayload
    );
    return Promise.resolve(generateMessage(processGamer(gamer).message));
  }
}

function stopEmptyMessage(message = {}) {
  if (message.id && message.msg) {
    return message;
  }
  logger.info("Gamer twice answer on questionnaire");
  throw new Error("Gamer twice answer on questionnaire");
}
