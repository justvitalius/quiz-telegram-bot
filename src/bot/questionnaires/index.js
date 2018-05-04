const R = require("ramda");
const {
  getRandomQuestionnaire,
  getQuestionnairesByCategory,
  questionnairesByAnswered,
  countOfAnswersByCategoryMap,
  countOfNeedsAnswersByCategoryMap,
  allowableQuestionnairesByAnswers
} = require("./helpers");

module.exports = {
  getQuestion
};

function getQuestion(questionnaires = [], categories = [], gamer = {}) {
  const answers = gamer.answers;
  const allowableQuestionnaires = allowableQuestionnairesByAnswers(
    questionnaires,
    answers
  );
  const answered = questionnairesByAnswered(questionnaires, answers);
  const countFromAnsweredMap = countOfAnswersByCategoryMap(answered);
  const countOfNeedsMap = countOfNeedsAnswersByCategoryMap(categories);

  let sumAnswersFromMap = R.compose(R.sum, Array.from);

  let sumOfNeedsAnswers = sumAnswersFromMap(countOfNeedsMap.values());

  let sumOfAnswered = sumAnswersFromMap(countFromAnsweredMap.values());

  if (sumOfAnswered >= sumOfNeedsAnswers) {
    return null;
  }

  for (let categoryInfo of countOfNeedsMap) {
    const numOfAnsweredByCategory = countFromAnsweredMap.get(categoryInfo[0]);
    if (!numOfAnsweredByCategory || numOfAnsweredByCategory < categoryInfo[1]) {
      const question = getRandomQuestionnaire(
        getQuestionnairesByCategory(allowableQuestionnaires, categoryInfo[0])
      );

      if (question) {
        return question;
      }
    }
  }

  return null;
}
