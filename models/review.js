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
});

module.exports = mongoose.model("Review", reviewSchema);
