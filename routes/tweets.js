var express = require("express");
var router = express.Router();
const Tweet = require("../models/tweet");
const User = require("../models/users");

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
  const hashtagToSearch = req.body.hashtag;
  let result = [];
  Tweet.find({})
    .populate("user")
    .then((data) => {
      for (let article of data) {
        if (article.message.includes(hashtagToSearch)) {
          result.push(article);
        }
      }
      res.json({ result: result });
    });
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
  tweet.like.push(user._id);
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

// OBTENIR TOUT LES HASHTAGS

router.get("/hashtags", (req, res) => {
  Tweet.find({}).then((data) => {
    let messagesTab = [];
    let hashtagsUsed = [];
    let result = [];
    // Récupère tout les messages des tweets et les met dans un tableau
    for (let tweet of data) {
      messagesTab.push(tweet.message);
    }
    // Boucle sur chaque message pour rechercher les hashtags à l'intérieur
    for (let message of messagesTab) {
      // Pour chaque hashtags trouvé, les mets dans un tableau hashtags
      let hashtags = message.match(/#\w+/g);
      // Ajouter tous les hashtags utilisés dans un tableau hashtagsUsed en gérant les doublons
      if (hashtags) {
        for (let hashtag of hashtags) {
          if (!hashtagsUsed.includes(hashtag)) {
            hashtagsUsed.push(hashtag);
          }
        }
      }
    }
    // Pour chaque hashtag recherché combien de tweet l'ont utilisé
    for (let hashtag of hashtagsUsed) {
      for (let message of messagesTab) {
        if (message.includes(hashtag)) {
          let existingHashtag = result.find((obj) => obj.hashtag === hashtag);
          if (existingHashtag) {
            existingHashtag.count += 1;
          } else {
            result.push({ hashtag: hashtag, count: 1 });
          }
        }
      }
    }
    // Tri des hashtags selon leur nombre d'utilisation du plus petit au plus grand
    result = result.sort((a, b) => b.count - a.count);
    // Envoi des 5 premiers résultats
    result = result.slice(0, 5);
    res.json({ result: result });
  });
});

module.exports = router;
