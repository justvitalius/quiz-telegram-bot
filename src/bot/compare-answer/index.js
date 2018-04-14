module.exports = (question, userAnswer) => {
  const { answer = {} } = question;
  const { value } = answer;
  return value == userAnswer;
};
