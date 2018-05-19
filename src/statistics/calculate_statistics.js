const mongoose = require("mongoose");
const mathjs = require("mathjs");
const { connect, getAllUsers } = require("../database/index");

connect().then(() => {
  const categoriesCorrect = new Map();

  const correctAnswersMap1 = new Map();
  const answeredCountMap1 = new Map();

  const correctAnswersMap2 = new Map();
  const answeredCountMap2 = new Map();

  const correctAnswersMapAll = new Map();
  const answeredCountMapAll = new Map();

  categoriesCorrect.set("javascript", []);
  categoriesCorrect.set("сss", []);
  categoriesCorrect.set("reactjs", []);
  categoriesCorrect.set("vuejs", []);
  categoriesCorrect.set("javascript+", []);
  categoriesCorrect.set("nodejs", []);
  categoriesCorrect.set("reactjs+", []);
  categoriesCorrect.set("all", []);

  const collectCorrectforUserByCategory = answers => category =>
    categoriesCorrect.set(
      category,
      categoriesCorrect
        .get(category)
        .concat(
          answers.filter(a => a.category === category).filter(a => a.isCorrect)
            .length
        )
    );

  const collectMaps = (correctAnswersMap, answeredCountMap) => answers => {
    const correctsCount = answers.filter(a => a.isCorrect).length;
    const answeredCount = answers.length;

    correctAnswersMap.set(
      correctsCount,
      (correctAnswersMap.get(correctsCount) || 0) + 1
    );
    answeredCountMap.set(
      answeredCount,
      (answeredCountMap.get(answeredCount) || 0) + 1
    );

    return {
      correctAnswersMap,
      answeredCountMap
    };
  };

  getAllUsers()
    .then(users => {
      console.log(`Collect fot ${users.length} users`);

      const calculateDay1 = collectMaps(correctAnswersMap1, answeredCountMap1);
      const calculateDay2 = collectMaps(correctAnswersMap2, answeredCountMap2);
      const calculateDayAll = collectMaps(
        correctAnswersMapAll,
        answeredCountMapAll
      );

      console.log("Users data");
      console.log(
        "name, username, javascript%, css%, reactjs%, vuejs%, javascript+%, nodejs%, reactjs+%, all, all correct"
      );

      users.forEach(user => {
        console.log(
          user.fio || "-",
          ",",
          user.username || "-",
          ",",
          user.answers
            .filter(a => a.category === "javascript")
            .filter(a => a.isCorrect).length / 10,
          ",",
          user.answers
            .filter(a => a.category === "сss")
            .filter(a => a.isCorrect).length / 5,
          ",",
          user.answers
            .filter(a => a.category === "reactjs")
            .filter(a => a.isCorrect).length / 5,
          ",",
          user.answers
            .filter(a => a.category === "vuejs")
            .filter(a => a.isCorrect).length / 5,
          ",",
          user.answers
            .filter(a => a.category === "javascript+")
            .filter(a => a.isCorrect).length / 6,
          ",",
          user.answers
            .filter(a => a.category === "nodejs")
            .filter(a => a.isCorrect).length / 5,
          ",",
          user.answers
            .filter(a => a.category === "reactjs+")
            .filter(a => a.isCorrect).length / 4,
          ",",
          user.answers.length,
          ",",
          user.answers.filter(a => a.isCorrect).length
        );

        calculateDay1(
          user.answers.filter(a =>
            ["javascript", "vuejs", "сss", "reactjs"].includes(a.category)
          )
        );
        calculateDay2(
          user.answers.filter(a =>
            ["javascript+", "nodejs", "reactjs+"].includes(a.category)
          )
        );
        calculateDayAll(user.answers);

        const collect = collectCorrectforUserByCategory(user.answers);
        collect("javascript");
        collect("сss");
        collect("reactjs");
        collect("vuejs");
        collect("javascript+");
        collect("nodejs");
        collect("reactjs+");

        categoriesCorrect.set(
          "all",
          categoriesCorrect
            .get("all")
            .concat(user.answers.filter(a => a.isCorrect).length)
        );
      });

      return {
        correctAnswersMap1,
        answeredCountMap1,
        correctAnswersMap2,
        answeredCountMap2,
        correctAnswersMapAll,
        answeredCountMapAll
      };
    })
    .then(({ correctAnswersMap1, answeredCountMap1 }) => {
      console.log("Day 1");
      console.log("Bar chart by correct answers");
      correctAnswersMap1.forEach((v, k) => console.log(`${k},${v}`));

      console.log("-----");
      console.log("Bar chart by all answers");
      answeredCountMap1.forEach((v, k) => console.log(`${k},${v}`));
      console.log("================================================");

      console.log("Day 2");
      console.log("Bar chart by correct answers");
      correctAnswersMap2.forEach((v, k) => console.log(`${k},${v}`));

      console.log("-----");
      console.log("Bar chart by all answers");
      answeredCountMap2.forEach((v, k) => console.log(`${k},${v}`));
      console.log("================================================");

      console.log("All days");
      console.log("Bar chart by correct answers");
      correctAnswersMapAll.forEach((v, k) => console.log(`${k},${v}`));

      console.log("-----");
      console.log("Bar chart by all answers");
      answeredCountMapAll.forEach((v, k) => console.log(`${k},${v}`));
      console.log("================================================");

      console.log("-----");
      console.log("Median by Categories");
      console.log(
        `javascript, ${mathjs.median(categoriesCorrect.get("javascript"))}`
      );
      console.log(
        `reactjs, ${mathjs.median(categoriesCorrect.get("reactjs"))}`
      );
      console.log(`css, ${mathjs.median(categoriesCorrect.get("сss"))}`);
      console.log(`vuejs, ${mathjs.median(categoriesCorrect.get("vuejs"))}`);
      console.log(
        `javascript+, ${mathjs.median(categoriesCorrect.get("javascript+"))}`
      );
      console.log(`nodejs, ${mathjs.median(categoriesCorrect.get("nodejs"))}`);
      console.log(
        `reactjs+, ${mathjs.median(categoriesCorrect.get("reactjs+"))}`
      );
      console.log(`all, ${mathjs.median(categoriesCorrect.get("all"))}`);
    })
    .then(_ => mongoose.disconnect())
    .catch(err => {
      console.log(err);
      mongoose.disconnect();
    });
});
