module.exports = (originalAnswer, userAnswer) => {
  if (originalAnswer.compareByValue) {
    return originalAnswer.value == userAnswer
  }
  if (originalAnswer.compareByExpression) {
    return originalAnswer.value === eval(userAnswer);
  }
};
