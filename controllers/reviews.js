const Review = require("../models/review");
const Campground = require("../models/campground");
const catchAsync = require("../utils/CatchAsync.js");
const User = require("../models/user");

module.exports.createReview = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review({
        ...req.body.review,
        author: req.user.id,
        accountType: req.session.accountType,
    });
    campground.reviews.push(review);
    await review.save();
    // -------------------------

    campground.rating = await campground.updateRating();
    // -----------------------------------
    await campground.save();
    req.flash("success", "Created New Review !");
    res.redirect(`/campgrounds/${campground.id}`);
});

module.exports.deleteReview = catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        {
            $pull: { reviews: reviewId },
        },
        { new: true }
    );
    await Review.findByIdAndDelete(reviewId);
    campground.rating = await campground.updateRating();
    await campground.save();
    req.flash("success", "Successfully Deleted Review !");
    res.redirect(`/campgrounds/${id}/`);
});
