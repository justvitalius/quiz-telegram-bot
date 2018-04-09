const faker = require("faker");

module.exports = {
  gamer: opts =>
    Object.assign(
      {
        chatId: faker.random.uuid(),
        id: faker.random.uuid(),
        username: faker.internet.userName(),
        answers: [],
        status: "new"
      },
      opts
    )
};
