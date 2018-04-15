const hash = require("object-hash");
const stdio = require("stdio");

const mongoose = require("mongoose");
const config = require("config");

const { save, find, remove } = require("../database/dao/index");
const Question = require("../database/models/question");
const Category = require("../database/models/category");
const {
  getAllCategories,
  createCategory,
  deleteCategory
} = require("../database");

const CONN = config.get("mongo.host");
const DB_NAME = config.get("mongo.dbName");

const ops = stdio.getopt({
  filename: {
    key: "f",
    args: 1,
    description: "Путь до импортируемого файла с вопросами"
  },
  force: {
    key: "--force",
    description: "Удаляет все документы в questions"
  }
});

console.log("Migrator started");

if (ops.filename) {
  const fileData = require(ops.filename);
  if (fileData && fileData.length) {
    console.log(`Found file ${ops.filename}`);
    mongoose.connect(`${CONN}${DB_NAME}`, () => {
      console.log(`Connected to ${CONN}${DB_NAME}`);

      if (ops.force) {
        console.log("\nActivated --force mode. Will remove all Questions");
        Question.remove({}, err => {
          if (err) {
            console.log(err);
          } else {
            console.log("Done.\n");
          }
        });
      }

      find(Question)
        .then(results => {
          if (!results || !results.length) {
            console.log(
              "Database is empty.",
              `Will migrate ${fileData.length} questionnaires\n`
            );
          } else {
            console.log(
              `Database already contains ${results.length} questions.`
            );
            !ops.force &&
              console.log("To erase exists questions use --force run mode\n");
          }

          Promise.all(
            fileData.map(item => {
              const q = new Question(prepareQuestionnaire(item));
              return find(Question, { hash: q.hash })
                .then(results => {
                  if (!results || !results.length) {
                    return save(q)
                      .then(_ => console.log(`${q.hash} imported`))
                      .catch(err => console.log(`${q.hash} ${err}`));
                  } else {
                    console.log(`${q.hash} already exists`);
                    return Promise.resolve();
                  }
                })
                .catch(err => console.log(`${q.hash} ${err}`));
            })
          )
            .then(_ => {
              const calcByCategory = countOfQuestionsByCategory(fileData);
              const categories = mapCategories(fileData);
              if (categories.length) {
                console.log(`Start migrate ${categories.length} categories.\n`);
                Category.remove().exec();
                return Promise.all(
                  categories.map(category =>
                    createCategory({
                      title: category,
                      numberOfRequiredAnswers: Math.floor(
                        calcByCategory(category) / 3
                      )
                    }).then(cat =>
                      console.log(`Category ${cat.title} imported`)
                    )
                  )
                ).catch(Promise.reject);
              }
            })
            .then(_ => console.log("\nDone."))
            .then(_ => mongoose.disconnect())
            .catch(Promise.reject);
        })
        .catch(console.log);
    });
  }
}

function prepareQuestionnaire(questionnaire) {
  const { q, a, c, v } = questionnaire;
  return {
    title: q,
    options: a,
    hash: hash(questionnaire),
    actived: true,
    category: c,
    answers: {
      value: v
    }
  };
}

function mapCategories(fileData = []) {
  return Array.from(
    fileData.reduce((set, q) => {
      set.add(q.c);
      return set;
    }, new Set())
  );
}

function countOfQuestionsByCategory(questionnaires) {
  return category => questionnaires.filter(q => q.c === category).length;
}
