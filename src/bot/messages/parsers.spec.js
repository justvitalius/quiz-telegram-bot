const { parseMsg } = require("./parsers");

describe("parseMsg()", () => {
  describe("Игрок не имеет username в своем телеграмм профиле", () => {
    const msg = {
      message_id: 93,
      from: {
        id: 111111111,
        is_bot: false,
        first_name: "Gleb",
        last_name: "Sa",
        language_code: "ru-RU"
      },
      chat: {
        id: 111111111,
        first_name: "Gleb",
        last_name: "Sa",
        type: "private"
      }
    };
    it("Возвращает fio", () =>
      expect(parseMsg(msg).fio).toEqual(
        `${msg.from.first_name} ${msg.from.last_name}`
      ));
    it("Возвращает name из ФИО, по которому можно обращаться", () =>
      expect(parseMsg(msg).name).toEqual(
        `${msg.from.first_name} ${msg.from.last_name}`
      ));
    it("Возвращает пустой username", () =>
      expect(parseMsg(msg).username).toEqual(""));
  });

  describe("Игрок содержит username и ФИО в своем телеграмм профиле", () => {
    const msg = {
      message_id: 93,
      from: {
        id: 1111111,
        is_bot: false,
        first_name: "Vitaly",
        last_name: "Mineev",
        username: "justvitalius",
        language_code: "ru-RU"
      },
      chat: {
        id: 1111111,
        first_name: "Vitaly",
        last_name: "Mineev",
        username: "justvitalius",
        type: "private"
      },
      date: 1525720281,
      text: "/clear",
      entities: [
        {
          offset: 0,
          length: 6,
          type: "bot_command"
        }
      ]
    };
    it("Возвращает fio", () =>
      expect(parseMsg(msg).fio).toEqual(
        `${msg.from.first_name} ${msg.from.last_name}`
      ));
    it("Возвращает name из ФИО, по которому можно обращаться", () =>
      expect(parseMsg(msg).name).toEqual(`${msg.from.username}`));
    it("Возвращает пустой username", () =>
      expect(parseMsg(msg).username).toEqual(`${msg.from.username}`));
  });

  describe("Игрок не содержит ни username ни ФИО в своем телеграмм профиле", () => {
    const msg = {
      message_id: 93,
      from: {
        id: 1111111,
        is_bot: false,
        language_code: "ru-RU"
      },
      chat: {
        id: 1111111,
        type: "private"
      },
      date: 1525720281,
      text: "/clear",
      entities: [
        {
          offset: 0,
          length: 6,
          type: "bot_command"
        }
      ]
    };
    it("Возвращает fio", () => expect(parseMsg(msg).fio).toEqual(""));
    it("Возвращает name из ФИО, по которому можно обращаться", () =>
      expect(parseMsg(msg).name).toEqual("js-ниндзя"));
    it("Возвращает пустой username", () =>
      expect(parseMsg(msg).username).toEqual(""));
  });
});
