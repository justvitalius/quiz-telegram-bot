module.exports = {
  renderQuestion,
  generateOpts,
  renderHelp
};

function renderQuestion(question) {
  return `
<pre>${question}</pre>\n
  `;
}

function generateOpts({ replies }) {
  if (replies && replies.length) {
    return optsWithReplyKeyboard(replies);
  }
  return simpleOpts();
}

function simpleOpts() {
  return {
    parse_mode: "HTML"
  };
}

function optsWithReplyKeyboard(replies) {
  const keyboard = replies.map((reply, i) => [
    { text: reply.value, callback_data: `${reply.id}--${i + 1}` }
  ]);
  return {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

function renderHelp() {
  return `
<b>Справка</b>

Добро пожаловать в telegram опросник от Сбербанк Технологии.

Бот будет присылать вопросы по фронтенду и смежным javascript технологиям. Ваша задача - выбрать один правильный вариант ответа. Любое написанное боту сообщение игнорируется (кроме команд ниже).

Более подробную информацию о призах и правилах проведения можно узнать у hr на стойке Сбербанк Технологии.

<b>Команды бота:</b>
/start - принять участие в анкетировании
/help - справка
/clear - начать тестирование заново (сбросит все ответы) 
  `;
}
