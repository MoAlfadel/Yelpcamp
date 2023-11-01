const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const cookieParser = require("cookie-parser");

const campgroundsRoutes = require("./routes/campgrounds.js");
const reviewsRoutes = require("./routes/reviews");
const usersRoutes = require("./routes/users");
const GoogleStrategy = require("passport-google-oauth20");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo");

const { User, GoogleUser } = require("./models/user");

const app = express();
let accountType = null;
let dbUrl = process.env.DB_URL;
if (process.env.NODE_ENV !== "production") {
    dbUrl = "mongodb://127.0.0.1:27017/yelp-testing";
    require("dotenv").config();
}

const secret = process.env.sessionSecret || "thisShouldBeBetterSecret";
mongoose
    .connect(dbUrl)
    .then(() => console.log(">>> Mongodb connection open !!! "))
    .catch((error) => {
        console.log(">>> Mongodb connection error !!! ");
        console.log(error);
    });
// set the views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const store = new MongoStore({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    secret,
    store,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = ["https://fonts.gstatic.com/"];
app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dtdiayqkt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
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

app.use(mongoSanitize());
//
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));

// ------------------------------------------------------------------------------------

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.googleClientId,
            clientSecret: process.env.googleClientSecret,
            // callbackURL: "/google/redirect",
            callbackURL: "https://yelpcamp-7lhd.onrender.com/google/redirect",
            //    "/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                //find the user in our database
                let user = await GoogleUser.findOne({ profileID: profile.id });
                if (user) {
                    //If user present in our database.
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
        .then((user) => {
            accountType = "googleUser";
            done(null, user);
        })
        .catch((err) => {
            accountType = "User";
            done("pass");
        });
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
    // console.log(err.stack);
    let { status = 500, message = "something went Wrong !! " } = err;
    res.status(status).render("error", { error: err, title: "Error " });
});
app.listen(3000, () => {
    console.log(">>> serving at port 3000 ...!!!");
});
