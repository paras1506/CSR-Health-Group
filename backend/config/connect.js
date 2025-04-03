const mongoose = require("mongoose");
require("dotenv").config();

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("Database connected"))
    .catch((err) => {
        console.log(err);
         console.log("Database connection error");
         process.exit(1);
}
);
}


