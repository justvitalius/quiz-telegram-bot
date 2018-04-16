const R = require("ramda");

const {
  updateUser,
  updateUserAnswer,
  createUser,
  getUserById,
  deleteUser,
  getAllUsers,
  getAllQuestionnaires
} = require("../../database");

const { generateUser, filterWaitingUsers, setNextStatus } = require("../user");
const compareAnswer = require("../compare-answer");

const parseMsg = require("../messages/helpers");

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

function destroyUserProfile(msg) {
  const { userId, telegramId } = parseMsg(msg);

  return new Promise(resolve =>
    deleteUser(userId)
      .then(_ => {
        console.log("User was deleted, id=", userId);
        resolve({
          id: telegramId,
          msg: `Профиль пользователя ${msg.from.username} уничтожен`
        });
      })
      .catch(err => {
        console.log(err);
        resolve({
          id: telegramId,
          msg: `Произошла ошибка. ${msg.from.username} попробуйте еще раз.`
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
        console.log(err);
        return reject({
          id: telegramId,
          msg: "Произошла ошибка при поиске пользователя"
        });
      })
  );
}

function handleUserAnswer(user, msg) {
  const { userId, telegramId } = parseMsg(msg);
  return new Promise((resolve, reject) => {
    if (user.status === "end") {
      resolve({
        id: telegramId,
        msg:
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
      });
    }
    if (user.status === "with-question") {
      console.log("Answer was ", msg.text);
      setNextStatus(user);
      const answer = msg.text;
      const currentQuestion = user.answers[user.answers.length - 1];
      const isCorrect = compareAnswer(currentQuestion, answer);
      // Так как не обновляется значение объекта в массиве, приходится делать это отдельно
      // Далее пользователь обновляется для изменения статуса
      updateUserAnswer(currentQuestion, {
        isCorrect,
        answeredAt: msg.date
      })
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
    }
  });
}

function startQuiz(msg) {
  const { telegramId, userId, username, firstName, lastName } = parseMsg(msg);
  console.log("start");
  return new Promise((resolve, reject) => {
    const newUser = generateUser({
      telegramId: telegramId,
      id: userId,
      username: username,
      fio: `${lastName} ${firstName}`
    });

    return createUser(newUser)
      .then(_ => {
        resolve({
          id: telegramId,
          msg: `Приветствую, ${username}! Вы добавлены в список анкетирующихся. Через некоторое время вы получите вопрос.`
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
  return Promise.all([getAllUsers(), getAllQuestionnaires()])
    .then(R.zipObj(["gamers", "questionnaires"]))
    .then(result =>
      Object.assign(result, { gamers: filterWaitingUsers(result.gamers) })
    )
    .then(({ gamers = [], questionnaires = [] }) => {
      return Promise.all(
        gamers.map(gamer => getQuestionnaireForGamer(gamer, questionnaires))
      );
    });
}

function getQuestionnaireForGamer(gamer, questionnaires) {
  const questionnaire = getQuestion(
    questionnaires,
    ["javascript"],
    questionnaires.length
  );
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
