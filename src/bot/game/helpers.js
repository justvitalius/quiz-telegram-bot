function countCorrectAnswers(answers) {
  return answers.reduce((total, answer = {}) => {
    return answer.isCorrect ? ++total : total;
  }, 0);
}

module.exports = {
  countCorrectAnswers
};
