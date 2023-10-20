const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

const googleUserSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    profileID: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
});
userSchema.plugin(passportLocalMongoose);

module.exports.User = mongoose.model("User", userSchema);
module.exports.GoogleUser = mongoose.model("googleUser", googleUserSchema);
