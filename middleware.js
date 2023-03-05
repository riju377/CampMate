const Campground = require("./models/campground");
const Review = require("./models/reviews");
const { campgroundSchema1, reviewSchema } = require('./public/schemas.js');
const ExpressError = require('./utils/expressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //req.session.returnTo = req.originalUrl;
        console.log(req.originalUrl);
        req.flash('error', 'You need to logIn first');
        return res.redirect('/login');
    }
    // console.log(req.user, 'dsjkhyg');
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (campground.author.equals(req.user._id)) {
        return next();
    }
    req.flash('error', "You don't have permission to do that!!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review.author.equals(req.user._id)) {
        return next();
    }
    req.flash('error', "You don't have permission to do that!!");
    res.redirect(`/campgrounds/${id}`);
}

module.exports.validateSchema = (req, res, next) => {

    const { error } = campgroundSchema1.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    //console.log(reviewSchema.validate(req.body));
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    }
    else {
        next();
    }

}