const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Category",
  new mongoose.Schema({
    title: String,
    numberOfRequiredAnswers: Number,
    hash: String
  })
);
