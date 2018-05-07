jest.mock("../../database");
jest.mock("../compare-answer");
jest.mock("../messages/parsers");

const R = require("ramda");
const faker = require("faker");
const { gamer } = require("../../../test-helpers/gamer");
const {
  WITH_QUESTIONS_STATUS,
  WAIT_QUESTION_STATUS,
  FINISH_STATUS
} = require("../user");
const { questionnaire } = require("../../../test-helpers/questionnaires");
const {
  processUserEndStatus,
  processUserNewStatus,
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  generatePayload
} = require("./pipes");

describe("Пайпы для обработки пользователя по различным сценариям", () => {
  describe("Действие над пользователем возращает новое состояние пользователя и сообщение.", () => {
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
          const userProfile = gamer({ status: WAIT_QUESTION_STATUS });
          const expectedPayload = generatePayload(userProfile);
          const pipe = R.compose(
            processNoQuestionnaireForGamer(questionnaire()),
            generatePayload
          );

          expect(pipe(userProfile)).toMatchObject(expectedPayload);
        });
      });

      describe("В случание отсутствия вопроса", () => {
        it("Генерирует текстовое сообщение", () => {
          const userProfile = gamer({ status: WAIT_QUESTION_STATUS });
          const expectedPayload = generatePayload(userProfile);
          const pipe = R.compose(
            processNoQuestionnaireForGamer(null),
            generatePayload
          );

          expect(pipe(userProfile)).not.toEqual(expectedPayload);
          expect(pipe(userProfile).message).toBeNull();
          expect(pipe(userProfile).gamer.status).toEqual(FINISH_STATUS);
        });
      });
    });

    describe("processHasQuestionnaireForGamer", () => {
      describe("В случание наличия вопроса", () => {
        const attachedQuestion = questionnaire();
        const userProfile = gamer({ status: WAIT_QUESTION_STATUS });
        const expectedPayload = generatePayload(userProfile);
        const pipe = R.compose(
          processHasQuestionnaireForGamer(attachedQuestion),
          generatePayload
        );
        it("Меняет статус пользователя", () => {
          expect(pipe(userProfile).gamer.status).toEqual(WITH_QUESTIONS_STATUS);
        });
        it("Добавляет к пользователю вопрос", () => {
          expect(pipe(userProfile).gamer.answers[0].questionnaireId).toEqual(
            attachedQuestion._id
          );
        });
        it("Генерирует сообщение", () => {
          expect(pipe(userProfile).message.msg).toEqual(jasmine.any(String));
          expect(pipe(userProfile).message.id).toEqual(
            expectedPayload.gamer.telegramId
          );
          expect(pipe(userProfile).message.id).not.toEqual(
            expectedPayload.message.id
          );
          expect(pipe(userProfile).message.msg).not.toEqual(
            expectedPayload.message.msg
          );
        });
      });

      describe("В случание отсутствия вопроса", () => {
        it("Возвращает payload", () => {
          const userProfile = gamer({ status: WAIT_QUESTION_STATUS });
          const expectedPayload = generatePayload(userProfile);
          const pipe = R.compose(
            processHasQuestionnaireForGamer(null),
            generatePayload
          );

          expect(pipe(userProfile)).toMatchObject(expectedPayload);
        });
      });
    });
  });
});
