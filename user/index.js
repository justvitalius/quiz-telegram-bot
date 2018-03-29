module.exports = {
  generateUser,
  setNextStatus
};

const statuses = ["new", "with-question", "wait-question", "end"];

function generateUser(options = {}) {
  return Object.assign(
    {
      answers: [],
      status: statuses[0]
    },
    options
  );
}

function setNextStatus(userProfile = {}) {
  switch (userProfile.status) {
    case statuses[0]:
      userProfile.status = statuses[1];
      break;
    case statuses[1]:
      userProfile.status = statuses[2];
      break;
    case statuses[2]:
      userProfile.status = statuses[1];
      break;
    case statuses[3]:
      userProfile.status = statuses[2];
      break;
    default:
      userProfile.status = statuses[2];
  }
}
