const R = require("ramda");

const { WITH_QUESTIONS_STATUS, FINISH_STATUS } = require("../user");
const { makeGamerAnswer } = require("../user/answers");

module.exports = {
  processNoQuestionnaireForGamer,
  processHasQuestionnaireForGamer,
  processUserEndStatus,
  processUserNewStatus,
  generatePayload: processNewPayload
};

function processNoQuestionnaireForGamer(questionnaire = {}) {
  return payload => {
    const { gamer = {} } = payload;
    if (!questionnaire) {
      return Object.assign(payload, {
        message: null,
        gamer: Object.assign(gamer, {
          status: FINISH_STATUS
        })
      });
    }
    return payload;
  };
}

function processHasQuestionnaireForGamer(questionnaire = { options: [] }) {
  return payload => {
    const { gamer = { answers: [] }, message = {} } = payload;
    if (questionnaire) {
      return Object.assign({}, payload, {
        gamer: Object.assign(gamer, {
          status: WITH_QUESTIONS_STATUS,
          answers: gamer.answers.concat(makeGamerAnswer(questionnaire))
        }),
        message: {
          id: gamer.telegramId,
          msg: questionnaire.title,
          replies: questionnaire.options.map(v => ({
            id: questionnaire._id,
            value: v
          }))
        }
      });
    }
    return payload;
  };
}

function processUserEndStatus({ user = {}, payload = {} }) {
  if (user.status === "end") {
    return Object.assign({
      user: Object.assign({}, user, { status: "end" }),
      payload: Object.assign({}, payload, {
        id: user.telegramId,
        msg:
          "Вы ответили на все вопросы, больше вопросы к вам не придут. Чтобы начать сначала, отправьте /clear"
      })
    });
  }
  return {
    user,
    payload
  };
}

function processUserNewStatus({ user = {}, payload = {} }) {
  if (user.status === "new") {
    return Object.assign({
      user,
      payload: Object.assign({}, payload, {
        id: user.telegramId,
        msg: "Нужен вопрос"
      })
    });
  }
  return {
    user,
    payload
  };
}

function processNewPayload(gamer) {
  return {
    gamer,
    message: {}
  };
}
