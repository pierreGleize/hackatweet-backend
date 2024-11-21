const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    avatar: {
        type: String,
        default:'/userIcon.png',
    },
    token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
