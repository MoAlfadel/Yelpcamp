const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const catchAsync = require("../utils/CatchAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const passport = require("passport");
const { loginRedirect } = require("../middleware");

router.get("/register", (req, res) => {
    res.render("users/register", { title: "register" });
});
router.post(
    "/register",
    catchAsync(async (req, res) => {
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
    })
);

router.get("/login", (req, res) => {
    res.render("users/login", { title: "login" });
});
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }),
    (req, res) => {
        const redirectUrl = req.cookies.returnTo || "/campgrounds";
        res.clearCookie("returnTo");
        req.flash("success", `Welcome Back ${req.user.username}!`);
        res.redirect(redirectUrl);
    }
);

router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            req.flash("success", err.message);
            return res.redirect("/campgrounds");
        }
        req.flash("success", "goodBye!");
        res.redirect("/campgrounds");
    });
});

// make request to google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// redirect from google to this
router.get(
    "/google/redirect",
    // fire googleStrreaty callback func
    passport.authenticate("google", {
        failureRedirect: "/register",
        failureFlash: true,
    }),
    // then fire the bottom middleware
    (req, res) => {
        const redirectUrl = req.cookies.returnTo || "/campgrounds";
        res.clearCookie("returnTo");
        req.flash("success", `Welcome Back ${req.user.username}!`);
        res.redirect(redirectUrl);
    }
);

module.exports = router;
