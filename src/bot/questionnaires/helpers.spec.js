const { getQuestionnairesByType } = require("./helpers");
const {
  generateQuestionnaire
} = require("../../../test-helpers/questionnaires");

describe("questionnaires helpers", () => {
  describe("getQuestionnairesByType", () => {
    it("Отдает коллекцию нужного типа", () => {
      const collection = [
        generateQuestionnaire({ type: 0 }),
        generateQuestionnaire({ type: 0 }),
        generateQuestionnaire({ type: 1 }),
        generateQuestionnaire({ type: 1 }),
        generateQuestionnaire({ type: 1 }),
        generateQuestionnaire({ type: 2 }),
        generateQuestionnaire({ type: 3 })
      ];
      expect(getQuestionnairesByType(collection, 0).length).toEqual(2);
    });
  });
});
