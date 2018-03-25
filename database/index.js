const mongoose = require("mongoose");
const CONN = "mongodb://localhost/";
const DB_NAME = "quiz_db";

const Question = require("./models/question");

const { save, readAll } = require("./dao");

const questionnaires = require("./questionaries");

function connect() {
  mongoose.connect(`${CONN}${DB_NAME}`, function(err) {
    if (err) throw err;
    console.log("Successfully connected");
    readAll(Question, null, function(results) {
      if (!results || !results.length) {
        console.log("Database is empty. Insert data in database...");
        init();
        console.log("Database initialization compeleted");
      } else {
        console.log("Database contains questions");
        return results;
      }
    });
  });
}

function init() {
  questionnaires.map(questionnaire => {
    save(new Question(questionnaire));
  });
}

function getAllQuestionnaires(callback) {
  return readAll(Question, null, callback);
}

module.exports = {
  connect,
  getAllQuestionnaires
};
