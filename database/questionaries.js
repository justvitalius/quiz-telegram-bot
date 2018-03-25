module.exports = [
  {
    id: 1,
    question: "Каких операторов из этого списка нет в javascript?",
    type: 0,
    options: ["*", "^", "%", "#", "&", ">>", ">>>", "!"],
    answer: {
      compareByValue: true,
      value: "#"
    }
  },
  {
    id: 2,
    question: `
Что выведет этот код?
let a = (1,5 - 1) * 2;
alert(a);
    `,
    type: 0,
    options: ["0.9999999", "1", "0.5", "8", "-0.5", "4"],
    answer: {
      compareByIndex: true,
      value: 3
    }
  },
  {
    id: 3,
    question: "Чему равна сумма [] + 1 + 2?",
    type: 0,
    options: ["1", "NaN", "undefined", "12", "Другое"],
    answer: {
      compareByExpression: true,
      value: "12"
    }
  }
];
