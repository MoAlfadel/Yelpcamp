const { User } = require("../models/user");
module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register", { title: "register" });
};
module.exports.registerUser = catchAsync(async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(e);
            req.flash("success", "Welcome to Yelp Camp");
            res.redirect("/campgrounds");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/register");
    }
});
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login", { title: "login" });
};
module.exports.loginRedirect = (req, res) => {
    const redirectUrl = req.cookies.returnTo || "/campgrounds";
    res.clearCookie("returnTo");
    req.flash("success", `Welcome Back ${req.user.username}!`);
    res.redirect(redirectUrl);
};
module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            req.flash("success", err.message);
            return res.redirect("/campgrounds");
        }
        req.flash("success", "goodBye!");
        res.redirect("/campgrounds");
    });
};
