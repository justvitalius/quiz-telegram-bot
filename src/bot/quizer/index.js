const {
  getRandomQuestionnaire,
  getQuestionnairesByCategory
} = require("../questionnaires/helpers");

module.exports = getQuestion = (
  questionnaires = [],
  categoriesOrder = [],
  maxCountByType = 0,
  userProfile = {
    answers: []
  }
) => {
  const answers = userProfile.answers;
  const answersCount = answers.length;

  if (answersCount === 0) {
    return getRandomQuestionnaire(
      getQuestionnairesByCategory(questionnaires, categoriesOrder[0])
    );
  }

  if (answersCount >= categoriesOrder.length * maxCountByType) {
    return null;
  }

  const countAnswerInLastType = answersCount % maxCountByType;
  const lastAnswer = answers[answersCount - 1];
  let nextQuestionnaireType = lastAnswer.category;

  if (countAnswerInLastType === 0) {
    nextQuestionnaireType =
      categoriesOrder[categoriesOrder.indexOf(lastAnswer.category) + 1];
  }

  return getRandomQuestionnaire(
    getQuestionnairesByCategory(questionnaires, nextQuestionnaireType)
  );
};
