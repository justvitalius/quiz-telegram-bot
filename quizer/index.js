const {
  getRandomQuestionnaire,
  getQuestionnairesByType
} = require("../questionnaires/helpers");

module.exports = getQuestion = (
  questionnaires = [],
  typeOrder = [],
  maxCountByType = 0,
  userProfile = {}
) => {
  const answers = userProfile.answers;
  const answersCount = answers.length;

  if (answersCount === 0) {
    return getRandomQuestionnaire(
      getQuestionnairesByType(questionnaires, typeOrder[0])
    );
  }

  if (answersCount >= typeOrder.length * maxCountByType) {
    return null;
  }

  const countAnswerInLastType = answersCount % maxCountByType;
  const lastAnswer = answers[answersCount - 1];
  let nextQuestionnaireType = lastAnswer.type;

  if (countAnswerInLastType === 0) {
    nextQuestionnaireType = typeOrder[typeOrder.indexOf(lastAnswer.type) + 1];
  }

  return getRandomQuestionnaire(
    getQuestionnairesByType(questionnaires, nextQuestionnaireType)
  );
};
