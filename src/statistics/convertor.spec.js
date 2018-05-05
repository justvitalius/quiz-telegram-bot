jest.mock("../database");
const R = require("ramda");
const { getConvertedCategories } = require("./convertor");
const { getAllCategories, getAllUsers } = require("../database");
const Category = require("../database/models/category");
const User = require("../database/models/user");

describe("getConvertedCategories", () => {
  const storedCategories = [
    new Category({ title: "cat1", numberOfRequiredAnswers: 1 }),
    new Category({ title: "cat2", numberOfRequiredAnswers: 2 }),
    new Category({ title: "cat3", numberOfRequiredAnswers: 3 })
  ];
  getAllCategories.mockReturnValue(Promise.resolve(storedCategories));

  const result = getConvertedCategories();

  it("Возвращает все категории в Promise", () => {
    result.then(categories =>
      expect(categories).toHaveLength(storedCategories)
    );
  });

  it("Возвращает title", () => {
    result.then(categories =>
      categories.map(({ title }) =>
        expect(R.pluck("title", storedCategories).includes(title)).toBeTruthy()
      )
    );
  });

  it("Возвращает numberOfRequiredAnswers", () => {
    result.then(categories =>
      categories.map(({ numberOfRequiredAnswers }) =>
        expect(
          R.pluck("numberOfRequiredAnswers", storedCategories).includes(
            numberOfRequiredAnswers
          )
        ).toBeTruthy()
      )
    );
  });
});
