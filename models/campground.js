const moongose = require('mongoose')
const Schema = moongose.Schema

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String
})

module.exports = moongose.model('Campground', campgroundSchema);