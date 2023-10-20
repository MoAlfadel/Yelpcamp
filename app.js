const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { User, GoogleUser } = require("./models/user");
const cookieParser = require("cookie-parser");

const campgroundsRoutes = require("./routes/campgrounds.js");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const GoogleStrategy = require("passport-google-oauth20");
let accountType = null;
mongoose
    .connect("mongodb://127.0.0.1:27017/yelp-testing")
    .then(() => console.log(">>> Mongodb connection open !!! "))
    .catch((error) => {
        console.log(">>> MOngodb connection error !!! ");
        console.log(error);
    });
const keys = require("./keys");
// set the views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionConfig = {
    secret: keys.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
// using static files
app.use(express.static(path.join(__dirname, "public")));
// using form in post data
app.use(express.urlencoded({ extended: true }));
// using json object in post data
// use methods Override
app.use(methodOverride("_method"));

app.use(cookieParser());
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// ------------------------------------------------------------------------------------

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientId,
            clientSecret: keys.googleClientSecret,
            callbackURL: "/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                //find the user in our database
                let user = await GoogleUser.findOne({ profileID: profile.id });
                if (user) {
                    //If user present in our database.
                    console.log("find google Id in Db !!!!");
                    done(null, user);
                } else {
                    // if user is not preset in our database save user data to database.
                    //get the user data from google
                    const newUser = {
                        profileID: profile.id,
                        username: `${profile.name.givenName}_${profile.name.familyName}`,
                        email: profile.emails[0].value,
                    };
                    user = new GoogleUser(newUser);
                    await user.save();
                    done(null, user);
                }
            } catch (err) {
                console.error(err);
            }
        } // end googleStrategy callback
    )
);

// used to serialize the user for the session (google)
passport.serializeUser((user, done) => {
    if (user instanceof User) {
        accountType = "User";
        done("pass");
    } else {
        accountType = "googleUser";
        done(null, user.id);
    }
});

// used to deserialize the user
passport.deserializeUser((id, done) => {
    GoogleUser.findById(id)
        .then((user) => done(null, user))
        .catch((err) => done("pass"));
});

// use static serialize and deserialize of model for passport session support
// by local passport monogoose
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =----------------------------------------------------------------------------------------------------------------------------------------------------
app.use("/", (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    req.session.accountType = accountType;
    next();
});

app.use("/", usersRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
    res.render("home");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found ", 404));
});

app.use((err, req, res, next) => {
    // console.log(err);
    let { status = 500, message = "something went Wrong !! " } = err;
    res.status(status).send(message);
});
app.listen(3000, () => {
    console.log(">>> serving at port 8080 !!!");
});
