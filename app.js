const express = require('express')
const moongose = require('mongoose')
const app = express()
const override = require('method-override');
const port = 3000;
const path = require('path')
const Campground = require('./models/campground')

moongose.connect('mongodb://localhost:27017/yelp-camp');

const db = moongose.connection;
db.on("error", console.log.bind(console, "connection error"))
db.once('open', () => {
    console.log("DataBase connected");
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(override('_method'))

 
app.post('/campgrounds', async(req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save()
    res.redirect(`campgrounds/${campground._id}`)
})

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
})

app.get('/campgrounds/new', async(req, res) => {
    res.render('campgrounds/new')
})

app.get('/campgrounds/:id', async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campgrounds })
})

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campgrounds = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campgrounds })
})

app.put('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})