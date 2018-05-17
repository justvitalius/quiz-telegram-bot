const R = require("ramda");

module.exports = {
  makeGamerAnswer,
  alreadyAnswered
};

function makeGamerAnswer(questionnaire = {}, value, isCorrect) {
  const answered = value != undefined && isCorrect != undefined;
  return {
    questionnaireId: (questionnaire._id || "").toString(),
    category: questionnaire.category,
    answeredAt: answered ? new Date() : null,
    answered,
    value,
    isCorrect
  };
}

function alreadyAnswered(gamer, questionnaireId) {
  const answers = gamer.answers.filter(
    answer => answer.questionnaireId.toString() === questionnaireId
  ) || [{}];
  return answers[0].answered;
}
