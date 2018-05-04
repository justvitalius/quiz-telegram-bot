const faker = require("faker");
const Question = require("../src/database/models/question");

module.exports = {
  generateQuestionnaires,
  generateQuestionnaire,
  questionnaire: generateQuestionnaire
};

function generateQuestionnaires(count = 0, categories = []) {
  const collection = [];
  for (let i = 0; i < count; i++) {
    collection.push(
      generateQuestionnaire({
        category:
          categories[Math.floor(Math.random() * (categories.length - 1))]
      })
    );
  }

  return collection;
}

function generateQuestionnaire(options) {
  return new Question(
    Object.assign(
      {
        title: faker.lorem.sentence(),
        category: 0,
        options: ["correct", "incorrect", "incorrect", "incorrect"],
        answer: {
          value: 0
        }
      },
      options
    )
  );
}
