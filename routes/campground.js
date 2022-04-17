const express = require('express');
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const router = express.Router();
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require("../validationSchemas");

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateCampground, catchAsync(async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`campgrounds/${campground._id}`);
}))

router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', catchAsync(async(req, res) => {
    res.render('campgrounds/new');
}))

router.get('/:id', catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id).populate('reviews');
    console.log(campgrounds);
    res.render('campgrounds/show', { campgrounds })
}))

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campgrounds });
}))

router.put('/:id', validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;