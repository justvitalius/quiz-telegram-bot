const mongoose = require("mongoose");
const CONN = "mongodb://localhost/";
const DB_NAME = "quiz_db";

const Question = require("./models/question");
const User = require("./models/user");

const { save, find, remove } = require("./dao");

const questionnaires = require("./questionaries");

function connect() {
  mongoose.connect(`${CONN}${DB_NAME}`, function(err) {
    if (err) throw err;
    console.log("Successfully connected");
    find(Question)
      .then(results => {
        if (!results || !results.length) {
          console.log("Database is empty. Insert data in database...");
          init();
          console.log("Database initialization compeleted");
        } else {
          console.log("Database contains questions");
        }
      })
      .catch(err => console.log(err));
  });
}

function init() {
  questionnaires.map(questionnaire => {
    save(new Question(questionnaire));
  });
}

function getAllQuestionnaires() {
  return find(Question);
}

function getUserById(id) {
  return find(User, { id });
}

function getAllUsers() {
  return find(User);
}

function createUser(user) {
  return save(new User(user));
}

function updateUser(user) {
  return save(user);
}

function deleteUser(id) {
  return remove(User, { id });
}

module.exports = {
  connect,
  getAllQuestionnaires,
  getAllUsers,
  deleteUser,
  updateUser,
  createUser,
  getUserById
};
