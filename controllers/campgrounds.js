const Campground = require("../models/campground");
const catchAsync = require("../utils/CatchAsync");
const { cloudinary } = require("../cloudinary/index");
const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
module.exports.indexPage = catchAsync(async (req, res, next) => {
    const { q, page = 0 } = req.query;
    const pageLimitNumber = 5;
    let searchQueries = {};

    if (q) {
        searchQueries.title = { $regex: q, $options: "i" };
    }

    const lastPageNumber = Math.ceil(
        (await Campground.find(searchQueries)).length / pageLimitNumber - 1
    );
    if (page > lastPageNumber) {
        req.flash("error", "No search Result found ");
        res.redirect("/campgrounds");
    }
    const campgrounds = await Campground.find(searchQueries)
        .skip(page * pageLimitNumber)
        .limit(pageLimitNumber);
    return res.render("campgrounds/index.ejs", {
        campgrounds,
        title: "All Campgrounds",
        q,
        lastPageNumber,
        page,
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
    req.flash("success", "successfully made a New Campground");
    res.redirect(`/campgrounds/${campground.id}`);
});

module.exports.showCampground = catchAsync(async (req, res) => {
    let campground = await Campground.findById(req.params.id)
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

module.exports.findCampground = catchAsync(async (req, res) => {
    const { location, price, rating, page = 0 } = req.query;
    let searchQueries = {};
    const pageLimitNumber = 5;
    if (location) {
        searchQueries.location = { $regex: location, $options: "i" };
    }
    if (rating) {
        searchQueries.rating = { $gte: +rating };
    }
    if (price) {
        searchQueries.price = { $lte: +price };
    }

    let campgrounds;
    let lastPageNumber = 0;
    // If here is search request
    if (Object.keys(searchQueries).length > 0) {
        campgrounds = await Campground.find(searchQueries)
            .skip(page * pageLimitNumber)
            .limit(pageLimitNumber);
        // find the last  page  number
        lastPageNumber = Math.ceil(
            (await Campground.find(searchQueries)).length / pageLimitNumber - 1
        );
    }
    // IF Not found a results for search || or user enter page number > last page number
    if (page > lastPageNumber) {
        req.flash("error", "No search results found");
    }
    res.render("campgrounds/find", {
        campgrounds,
        price,
        location,
        rating,
        page,
        lastPageNumber,
        title: "Find Campgrounds",
    });
});

module.exports.likeCampground = catchAsync(async (req, res) => {
    let { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    } else if (req.user.likedCampgrounds.includes(id)) {
        req.flash("error", "Already liked this campground !");
        return res.redirect(`/campgrounds/${id}`);
    }
    req.user.likedCampgrounds.push(campground);
    await req.user.save();
    res.redirect(`/campgrounds/${id}`);
});
module.exports.dislikeCampground = catchAsync(async (req, res) => {
    let { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    } else if (!req.user.likedCampgrounds.includes(id)) {
        req.flash("error", "You don't liked this campground !");
        return res.redirect(`/campgrounds/${id}`);
    }
    const campIndex = req.user.likedCampgrounds.indexOf(id);
    req.user.likedCampgrounds.splice(campIndex, 1);
    await req.user.save();
    res.redirect(`/campgrounds/${id}`);
});
module.exports.likedCampgrounds = catchAsync(async (req, res, next) => {
    const { page = 0 } = req.query;
    const pageLimitNumber = 5;
    let campgrounds;
    const queryObject = {
        _id: { $in: req.user.likedCampgrounds },
    };
    let lastPageNumber = 0;
    // if there is liked campgrounds
    if (req.user.likedCampgrounds.length) {
        campgrounds = await Campground.find(queryObject)
            .skip(page * pageLimitNumber)
            .limit(pageLimitNumber);
        lastPageNumber = Math.ceil(
            req.user.likedCampgrounds.length / pageLimitNumber - 1
        );
    } // if there is not liked campgrounds the the be below if is not return true (lastPage = 0 )

    // if user enter page not found
    if (page > lastPageNumber) {
        req.flash("error", "No search Result  ");
        return res.redirect("/campgrounds");
    }

    // render when found liked campgrounds or not found (put  page < lastPageNumber )
    res.render("campgrounds/liked", {
        campgrounds,
        page,
        lastPageNumber,
        title: "liked campgrounds",
    });
});
