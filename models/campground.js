const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

const campgroundSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "accountType",
    },
    accountType: {
        type: String,
        required: true,
        enum: ["User", "googleUser"],
    },
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews },
        });
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
