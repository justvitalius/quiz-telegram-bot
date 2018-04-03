const hash = require("object-hash");
const stdio = require("stdio");

const mongoose = require("mongoose");
const config = require("config");

const { save, find } = require("../database/dao/index");
const Question = require("../database/models/question");

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
  const data = require(ops.filename);
  if (data && data.length) {
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
              `Will migrate ${data.length} questionnaires\n`
            );
          } else {
            console.log(
              `Database already contains ${results.length} questions.`
            );
            !ops.force &&
              console.log("To erase exists questions use --force run mode\n");
          }

          Promise.all(
            data.map(item => {
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
              console.log("Done.\n");
              mongoose.disconnect();
            })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
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
