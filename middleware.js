const Campground = require("./models/campground");

module.exports.islogin = (req, res, next) => {
    console.log("inside IsLogin=> ", req.session.msg);
    if (!req.isAuthenticated()) {
        res.cookie("returnTo", req.originalUrl);
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
};
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user.id)) {
        req.flash("error", "You have not Permission To do that  ! ");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
