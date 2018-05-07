const { getAllUsers, getAllCategories } = require("../database");

function getConvertedUsers() {
  return getAllUsers().then(users => {
    return users.map(user => {
      return {
        id: user.id,
        username: user.username,
        fio: user.fio,
        answers: user.answers.map(answer => {
          return {
            questionnaireId: answer._id,
            isCorrect: answer.answer.isCorrect,
            category: answer.category,
            answeredAt: answer.answer.answeredAt
              ? new Date(parseInt(answer.answer.answeredAt)).toLocaleDateString(
                  "ru-RU"
                )
              : undefined
          };
        })
      };
    });
  });
}

function getConvertedCategories() {
  return getAllCategories().then(categories => {
    return categories.map(category => {
      return {
        title: category.title,
        numberOfRequiredAnswers: category.numberOfRequiredAnswers
      };
    });
  });
}

module.exports = {
  getConvertedUsers,
  getConvertedCategories
};
