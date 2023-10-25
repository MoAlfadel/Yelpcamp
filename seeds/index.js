const mongoose = require("mongoose");
const Campground = require("../models/campground");
const Review = require("../models/review");

mongoose
    .connect("mongodb://127.0.0.1:27017/yelp-testing")
    .then(() => console.log(">>> Mongodb connection open !!! "))
    .catch((error) => {
        console.log(">>> Mongodb connection error !!! ");
        console.log(error);
    });

const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

const randomElement = (array) =>
    array[Math.floor(Math.random() * array.length)];
let result = new Array();
const seedsDd = async function () {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 10; i++) {
        let randomPrice = Math.floor(Math.random() * 9) + 10;
        let randomCity = cities[Math.floor(Math.random() * cities.length)];
        let camp = new Campground({
            author: "652bb9eeecc9bb4319a8d9c9",
            image: [
                {
                    url: "https://res.cloudinary.com/dtdiayqkt/image/upload/v1697992759/YelpCamp/tojxz6knmoevfv8hmeke.jpg",
                    fileName: "YelpCamp/tojxz6knmoevfv8hmeke",
                },
            ],
            accountType: "User",
            title: `${randomElement(descriptors)} ${randomElement(places)} `,
            location: `${randomCity.city}, ${randomCity.state}`,
            price: randomPrice,
            description:
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam corrupti, sit amet consectetur adipisicing elit.",
        });
        await camp.save();
    }
};
seedsDd();
