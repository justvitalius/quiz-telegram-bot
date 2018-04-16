module.exports = {
  renderQuestion
};

function renderQuestion({ question, options = [] }) {
  //Прибавляем единицу к номеру варианта ответа, чтобы нумерация была с 1
  return `
<pre>${question}</pre>\n
${options.map((item, i) => renderOption(item, i + 1)).join("\n")}
  `;
}

function renderOption(item, i) {
  return `<b>${i} </b><code>${item}</code>`;
}
