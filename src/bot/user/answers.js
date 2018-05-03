const R = require("ramda");

module.exports = {
  makeGamerAnswer
};

function makeGamerAnswer(questionnaire = {}, value, isCorrect) {
  const { _id = {} } = questionnaire;
  return {
    questionnaireId: _id.toString(),
    category: questionnaire.category,
    answeredAt: new Date(),
    answered: value != undefined && isCorrect != undefined,
    value,
    isCorrect
  };
}
