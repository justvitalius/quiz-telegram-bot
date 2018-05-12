module.exports = {
  makeGamerAnswer
};

function makeGamerAnswer(questionnaire = {}, value, isCorrect) {
  return {
    questionnaireId: (questionnaire._id || "").toString(),
    category: questionnaire.category,
    answeredAt: new Date(),
    answered: value != undefined && isCorrect != undefined,
    value,
    isCorrect
  };
}
