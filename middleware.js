const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLogin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        res.cookie("returnTo", req.originalUrl);
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};
module.exports.isCampgroundAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash("error", "You have not Permission To do that  ! ");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        let msg = error.details.map((elt) => elt.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user.id)) {
        req.flash("error", "You have not Permission To do that  ! ");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        let msg = error.details.map((elt) => elt.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
