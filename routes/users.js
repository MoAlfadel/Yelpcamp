const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const catchAsync = require("../utils/CatchAsync.js");
const passport = require("passport");
const users = require("../controllers/users");

router
    .route("/register")
    .get(users.renderRegisterForm)
    .post(users.registerUser);

router
    .route("/login")
    .get(users.renderLoginForm)
    .post(
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        users.loginRedirect
    );

router.post("/logout", users.logout);

// make request to google
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// redirect from google to this
router.get(
    "/google/redirect",
    // fire googleStreaty callback func
    passport.authenticate("google", {
        failureRedirect: "/register",
        failureFlash: true,
    }),
    // then fire the bottom middleware
    users.loginRedirect
);

module.exports = router;
