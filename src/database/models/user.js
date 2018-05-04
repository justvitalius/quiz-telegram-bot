const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  id: String,
  username: String,
  fio: String,
  answers: [
    {
      questionnaireId: mongoose.Schema.Types.ObjectId,
      isCorrect: Boolean,
      value: String,
      answeredAt: Date,
      answered: Boolean
    }
  ],
  status: String
});

let User = mongoose.model("User", userSchema);

module.exports = User;
