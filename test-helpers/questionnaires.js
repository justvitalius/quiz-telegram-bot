const faker = require("faker");

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
  return Object.assign(
    {
      _id: Date.now(),
      title: faker.lorem.sentence(),
      category: 0,
      options: ["incorrect", "correct", "incorrect", "incorrect"],
      actived: true,
      answer: {
        value: "correct"
      }
    },
    options
  );
}
