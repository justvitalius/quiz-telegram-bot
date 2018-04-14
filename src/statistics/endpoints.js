const { getAllUsers } = require("../database");

const gamers = [
  {
    id: "97864475",
    username: "w3dip",
    fio: "Pavlov Ivan",
    answers: [
      {
        questionnaireId: "5ab81aaef8aa67599366465a",
        isCorrect: true,
        category: "javascript",
        answeredAt: "2018-01-03"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465b",
        isCorrect: false,
        category: "javascript",
        answeredAt: "2018-01-03"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465c",
        isCorrect: true,
        category: "javascript",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465d",
        isCorrect: true,
        category: "nodejs",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465e",
        isCorrect: false,
        category: "nodejs",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465f",
        isCorrect: false,
        category: "nodejs",
        answeredAt: "2018-01-04"
      }
    ]
  },
  {
    id: "97864478",
    username: "w3dip2",
    fio: "Legkov Artem",
    answers: [
      {
        questionnaireId: "5ab81aaef8aa67599366465a",
        isCorrect: false,
        category: "javascript",
        answeredAt: "2018-01-03"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465b",
        isCorrect: false,
        category: "javascript",
        answeredAt: "2018-01-03"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465c",
        isCorrect: false,
        category: "javascript",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465d",
        isCorrect: true,
        category: "nodejs",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465e",
        isCorrect: true,
        category: "nodejs",
        answeredAt: "2018-01-04"
      },
      {
        questionnaireId: "5ab81aaef8aa67599366465f",
        isCorrect: false,
        category: "nodejs",
        answeredAt: "2018-01-04"
      }
    ]
  }
];

const categories = [
  {
    title: "javascript",
    numberOfNeedAnswers: 100
  }
];

module.exports = function(app) {
  app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  //TODO implement
  app.route("/categories").get((req, res) => {
    res.send(categories);
  });

  //TODO implement
  app.route("/gamers").get((req, res) => {
    //getAllUsers().then(users => res.send(users));
    res.send(gamers);
  });
};
