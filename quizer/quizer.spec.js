const { getRandomQuestionnaire } = require("../questionnaires/helpers");
const getQuestion = require("./index");
const {
  generateQuestionnaires,
  generateQuestionnaire
} = require("../test-helpers/questionnaires");

describe("Опросник подбирает вопрос игроку на основе истории вопросов", () => {
  describe("На входе общий список вопросов, профайл игрока, задача <выдать вопрос>", () => {
    const maxCountByType = 2;
    const correctOrder = [0, 1, 2, 3];
    const questionnaires = generateQuestionnaires(10, correctOrder);
    const userProfile = {
      answers: []
    };

    it("Выдает первый вопрос из самых легких", () => {
      const result = getQuestion(
        questionnaires,
        correctOrder,
        maxCountByType,
        userProfile
      );
      expect(result.type).toEqual(correctOrder[0]);
    });

    it("Выдает первый вопрос первой категории, если ответов в ней меньше <maxCountByType>", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [generateQuestionnaire({ type: 0 })]
      });
      const result = getQuestion(
        questionnaires,
        correctOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result.type).toEqual(correctOrder[0]);
    });

    it("После <maxCountByType> легких вопросов выдает вопрос следующей сложности", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [
          generateQuestionnaire({ type: 0 }),
          generateQuestionnaire({ type: 0 })
        ]
      });
      const result = getQuestion(
        questionnaires,
        correctOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result.type).toEqual(correctOrder[1]);
    });
    it("Пройдя по N вопросов всех сложностей выдает пустой вопрос", () => {
      const updatedUserProfile = Object.assign({}, userProfile, {
        answers: [
          generateQuestionnaire({ type: 0 }),
          generateQuestionnaire({ type: 0 }),
          generateQuestionnaire({ type: 1 }),
          generateQuestionnaire({ type: 1 }),
          generateQuestionnaire({ type: 2 }),
          generateQuestionnaire({ type: 2 }),
          generateQuestionnaire({ type: 3 }),
          generateQuestionnaire({ type: 3 })
        ]
      });
      const result = getQuestion(
        questionnaires,
        correctOrder,
        maxCountByType,
        updatedUserProfile
      );
      expect(result).toBeNull();
    });
  });
});
