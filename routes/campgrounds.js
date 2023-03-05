const express = require("express");
const Campground = require("../models/campground.js");
const catchAsync = require('../utils/catchAsync.js');
const { isLoggedIn, isAuthor, validateSchema } = require('../middleware');
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage })

const router = express.Router({ mergeParams: true });




router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render("campgrounds/index", { campgrounds });
}))

router.get("/new", isLoggedIn, catchAsync(async (req, res) => {
    res.render("campgrounds/new");
}))


router.post("/", isLoggedIn, upload.array("campground[image]"), validateSchema, catchAsync(async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.image = req.files.map(f => ({ url: f.path, fileName: f.originalname }));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully created new campground');
    res.redirect(`/campgrounds/${newCamp._id}`);
}))

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const campDetails = await Campground.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate('author');
    // console.log(campDetails);
    if (!campDetails) {
        req.flash('error', 'Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campDetails });
}))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const selectedCamp = await Campground.findById(id);
    // console.log(selectedCamp.title);
    if (!selectedCamp) {
        req.flash('error', 'Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { selectedCamp })
}))

router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {

    const { id } = req.params;
    const campground = Campground.findById(id);
    // const campground = Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground does not exist');
        return res.redirect('/campgrounds');
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the campground');
    res.redirect("/campgrounds");
}))

router.put("/:id", isLoggedIn, isAuthor, upload.array('campground[name]'), validateSchema, catchAsync(async (req, res) => {
    // console.log("put Working");
    const { id } = req.params;
    const imgs = req.files.map(f => ({ url: f.path, fileName: f.originalname }))
    const updatedCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    updatedCamp.image.push(...imgs);
    await updatedCamp.save();
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;