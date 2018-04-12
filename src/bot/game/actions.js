const {
  updateUser,
  createUser,
  getUserById,
  deleteUser
} = require("../../database");

const { setNextStatus, generateUser } = require("../user");
const compareAnswer = require("../compare-answer");

const parseMsg = require("../messages/helpers");

module.exports = {
  destroyUserProfile,
  startQuiz,
  handleUserAnswer,
  checkForExistingUser
  // sendQuestionnaireToUser,
  // processWaitingUsers
};

function destroyUserProfile(msg) {
  const { userId } = parseMsg(msg);

  return new Promise(resolve =>
    deleteUser(userId)
      .then(_ => {
        console.log("User was deleted, id=", userId);
        resolve({
          id: userId,
          msg: `Профиль пользователя ${msg.from.username} уничтожен`
        });
      })
      .catch(err => {
        console.log(err);
        resolve({
          id: userId,
          msg: `Произошла ошибка. ${msg.from.username} попробуйте еще раз.`
        });
      })
  );
}

function checkForExistingUser(msg) {
  const { userId } = parseMsg(msg);
  return new Promise((resolve, reject) =>
    getUserById(userId)
      .then(user => {
        if (!user || !user.length) {
          reject({
            id: userId,
            msg:
              "Вы не найдены в базе анкетирования. Отравьте /start, чтобы я включил вас в список."
          });
        }
        return resolve(user[0]);
      })
      .catch(err => {
        console.log(err);
        return reject({
          id: userId,
          msg: "Произошла ошибка при поиске пользователя"
        });
      })
  );
}

function handleUserAnswer(user, msg) {
  const { userId } = parseMsg(msg);
  return new Promise((resolve, reject) => {
    if (user.status === "end") {
      resolve({
        id: userId,
        msg:
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
      });
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
        .then(_ => {
          resolve({
            id: userId,
            msg: `Спасибо...ждите следующий вопрос!`
          });
        })
        .catch(err => {
          console.log(err);
          reject({
            id: userId,
            msg: "Произошла ошибка на этапе выдачи вопросов"
          });
        });
    }
  });
}

function startQuiz(msg) {
  const { userId, username, firstName, lastName } = parseMsg(msg);
  console.log("start");
  return new Promise((resolve, reject) => {
    const newUser = generateUser({
      chatId: userId,
      id: userId,
      username: username,
      fio: `${lastName} ${firstName}`
    });

    return createUser(newUser)
      .then(_ => {
        resolve({
          id: userId,
          msg: `Приветствую, ${username}! Вы добавлены в список анкетирующихся. Через некоторое время вы получите вопрос.`
        });
      })
      .catch(err => {
        console.log(err);
        reject({
          id: userId,
          msg:
            "Произошла непредвиденная ошибка при начале теста с вами. Попробуйте еще раз."
        });
      });
  });
}
