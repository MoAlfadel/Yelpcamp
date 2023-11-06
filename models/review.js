const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        required: true,
    },
    accountType: {
        type: String,
        enum: ["User", "googleUser"],
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        refPath: "accountType",
        required: true,
    },
    rating: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("Review", reviewSchema);
