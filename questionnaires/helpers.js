module.exports = {
  getQuestionnairesByType,
  getTypes,
  getRandomQuestionnaire
};

function getTypes(questionnaires = []) {
  return Array.from(
    questionnaires.reduce(
      (result, question) => result.set(question.type),
      new Set()
    )
  );
}

function getQuestionnairesByType(questionnaires = [], type = "") {
  return questionnaires.filter(questionnaire => questionnaire.type === type);
}

function getRandomQuestionnaire(questionnaires = []) {
  return questionnaires[
    Math.floor(Math.random() * (questionnaires.length - 1))
  ];
}
