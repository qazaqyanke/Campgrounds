const moongose = require('mongoose')
const Schema = moongose.Schema

const campgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
})

module.exports = moongose.model('Campground', campgroundSchema);