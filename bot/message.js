module.exports = {
  renderQuestion
};

function renderQuestion({ question, options = [] }) {
  return `
<pre>${question}</pre>\n
${options.map((item, i) => renderOption(item, i)).join("\n")}
  `;
}

function renderOption(item, i) {
  return `<b>${i} </b><code>${item}</code>`;
}
