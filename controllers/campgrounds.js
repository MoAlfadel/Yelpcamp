const Campground = require("../models/campground");
const catchAsync = require("../utils/CatchAsync");
module.exports.indexPage = catchAsync(async (req, res, next) => {
    let campgrounds = await Campground.find({});

    return res.render("campgrounds/index.ejs", {
        campgrounds,
        title: "All Campgrounds",
    });
});

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new", { title: "New Campground" });
};

module.exports.createCampground = catchAsync(async (req, res, next) => {
    let campground = new Campground({
        ...req.body.campground,
        accountType: req.session.accountType,
    });
    campground.author = req.user.id;
    await campground.save();
    req.flash("success", "successfully made a New Campground");
    res.redirect(`/campgrounds/${campground.id}`);
});

module.exports.showCampground = catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, title: campground.title });
});

module.exports.updateCampground = catchAsync(async (req, res) => {
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
});
module.exports.deleteCampground = catchAsync(async (req, res) => {
    let { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "successfully Deleted Campground");
    res.redirect("/campgrounds");
});

module.exports.renderEditForm = catchAsync(async (req, res) => {
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
});
