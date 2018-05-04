const R = require("ramda");
const {
  generateQuestionnaires,
  generateQuestionnaire
} = require("../../../test-helpers/questionnaires");

const { getQuestion } = require("./index");

const { gamer } = require("../../../test-helpers/gamer");
const {
  generateCategories,
  generateCategory
} = require("../../../test-helpers/categories");

describe("Опросник подбирает вопрос игроку на основе истории вопросов", () => {
  describe("На входе общий список вопросов, общий список категорий и профайл игрока", () => {
    describe("Если нет истории ответов в профайле", () => {
      const userProfile = gamer();
      const categories = generateCategories(3, 100);
      it("Выдает любой вопрос из первой категории", () => {
        const questionnaires = generateQuestionnaires(
          10,
          R.pluck("title")(categories)
        );
        const question = getQuestion(questionnaires, categories, userProfile);
        const questionIdsFromFirstCategory = R.compose(
          R.pluck("_id"),
          R.filter(R.propEq("category", categories[0].title))
        )(questionnaires);
        expect(questionIdsFromFirstCategory.includes(question._id)).toBeTruthy;
      });
      it("Если нет вопроса в категории, то выдает вопрос из следующей категории", () => {
        const questionnaires = [
          generateQuestionnaire({ category: categories[1].title }),
          generateQuestionnaire({ category: categories[1].title }),
          generateQuestionnaire({ category: categories[2].title })
        ];
        const question = getQuestion(questionnaires, categories, userProfile);
        expect(questionnaires.includes(question._id)).toBeTruthy;
      });
    });

    describe("Если есть история отетов в профайле", () => {
      describe("Если не достигнут лимит по вопросам в данной категории", () => {
        const categories = generateCategories(3, 100);
        const gamerExistsQuestion = generateQuestionnaire({
          category: categories[0].title
        });
        const userProfile = gamer({
          answers: [{ questionnaireId: R.clone(gamerExistsQuestion._id) }]
        });

        it("Не выдает один и тот же вопрос повторно", () => {
          const questionnaires = [
            gamerExistsQuestion,
            generateQuestionnaire({ category: gamerExistsQuestion.category })
          ];

          for (let i = 0; i < 100; i++) {
            expect(
              getQuestion(questionnaires, categories, userProfile)._id
            ).not.toEqual(gamerExistsQuestion._id);
          }
        });
        it("Если нет уникальных вопросов в этой категории, то переходит к следующей категории", () => {
          const questionnaires = [
            gamerExistsQuestion,
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[2].title })
          ];
          const question = getQuestion(questionnaires, categories, userProfile);
          expect(question.category).not.toEqual(
            userProfile.answers[0].category
          );

          const questionIdsFromExpectedCategory = R.compose(
            R.pluck("_id"),
            R.filter(R.propEq("category", categories[1]))
          )(questionnaires);
          expect(questionIdsFromExpectedCategory.includes(question._id))
            .toBeTruthy;
        });
      });
      describe("Если достигнут лимит по вопросам в данной категории", () => {
        const categories = [
          generateCategory({ numberOfRequiredAnswers: 1 }),
          generateCategory({ numberOfRequiredAnswers: 2 }),
          generateCategory({ numberOfRequiredAnswers: 3 })
        ];
        const questionnaires = [
          generateQuestionnaire({ category: categories[0].title }),
          generateQuestionnaire({ category: categories[2].title }),
          generateQuestionnaire({ category: categories[2].title })
        ];

        it("Выдает вопрос из следующей категории", () => {
          const userProfile = gamer({
            answers: [{ questionnaireId: R.clone(questionnaires[0]._id) }]
          });
          expect(
            getQuestion(questionnaires, categories, userProfile).category
          ).not.toEqual(userProfile.answers[0].category);
        });
        it("Если в следующей категории нет вопросов, то переходит дальше", () => {
          const userProfile = gamer({
            answers: [{ questionnaireId: R.clone(questionnaires[0]._id) }]
          });
          for (let i = 0; i < 100; i++) {
            expect(
              getQuestion(questionnaires, categories, userProfile).category
            ).toEqual(categories[2].title);
          }
        });
      });

      describe("Если достиг лимита по всем вопросам и категориям", () => {
        it("Возвращает null", () => {
          const categories = [
            generateCategory({ numberOfRequiredAnswers: 1 }),
            generateCategory({ numberOfRequiredAnswers: 2 }),
            generateCategory({ numberOfRequiredAnswers: 1 })
          ];
          const questionnaires = [
            generateQuestionnaire({ category: categories[0].title }),
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[1].title }),
            generateQuestionnaire({ category: categories[2].title }),
            generateQuestionnaire({ category: categories[2].title }),
            generateQuestionnaire({ category: categories[2].title })
          ];
          const userProfile = gamer({
            answers: [
              { questionnaireId: R.clone(questionnaires[0]._id) },
              { questionnaireId: R.clone(questionnaires[1]._id) },
              { questionnaireId: R.clone(questionnaires[2]._id) },
              { questionnaireId: R.clone(questionnaires[3]._id) }
            ]
          });
          expect(
            getQuestion(questionnaires, categories, userProfile)
          ).toBeNull();
        });
      });
    });
  });
});
