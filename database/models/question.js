const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  id: Number,
  question: String,
  type: Number,
  options: [String],
  answer: {
    compareByValue: Boolean,
    value: String
  }
});

let Question = mongoose.model("Question", questionSchema);

module.exports = Question;
