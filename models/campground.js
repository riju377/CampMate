const mongoose = require("mongoose");
const { reviewSchema } = require("../public/schemas");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const User = require('./user')

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: [
        {
            url: {
                type: String
            },
            fileName: {
                type: String
            }
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
})

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {

        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model("Campground", campgroundSchema);

