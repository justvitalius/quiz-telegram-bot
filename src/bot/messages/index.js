module.exports = {
  renderQuestion,
  generateOpts
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
