const mongoose = require("mongoose");

const tweetSchema = mongoose.Schema({});

const Tweet = mongoose.model("tweets", tweetSchema);

module.exports = Tweet;
