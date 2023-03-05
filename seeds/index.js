const mongoose = require("mongoose");
const campground = require("../models/campground");
const Reviews = require("../models/reviews");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

mongoose.set('strictQuery', true);
mongoose.connect('mongodb://localhost:27017/yelpCamp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const randGen = arr => arr[Math.floor(Math.random() * arr.length)]


const seedDB = async () => {
    await campground.deleteMany({});
    await Reviews.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new campground({
            author: "63c834738bfce6c5a70ebcc3",
            location: `${cities[random1000].city} ${cities[random1000].state}`,

            title: `${randGen(descriptors)} ${randGen(places)}`,

            image: {
                url: "https://res.cloudinary.com/dpwdpwnvv/image/upload/v1677943271/yelpCamp/jayokowtlvgjl5ypowez.jpg",
                fileName: "'pexels-irina-iriser-1379636.jpg'"
            },

            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita dolorum incidunt necessitatibus fugit adipisci aperiam in enim corporis optio quod aliquid iure explicabo beatae, temporibus non cumque accusantium delectus voluptatibus!",

            price: price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});



