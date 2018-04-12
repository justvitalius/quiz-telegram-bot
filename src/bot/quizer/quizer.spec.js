const { getRandomQuestionnaire } = require("../questionnaires/helpers");
const getQuestion = require("./index");
const {
  generateQuestionnaires,
  generateQuestionnaire
} = require("../../../test-helpers/questionnaires");

describe("Опросник подбирает вопрос игроку на основе истории вопросов", () => {
  describe("На входе общий список вопросов, профайл игрока, задача <выдать вопрос>", () => {
    const maxCountByType = 2;
    const categoriesOrder = [0, 1, 2, 3];
    const questionnaires = generateQuestionnaires(10, categoriesOrder);
    const userProfile = {
      answers: []
    };

    it("Выдает первый вопрос из самых легких", () => {
      const result = getQuestion(
        questionnaires,
        categoriesOrder,
        maxCountByType,
        userProfile
      );
      expect(result.category).toEqual(categoriesOrder[0]);
    });

    it("Выдает первый вопрос первой категории, если ответов в ней меньше <maxCountByType>", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [generateQuestionnaire({ category: 0 })]
      });
      const result = getQuestion(
        questionnaires,
        categoriesOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result.category).toEqual(categoriesOrder[0]);
    });

    it("После <maxCountByType> легких вопросов выдает вопрос следующей сложности", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [
          generateQuestionnaire({ category: 0 }),
          generateQuestionnaire({ category: 0 })
        ]
      });
      const result = getQuestion(
        questionnaires,
        categoriesOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result.category).toEqual(categoriesOrder[1]);
    });
    it("Пройдя по N вопросов всех сложностей выдает пустой вопрос", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [
          generateQuestionnaire({ category: 0 }),
          generateQuestionnaire({ category: 0 }),
          generateQuestionnaire({ category: 1 }),
          generateQuestionnaire({ category: 1 }),
          generateQuestionnaire({ category: 2 }),
          generateQuestionnaire({ category: 2 }),
          generateQuestionnaire({ category: 3 }),
          generateQuestionnaire({ category: 3 })
        ]
      });
      const result = getQuestion(
        questionnaires,
        categoriesOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result).toBeNull();
    });
  });
});
