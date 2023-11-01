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
    image: [imageSchema],
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
        for (let img of doc.images) {
            await cloudinary.uploader.destroy(img.fileName);
        }
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
