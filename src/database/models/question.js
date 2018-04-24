const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: String,
  category: String,
  options: [String],
  actived: Boolean,
  hash: String,
  answer: {
    value: Number
  }
});

let Question = mongoose.model("Question", questionSchema);

module.exports = Question;
