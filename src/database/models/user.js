const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  id: String,
  username: String,
  fio: String,
  answers: [],
  status: String
});

let User = mongoose.model("User", userSchema);

module.exports = User;
