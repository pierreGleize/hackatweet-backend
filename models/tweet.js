const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({
  message: String,
  date: Date,
  like: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
