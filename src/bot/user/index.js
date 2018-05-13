const NEW_STATUS = "new";
const WITH_QUESTIONS_STATUS = "with-question";
const WAIT_QUESTION_STATUS = "wait-question";
const FINISH_STATUS = "end";
const DEFAULT_GAMER_NAME = "js-ниндзя";

module.exports = {
  generateUser,
  setNextStatus,
  getNextStatus,
  filterWaitingUsers,
  clearUser,
  NEW_STATUS,
  WITH_QUESTIONS_STATUS,
  WAIT_QUESTION_STATUS,
  FINISH_STATUS,
  DEFAULT_GAMER_NAME
};

const statuses = [
  NEW_STATUS,
  WITH_QUESTIONS_STATUS,
  WAIT_QUESTION_STATUS,
  FINISH_STATUS
];

function generateUser(options = {}) {
  return Object.assign(
    {
      answers: [],
      status: statuses[0]
    },
    options
  );
}

function clearUser(user = {}) {
  return Object.assign(user, {
    answers: [],
    status: NEW_STATUS
  });
}

function setNextStatus(gamer = {}) {
  return Object.assign(gamer, {
    status: getNextStatus(gamer)
  });
}

function getNextStatus(gamer = {}) {
  switch (gamer.status) {
    case NEW_STATUS:
      return WAIT_QUESTION_STATUS;
    case WAIT_QUESTION_STATUS:
      return WITH_QUESTIONS_STATUS;
    case WITH_QUESTIONS_STATUS:
      return WAIT_QUESTION_STATUS;
    case FINISH_STATUS:
      return FINISH_STATUS;
    default:
      return WAIT_QUESTION_STATUS;
  }
}

function filterWaitingUsers(users = []) {
  return users.filter(user =>
    [WAIT_QUESTION_STATUS, NEW_STATUS].includes(user.status)
  );
}
