const express = require("express");
const router = express.Router();

const Campground = require("../models/campground");

const catchAsync = require("../utils/CatchAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { campgroundSchema } = require("../schemas.js");
const { isLogin, isAuthor } = require("../middleware");

let validateCampground = (req, res, next) => {
    let { error } = campgroundSchema.validate(req.body);
    if (error) {
        let msg = error.details.map((elt) => elt.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

router.get(
    "/",
    catchAsync(async (req, res, next) => {
        let campgrounds = await Campground.find({});
        req.session.msg = "from all";
        return res.render("campgrounds/index.ejs", {
            campgrounds,
            title: "All Campgrounds",
        });
    })
);

router.get("/new", isLogin, (req, res) => {
    res.render("campgrounds/new", { title: "New Campground" });
});

router.post(
    "/",
    isLogin,
    validateCampground,
    catchAsync(async (req, res, next) => {
        let campground = new Campground({
            ...req.body.campground,
            accountType: req.session.accountType,
        });
        campground.author = req.user.id;
        await campground.save();
        req.flash("success", "successfully made a New Campground");
        res.redirect(`/campgrounds/${campground.id}`);
    })
);

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        let { id } = req.params;
        let campground = await Campground.findById(id)
            .populate("reviews")
            .populate("author");
        if (!campground) {
            req.flash("error", "can not find that campground");
            res.redirect("/campgrounds");
        } else {
            console.log("inside sohow /:id => ", req.session.msg);
            res.render("campgrounds/show", {
                campground,
                title: campground.title,
            });
        }
    })
);

router.get(
    "/:id/edit",
    isLogin,
    isAuthor,
    catchAsync(async (req, res) => {
        let { id } = req.params;
        let campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "can not find that campground");
            res.redirect("/campgrounds");
        }
        res.render("campgrounds/edit", {
            campground,
            title: "Edit campground",
        });
    })
);

router.put(
    "/:id",
    isLogin,
    isAuthor,
    validateCampground,
    catchAsync(async (req, res) => {
        let { id } = req.params;
        let campground = await Campground.findByIdAndUpdate(
            id,
            {
                ...req.body.campground,
            },
            { new: true, runValidators: true }
        );

        req.flash("success", "successfully updated Campground");
        res.redirect(`/campgrounds/${campground.id}`);
    })
);

router.delete(
    "/:id",
    isLogin,
    isAuthor,
    catchAsync(async (req, res) => {
        let { id } = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash("success", "successfully Deleted Campground");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
