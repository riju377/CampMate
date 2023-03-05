const express = require("express");
const Campground = require("../models/campground.js");
const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/expressError');
const Review = require("../models/reviews.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const router = express.Router({ mergeParams: true });




router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    newReview.author = req.user._id;
    await newReview.save();
    await campground.save();
    req.flash('success', 'Successfully added a new review');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    //console.log(id, reviewId);
    const user = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review');
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;