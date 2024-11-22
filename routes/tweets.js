var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweet");
const User = require("../models/users");

/* GET users listing. */

// POSTER UN TWEET
router.post("/postTweet", async (req, res) => {
  const { message, token } = req.body;
  if (!message || !token) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const user = await User.findOne({ token: token });
  //   const user = await User.findById(userId);

  if (!user) {
    res.json({ result: false, error: "User not found." });
    return;
  }
  const user_Id = user._id;
  const newTweet = new Tweet({
    message: message,
    date: new Date(),
    user: user_Id,
  });
  newTweet.save().then(() => {
    Tweet.findById(newTweet._id)
      .populate("user")
      .then((data) => {
        res.json({ result: true, newTweet: data });
      });
  });
});

// CHERCHER UN TWEET
router.post("/searchTweet", async (req, res) => {
  const { message, token } = req.body;

  if (!message || !token) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const user = await User.findOne({ token: token });
  if (!user) {
    res.json({ result: false, error: "User not found" });
    return;
  }
  const user_Id = user._id;

  const tweets = await Tweet.find({
    user: user_Id,
    message: message,
    // SI JE VEUX CHERCHER TOUS LES MESSAGES QUI CONTIENNENT LE MOT  DANS "MESSAGE"
    // message: { $regex: message, $options: "i" },
  });

  //   Si aucun tweet correspond à la recherche retourne []
  if (tweets.length === 0) {
    res.json({ result: false, error: "No tweets found." });
    return;
  }
  res.json({ result: true, tweets: tweets });
});

//SUPPRIMER UN TWEET
router.delete("/deleteTweet/:token/:tweetId", async (req, res) => {
  const { token, tweetId } = req.params;

  const user = await User.findOne({ token: token });
  if (!user) {
    res.json({ result: false, error: "User not found" });
    return;
  }
  const user_id = user._id;

  const tweetToDelete = await Tweet.deleteOne({ user: user_id, _id: tweetId });

  if (!tweetToDelete) {
    res.json({ result: "Fail", error: "Tweet not found" });
    return;
  } else {
    // const tweets = await Tweet.find();
    res.json({ result: "Success" });
  }
});

// LIKER UN TWEET

router.post("/likeTweet", async (req, res) => {
  const { token, tweetId } = req.body;
  if (!token || !tweetId) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    res.json({ result: false, error: "Tweet not found" });
    return;
  }
  const user = await User.findOne({ token: token });
  const user_id = user._id;

  if (tweet.like.includes(user_id)) {
    res.json({ result: false, error: "User already liked this tweet" });
    return;
  }
  // Ajouter l'utilisateur au tableau "like" du tweet
  tweet.like.push(user_id);
  tweet.save().then((tweet) => res.json({ result: true, tweet }));
});

router.post("/unlikeTweet", async (req, res) => {
  const { token, tweetId } = req.body;

  if (!token || !tweetId) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  const user = await User.findOne({ token: token });
  if (!user) {
    res.json({ result: false, error: "User not found" });
    return;
  }
  const user_id = user._id;
  //   const tweet = await Tweet.findOne({ _id: tweetId });
  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    res.json({ result: false, error: "Tweet not found" });
    return;
  }
  if (!tweet.like.includes(user_id)) {
    res.json({ result: false, error: "User has not liked this tweet" });
    return;
  }
  // Retirer l'utilisateur du tableau "like" du tweet
  //   tweet.like = tweet.like.filter((id) => id !== user_id);
  tweet.like = tweet.like.filter((id) => id.toString() !== user_id.toString());

  await tweet.save();
  res.json({ result: true, tweet });
});

//OBTENIN TOUS LES TWEETS
router.get("/", (req, res) => {
  Tweet.find()
    .populate("user")
    .then((tweets) => {
      res.json({ result: true, tweets });
    });
});

module.exports = router;
