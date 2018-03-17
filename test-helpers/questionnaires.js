const faker = require("faker");

module.exports = {
  generateQuestionnaires,
  generateQuestionnaire
};

function generateQuestionnaires(count = 0, types = []) {
  const collection = [];
  for (let i = 0; i < count; i++) {
    collection.push(
      generateQuestionnaire({
        type: types[Math.floor(Math.random() * (types.length - 1))]
      })
    );
  }

  return collection;
}

function generateQuestionnaire(options) {
  return Object.assign(
    {
      id: Date.now(),
      type: 0,
      question: faker.lorem.sentence(),
      options: ["incorrect", "correct", "incorrect", "incorrect"],
      answer: {
        value: "correct"
      }
    },
    options
  );
}
