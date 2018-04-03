const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  category: String,
  options: [String],
  actived: Boolean,
  hash: String,
  answer: {
    compareByExpression: Boolean,
    value: String
  }
});

let Question = mongoose.model("Question", questionSchema);

module.exports = Question;
