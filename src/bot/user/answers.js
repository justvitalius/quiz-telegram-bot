const R = require("ramda");

module.exports = {
  makeGamerAnswer
};

function makeGamerAnswer(questionnaire = {}, value, isCorrect) {
  return {
    questionnaireId: R.compose(R.toString, R.propOr({}, "_id"))(questionnaire),
    category: questionnaire.category,
    answeredAt: new Date(),
    answered: value != undefined && isCorrect != undefined,
    value,
    isCorrect
  };
}
