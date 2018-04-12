const { getQuestionnairesByCategory } = require("./helpers");
const {
  generateQuestionnaire
} = require("../../../test-helpers/questionnaires");

describe("questionnaires helpers", () => {
  describe("getQuestionnairesByCategory", () => {
    it("Отдает коллекцию нужного типа", () => {
      const collection = [
        generateQuestionnaire({ category: 0 }),
        generateQuestionnaire({ category: 0 }),
        generateQuestionnaire({ category: 1 }),
        generateQuestionnaire({ category: 1 }),
        generateQuestionnaire({ category: 1 }),
        generateQuestionnaire({ category: 2 }),
        generateQuestionnaire({ category: 3 })
      ];
      expect(getQuestionnairesByCategory(collection, 0).length).toEqual(2);
    });
  });
});
