const moongose = require('mongoose')
const cities = require('./cities')
const Campground = require('../models/campground')
const {places, descriptors} = require('./seedHelpers')

moongose.connect('mongodb://localhost:27017/yelp-camp');

const db = moongose.connection;
db.on("error", console.log.bind(console, "connection error"))
db.once('open', () => {
    console.log("DataBase connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save()
    }
}

seedDb().then(() => {
    moongose.connection.close();
})