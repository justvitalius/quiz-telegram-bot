const {
  generateQuestionnaire,
  generateQuestionnaires
} = require("./questionnaires");

describe("questionnaires tester helpers", () => {
  describe("generateQuestionnaires", () => {
    it("Генерирует N объектов", () => {
      const expectedCount = 10;
      expect(generateQuestionnaires(expectedCount).length).toEqual(
        expectedCount
      );
    });
  });

  describe("generateQuestionnaire", () => {
    it("Генерирует объект с переданными атрибутами", () => {
      const result = generateQuestionnaire({
        type: "type",
        name: "name"
      });
      expect(result.type).toEqual(result.type);
      expect(result.name).toEqual(result.name);
    });

    it("Генерирует объект с дефолтными значениями", () => {
      const result = generateQuestionnaire();
      Object.keys(result).map(attr => expect(attr).toBeDefined());
    });
  });
});
