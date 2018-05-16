const MAX_BUTTON_TEXT_SIZE = 33;
module.exports = {
  renderQuestion,
  generateOpts,
  renderHelp,
  generateMessage,
  MAX_BUTTON_TEXT_SIZE
};

function renderQuestion(question) {
  const result = question.replace(/</gm, "&lt;").replace(/>/, "&gt;");
  return `<code>${result}</code>`;
}

function renderMessage(question) {
  return question;
}

function renderQuestionWithAnswers(question, answers) {
  const renderedAnswers = answers
    .map(item => item.replace(/</gm, "&lt;").replace(/>/, "&gt;"))
    .map((item, i) => `<b>(${i + 1})</b>   ${item}`)
    .join("\n");
  return `${renderQuestion(question)}  
${renderedAnswers}
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
    parse_mode: "html"
  };
}

function optsWithReplyKeyboard(replies) {
  const keyboard = replies.map((reply, i) => [
    { text: reply.value, callback_data: `${reply.id}--${i + 1}` }
  ]);
  return {
    parse_mode: "html",
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

function generateMessage({ id, msg, replies = [] }) {
  let question;
  let repliesForKeyboard;

  const needsAnswerInQuestion = !replies.reduce(
    (result, item) => result && item.value.length <= MAX_BUTTON_TEXT_SIZE,
    true
  );

  if (!replies || !replies.length) {
    return {
      id,
      msg: renderMessage(msg)
    };
  }

  if (needsAnswerInQuestion) {
    repliesForKeyboard = replies.map((item, i) => ({
      id: item.id,
      value: `(${(i + 1).toString()})`
    }));
    question = renderQuestionWithAnswers(
      msg,
      replies.map(i => i.value.toString())
    );
  } else {
    repliesForKeyboard = replies;
    question = renderQuestion(msg);
  }

  return {
    id,
    msg: question,
    opts: generateOpts({ replies: repliesForKeyboard })
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
