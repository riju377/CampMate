const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync.js');
const ExpressError = require('./utils/expressError');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user')
const passport = require('passport');
const LocalStrategy = require("passport-local");
const MongoStore = require('connect-mongo')(session);

const app = express();

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const mongoUrl = process.env.MONGO_CLOUD;

mongoose.set('strictQuery', true);

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoStore({
    url: mongoUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}




app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})


const campgroundRouter = require('./routes/campgrounds');
const reviewRouter = require('./routes/reviews');
const userRouter = require('./routes/user');

app.get("/", catchAsync(async (req, res) => {
    res.render('campgrounds/home');
}))


app.use('/campgrounds', campgroundRouter);
app.use('/campgrounds/:id/reviews', reviewRouter);
app.use('/', userRouter);


app.all('*', (req, res, next) => {
    console.log("hit1!!!");
    next(new ExpressError('Page not found!!', 404));
})

app.use((err, req, res, next) => {
    console.log("hit2!!!");
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went wrong!';
    res.status(statusCode).render("error.ejs", { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Porting on ${port}`)
})