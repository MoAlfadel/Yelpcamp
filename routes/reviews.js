const express = require("express");
const router = express.Router({ mergeParams: true });

const { isReviewAuthor, isLogin, validateReview } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLogin, validateReview, reviews.createReview);

router.delete("/:reviewId", isLogin, isReviewAuthor, reviews.deleteReview);

module.exports = router;
