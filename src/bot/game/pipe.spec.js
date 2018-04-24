jest.mock("../../database");
jest.mock("../compare-answer");
jest.mock("../messages/helpers");

const R = require("ramda");
const faker = require("faker");
const { gamer } = require("../../../test-helpers/gamer");
const { WITH_QUESTIONS_STATUS, WAIT_QUESTION_STATUS } = require("../user");
const { questionnaire } = require("../../../test-helpers/questionnaires");
const {
  processUserEndStatus,
  processUserNewStatus,
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer
} = require("./actions");

describe("Пайпы для обработки пользователя по различным сценариям", () => {
  describe("Действие над пользователем возращает новое состояние пользователя и сообщение.", () => {
    const pipePayload = {
      gamer: gamer({ status: WAIT_QUESTION_STATUS }),
      message: { id: faker.random.uuid() }
    };
    const generateUserAndPayload = jest.fn().mockReturnValue(pipePayload);

    describe("Можно композировать действия для выстраивания последовательности изменений.", () => {
      const newUser = {
        status: "new",
        userId: "userId",
        telegramId: "telegramId"
      };
      const endUser = {
        status: "end",
        userId: "userId",
        telegramId: "telegramId"
      };

      describe("Композиция из одного метода", () => {
        it("Возвращает игрока и новую нагрузку при совпадении статуса", () => {
          const composed = R.compose(processUserNewStatus);
          expect(
            composed({
              user: Object.create(newUser)
            })
          ).toMatchObject({
            user: Object.create(newUser),
            payload: { id: "telegramId", msg: jasmine.any(String) }
          });
        });

        it("Возвращает игрока и пустую нагрузку при несовпадении статуса", () => {
          const composed = R.compose(processUserNewStatus);
          expect(
            composed({
              user: Object.create(endUser)
            })
          ).toMatchObject({
            user: Object.create(endUser),
            payload: {}
          });
        });
      });

      describe("Композиция из нескольких методов", () => {
        it("Возвращает игрока и нагрузку при совпадении статуса в первом обработчике", () => {
          const composed = R.compose(
            processUserNewStatus,
            processUserEndStatus
          );
          expect(
            composed({
              user: Object.create(newUser)
            })
          ).toMatchObject({
            user: Object.create(newUser),
            payload: { id: "telegramId", msg: jasmine.any(String) }
          });
        });

        it("Возвращает игрока и нагрузку при совпадении статуса в последнем обработчике", () => {
          const composed = R.compose(
            processUserNewStatus,
            processUserEndStatus
          );
          expect(
            composed({
              user: Object.create(endUser)
            })
          ).toMatchObject({
            user: Object.create(endUser),
            payload: { id: "telegramId", msg: jasmine.any(String) }
          });
        });
      });
    });

    describe("processNoQuestionnaireForGamer", () => {
      describe("В случание наличия вопроса", () => {
        it("Ничего не делает и отдает payload", () => {
          const pipe = R.compose(
            processNoQuestionnaireForGamer(questionnaire()),
            generateUserAndPayload
          );

          expect(pipe()).toMatchObject(pipePayload);
        });
      });

      describe("В случание отсутствия вопроса", () => {
        it("Генерирует текстовое сообщение", () => {
          const pipe = R.compose(
            processNoQuestionnaireForGamer(null),
            generateUserAndPayload
          );

          expect(pipe()).not.toEqual(pipePayload);
          expect(pipe().message.msg).not.toBeNull();
        });
      });
    });

    describe("processHasQuestionnaireForGamer", () => {
      describe("В случание наличия вопроса", () => {
        const attachedQuestion = questionnaire();
        const pipe = R.compose(
          processHasQuestionnaireForGamer(attachedQuestion),
          generateUserAndPayload
        );
        it("Меняет статус пользователя", () => {
          expect(pipe().gamer.status).toEqual(WITH_QUESTIONS_STATUS);
        });
        it("Добавляет к пользователю вопрос", () => {
          expect(pipe().gamer.answers[0].questionnaireId).toEqual(
            attachedQuestion._id.toString()
          );
        });
        it("Генерирует сообщение", () => {
          expect(pipe().message.msg).toEqual(jasmine.any(String));
          expect(pipe().message.id).toEqual(pipePayload.gamer.telegramId);
          expect(pipe().message.id).not.toEqual(pipePayload.message.id);
          expect(pipe().message.msg).not.toEqual(pipePayload.message.msg);
        });
      });

      describe("В случание отсутствия вопроса", () => {
        it("Возвращает payload", () => {
          const pipe = R.compose(
            processHasQuestionnaireForGamer(null),
            generateUserAndPayload
          );

          expect(pipe()).toMatchObject(pipePayload);
        });
      });
    });
  });
});
