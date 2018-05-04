const faker = require("faker");
const Category = require("../src/database/models/category");

module.exports = {
  generateCategory,
  generateCategories
};

function generateCategories(count = 0, numberOfRequiredAnswers = 1) {
  const collection = [];
  for (let i = 0; i < count; i++) {
    collection.push(
      generateCategory({
        numberOfRequiredAnswers
      })
    );
  }

  return collection;
}

function generateCategory(options) {
  return new Category(
    Object.assign(
      {
        title: faker.lorem.word(),
        numberOfRequiredAnswers: 1
      },
      options
    )
  );
}
