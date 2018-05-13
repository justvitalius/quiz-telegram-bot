const R = require("ramda");
const { makeGamerAnswer } = require("../user/answers");
const { getQuestion } = require("../questionnaires");

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

const { generateUser, filterWaitingUsers, setNextStatus } = require("../user");
const compareAnswer = require("../compare-answer");

const { parseMsg } = require("../messages/parsers");

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
  processHasQuestionnaireForGamer
};

const {
  WAIT_QUESTION_STATUS,
  WITH_QUESTIONS_STATUS,
  FINISH_STATUS
} = require("../user");

function destroyUserProfile(msg) {
  const { userId, telegramId, name } = parseMsg(msg);

  return new Promise(resolve =>
    deleteUser(userId)
      .then(_ => {
        console.log("User was deleted, id=", userId);
        resolve({
          id: telegramId,
          msg: `Профиль игрока ${name} уничтожен`
        });
      })
      .catch(err => {
        console.log(err);
        resolve({
          id: telegramId,
          msg: `Произошла ошибка. ${name} попробуйте еще раз.`
        });
      })
  );
}

function checkForExistingUser(msg, isStartCommand) {
  const { userId, telegramId } = parseMsg(msg);
  return new Promise((resolve, reject) =>
    getUserById(userId)
      .then(user => {
        if (!user || !user.length) {
          return reject();
        }
        if (isStartCommand) {
          console.log("1");
          const { status } = user[0];
          let msg;
          switch (status) {
            case WAIT_QUESTION_STATUS:
              msg =
                "Вы уже стартовали, пожалуйста, дождитесь вопроса. Вы не можете повторно стартовать тест";
              break;
            case WITH_QUESTIONS_STATUS:
              msg =
                "Вы стартовали и уже получили вопрос, ответьте сначала на него. Вы не можете повторно стартовать тест";
              break;
            case FINISH_STATUS:
              msg =
                "Вы ответили на все вопросы, больше вопросы к вам не придут. Вы не можете повторно стартовать тест";
              break;
            default:
              msg = "Бот уже запущен";
              break;
          }
          console.log("2");
          console.log(msg);
          return resolve({
            id: telegramId,
            msg
          });
        }
        return resolve(user[0]);
      })
      .catch(err => {
        console.log(err);
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
    if (user.status === WITH_QUESTIONS_STATUS) {
      console.log("Answer was ", msg.text);
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
                    msg: `Спасибо...ждите следующий вопрос!`
                  });
                })
                .catch(err => {
                  console.log(err);
                  reject({
                    id: telegramId,
                    msg: "Произошла ошибка на этапе выдачи вопросов"
                  });
                });
            })
            .catch(err => {
              console.log(err);
              reject({
                id: telegramId,
                msg: "Произошла ошибка на этапе выдачи вопросов"
              });
            });
        })
        .catch(err => {
          console.log(err);
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
  console.log("start");
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
        console.log(err);
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
    .then(removeEmptyMessages);
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
