const express = require('express');
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const router = express.Router();
const Review = require('../models/review');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema} = require("../validationSchemas");
const {isLoggedIn} = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', isLoggedIn, validateCampground, catchAsync(async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground !');
    res.redirect(`campgrounds/${campground._id}`);
}))

router.get('/', catchAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

router.get('/new', isLoggedIn, catchAsync(async(req, res) => {
    res.render('campgrounds/new');
}))

router.get('/:id',  catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id).populate('reviews');
    if(!campgrounds){
        req.flash('error', 'Cannot find that campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campgrounds });
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id);
    if(!campgrounds){
        req.flash('error', 'Cannot find that campground !');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campgrounds });
}))

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', isLoggedIn, catchAsync(async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground')
    res.redirect('/campgrounds');
}))

module.exports = router;