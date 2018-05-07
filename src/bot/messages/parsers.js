const { DEFAULT_GAMER_NAME } = require("../user");

module.exports = {
  parseMsg
};

function parseMsg(msg) {
  const { chat: { id }, from: { first_name, last_name, username = "" } } = msg;
  const fio = [first_name, last_name].filter(n => !!n).join(" ");
  const name = username || fio || DEFAULT_GAMER_NAME;
  return {
    telegramId: id,
    userId: id,
    username,
    name,
    fio
  };
}
