module.exports = msg => {
  return {
    telegramId: msg.chat.id,
    userId: msg.from.id,
    username: msg.from.username,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name
  };
};
