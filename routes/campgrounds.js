const express = require("express");
const router = express.Router();

const Campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const {
    isLogin,
    isCampgroundAuthor,
    validateCampground,
} = require("../middleware");

router
    .route("/")
    .get(Campgrounds.indexPage)
    .post(
        isLogin,
        validateCampground,
        upload.array("campground-img"),
        Campgrounds.createCampground
    );

// .post(upload.array("campground-img"), (req, res) => {
//     res.send(req.files);
//     console.log(req.body, req.files);
// });

router.get("/new", isLogin, Campgrounds.renderNewForm);

router.get("/find", Campgrounds.findCampground);
router
    .route("/:id")
    .get(Campgrounds.showCampground)
    .put(
        isLogin,
        isCampgroundAuthor,
        upload.array("campground-img"),
        validateCampground,
        Campgrounds.updateCampground
    )
    .delete(isLogin, isCampgroundAuthor, Campgrounds.deleteCampground);

router.get(
    "/:id/edit",
    isLogin,
    isCampgroundAuthor,
    Campgrounds.renderEditForm
);

module.exports = router;
