const express = require("express");
const router = express.Router();

const Campground = require("../models/campground");

const catchAsync = require("../utils/CatchAsync.js");
const Campgrounds = require("../controllers/campgrounds");
const {
    isLogin,
    isCampgroundAuthor,
    validateCampground,
} = require("../middleware");

router
    .route("/")
    .get(Campgrounds.indexPage)
    .post(isLogin, validateCampground, Campgrounds.createCampground);

router.get("/new", isLogin, Campgrounds.renderNewForm);

router
    .route("/:id")
    .get(Campgrounds.showCampground)
    .put(
        isLogin,
        isCampgroundAuthor,
        validateCampground,
        Campgrounds.updateCampground
    )
    .delete(isLogin, isCampgroundAuthor, Campgrounds.deleteCampground);

router.get(
    "/:id/edit",
    isLogin,
    isCampgroundAuthor,
    Campgrounds.renderEditForm
);

module.exports = router;
