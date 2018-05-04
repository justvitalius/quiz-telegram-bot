const R = require("ramda");
const {
  getQuestionnairesByCategory,
  countOfNeedsAnswersByCategoryMap,
  allowableQuestionnairesByAnswers,
  countOfAnswersByCategoryMap,
  questionnairesByAnswered
} = require("./helpers");
const {
  generateQuestionnaire,
  generateQuestionnaires
} = require("../../../test-helpers/questionnaires");

const { generateCategory } = require("../../../test-helpers/categories");

const collectIds = idName => R.compose(R.map(R.toString), R.pluck(idName));

describe("questionnaires helpers", () => {
  describe("getQuestionnairesByCategory", () => {
    it("Отдает коллекцию нужного типа", () => {
      const collection = [
        generateQuestionnaire({ category: "0" }),
        generateQuestionnaire({ category: "0" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "2" }),
        generateQuestionnaire({ category: "3" })
      ];
      expect(getQuestionnairesByCategory(collection, "0").length).toEqual(2);
    });
  });

  describe("countOfNeedsAnswersByCategoryMap", () => {
    it("Отдает map с кол-вом необходимых ответов по каждой категории", () => {
      const collection = [
        generateCategory({ title: "cat1", numberOfRequiredAnswers: 1 }),
        generateCategory({ title: "cat2", numberOfRequiredAnswers: 2 }),
        generateCategory({ title: "cat3", numberOfRequiredAnswers: 3 })
      ];
      const expectedMap = new Map([["cat1", 1], ["cat2", 2], ["cat3", 3]]);
      expect(countOfNeedsAnswersByCategoryMap(collection)).toMatchObject(
        expectedMap
      );
    });
  });

  describe("countOfAnswersByCategoryMap", () => {
    it("Отдает map с кол-вом встречающихся вопросов по каждой категории", () => {
      const collection = [
        generateQuestionnaire({ category: "cat1" }),
        generateQuestionnaire({ category: "cat1" }),
        generateQuestionnaire({ category: "cat1" }),
        generateQuestionnaire({ category: "cat2" }),
        generateQuestionnaire({ category: "cat2" }),
        generateQuestionnaire({ category: "cat3" })
      ];

      const expectedMap = new Map([["cat1", 3], ["cat2", 2], ["cat3", 1]]);
      expect(countOfAnswersByCategoryMap(collection)).toMatchObject(
        expectedMap
      );
    });
  });

  describe("allowableQuestionnairesByAnswers", () => {
    it("Отдает коллекцию вопросов исключая вопросы из answers", () => {
      const collection = [
        generateQuestionnaire({ category: "0" }),
        generateQuestionnaire({ category: "0" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "1" }),
        generateQuestionnaire({ category: "2" }),
        generateQuestionnaire({ category: "3" })
      ];
      const answers = [
        { questionnaireId: R.clone(collection[0]._id) },
        { questionnaireId: R.clone(collection[3]._id) },
        { questionnaireId: R.clone(collection[4]._id) }
      ];

      const resultCollection = allowableQuestionnairesByAnswers(
        collection,
        answers
      );

      const resultCollectionIds = collectIds("_id")(resultCollection);
      const answersIds = collectIds("questionnaireId")(answers);

      expect(resultCollection).toHaveLength(collection.length - answers.length);
      expect(resultCollectionIds).toHaveLength(
        collection.length - answers.length
      );
      expect(answersIds).toHaveLength(answers.length);
      resultCollectionIds.map(id =>
        expect(answersIds.includes(id)).toBeFalsy()
      );
    });
  });

  describe("questionnairesByAnswered", () => {
    it("Отдает коллекцию вопросов, которые записаны в answers", () => {
      const collection = generateQuestionnaires(10);
      const answers = [
        { questionnaireId: R.clone(collection[0]._id) },
        { questionnaireId: R.clone(collection[3]._id) },
        { questionnaireId: R.clone(collection[4]._id) }
      ];

      const resultCollection = questionnairesByAnswered(collection, answers);
      const resultIds = collectIds("_id")(resultCollection);
      const answerIds = collectIds("questionnaireId")(answers);

      expect(resultCollection).toHaveLength(answers.length);
      expect(answerIds).toHaveLength(answers.length);

      resultIds.map(q => expect(answerIds.includes(q)).toBeTruthy());
    });
  });
});
