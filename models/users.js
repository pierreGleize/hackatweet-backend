const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    firstName: String,
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
