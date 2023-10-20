const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../models/review");
const Campground = require("../models/campground");
const { reviewSchema } = require("../schemas.js");
const catchAsync = require("../utils/CatchAsync.js");
const ExpressError = require("../utils/ExpressError.js");

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let msg = error.details.map((elt) => elt.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.post(
    "/",
    validateReview,
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await review.save();
        await campground.save();
        req.flash("success", "Created New Review !");
        res.redirect(`/campgrounds/${campground.id}`);
    })
);

router.delete(
    "/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        console.log("wooooork ");
        await Campground.findByIdAndUpdate(id, {
            $pull: { reviews: reviewId },
        });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Successfully Deleted Review !");
        res.redirect(`/campgrounds/${id}/`);
    })
);

module.exports = router;
