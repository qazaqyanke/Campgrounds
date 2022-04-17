const express = require('express');
const mongoose = require('mongoose');
const app = express();
const override = require('method-override');
const port = 3000;
const ExpressError = require('./utils/ExpressError');
const ejsMate = require('ejs-mate');
const path = require('path');

const campgrounds = require('./routes/campground');
const reviews = require('./routes/reviews');


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

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
})

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