const express = require('express');
const mongoose = require('mongoose');
const app = express();
const override = require('method-override');
const port = 3000;
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const path = require('path');
const Campground = require('./models/campground');
const { campgroundSchema, reviewSchema  } = require('./validationSchemas.js');
const Review = require('./models/review');


mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.log.bind(console, "connection error"));
db.once('open', () => {
    console.log("DataBase connected");
})

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(override('_method'));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const valiadateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.post('/campgrounds', validateCampground, catchAsync(async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);

}))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', catchAsync(async(req, res) => {
    res.render('campgrounds/new');
}))

app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id).populate('reviews');
    console.log(campgrounds);
    res.render('campgrounds/show', { campgrounds })
}))

app.get('/campgrounds/:id/edit', catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campgrounds });
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


app.post('/campgrounds/:id/reviews', valiadateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: {reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong'

    res.status(statusCode).render('error', { err });
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})