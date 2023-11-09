const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const { cloudinary } = require("../cloudinary/index");

const imageSchema = new Schema({
    url: String,
    fileName: String,
});

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});
const campgroundSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: [imageSchema],
    location: {
        type: String,
        required: true,
        trim: true,
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
    rating: {
        type: Number,
        default: 0,
    },
    likesNumber: {
        type: Number,
        min: 0,
        default: 0,
    },
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
    if (doc) {
        await Review.deleteMany({
            _id: { $in: doc.reviews },
        });
        if (doc.image.length > 0)
            for (let img of doc.image) {
                await cloudinary.uploader.destroy(img.fileName);
            }
    }
});

campgroundSchema.methods.updateRating = async function () {
    let campgroundReviews = await Review.find({
        _id: { $in: this.reviews },
    });
    const totalRating = campgroundReviews.reduce((sum, currentReview) => {
        return sum + currentReview.rating;
    }, 0);
    return +(totalRating / this.reviews.length).toFixed(1) || 0;
};

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
