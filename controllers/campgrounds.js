const Campground = require("../models/campground");
const catchAsync = require("../utils/CatchAsync");
const { cloudinary } = require("../cloudinary/index");
const User = require("../models/user");
module.exports.indexPage = catchAsync(async (req, res, next) => {
    const { q } = req.query;
    let campgrounds;
    if (q) {
        campgrounds = await Campground.find({
            title: { $regex: q, $options: "i" },
        });
    } else if (!q) {
        campgrounds = await Campground.find({});
    }
    return res.render("campgrounds/index.ejs", {
        campgrounds,
        title: "All Campgrounds",
        q,
    });
});

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new", { title: "New Campground" });
};

module.exports.createCampground = catchAsync(async (req, res, next) => {
    console.log(req.session.accountType);
    let campground = new Campground({
        ...req.body.campground,
        accountType: req.session.accountType,
    });
    campground.image = req.files.map((file) => ({
        url: file.path,
        fileName: file.filename,
    }));
    campground.author = req.user.id;
    await campground.save();
    // console.log(campground);
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
    if (req.files) {
        const imgs = req.files.map((file) => ({
            url: file.path,
            fileName: file.filename,
        }));
        campground.image.push(...imgs);
        await campground.save();
    }
    if (req.body.deletedImages) {
        for (let filename of req.body.deletedImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({
            $pull: { image: { fileName: { $in: req.body.deletedImages } } },
        });
    }
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
