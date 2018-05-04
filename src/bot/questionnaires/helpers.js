const R = require("ramda");

module.exports = {
  getQuestionnairesByCategory,
  getRandomQuestionnaire,
  questionnairesByAnswered,
  countOfAnswersByCategoryMap,
  allowableQuestionnairesByAnswers,
  countOfNeedsAnswersByCategoryMap
};

function getQuestionnairesByCategory(questionnaires = [], category = "") {
  return questionnaires.filter(
    questionnaire => questionnaire.category === category
  );
}

function getRandomQuestionnaire(questionnaires = []) {
  return questionnaires[
    Math.floor(Math.random() * (questionnaires.length - 1))
  ];
}

function questionnairesByAnswered(questionnaires = [], answers = []) {
  return questionnaires.filter(q => checkIdInCollection(answers)(q._id));
}

function countOfAnswersByCategoryMap(questionnaires = []) {
  return questionnaires.reduce(
    (hashMap, item) =>
      hashMap.set(item.category, (hashMap.get(item.category) || 0) + 1),
    new Map()
  );
}

function countOfNeedsAnswersByCategoryMap(categories = []) {
  return categories.reduce(
    (hashMap, c) => hashMap.set(c.title, c.numberOfRequiredAnswers),
    new Map()
  );
}

function allowableQuestionnairesByAnswers(questionnaires = [], answers = []) {
  return questionnaires.filter(
    q =>
      !R.map(R.toString)(R.pluck("questionnaireId")(answers)).includes(
        q._id.toString()
      )
  );
}

function checkIdInCollection(answers) {
  return mongooseId =>
    R.map(R.toString)(R.pluck("questionnaireId")(answers)).includes(
      mongooseId.toString()
    );
}
