module.exports = {
  getQuestionnairesByCategory: getQuestionnairesByType,
  getTypes,
  getRandomQuestionnaire
};

function getTypes(questionnaires = []) {
  return Array.from(
    questionnaires.reduce(
      (result, question) => result.set(question.category),
      new Set()
    )
  );
}

function getQuestionnairesByType(questionnaires = [], category = "") {
  return questionnaires.filter(
    questionnaire => questionnaire.category === category
  );
}

function getRandomQuestionnaire(questionnaires = []) {
  return questionnaires[
    Math.floor(Math.random() * (questionnaires.length - 1))
  ];
}
