const faker = require("faker");
const User = require("../src/database/models/user");

module.exports = {
  gamer: generateGamer
};

function generateGamer(opts) {
  return new User(
    Object.assign(
      {
        telegramId: faker.random.uuid(),
        id: faker.random.uuid(),
        username: faker.internet.userName(),
        fio: faker.name.firstName(),
        name: "Игрок для тестов",
        answers: [],
        status: "new"
      },
      opts
    )
  );
}
