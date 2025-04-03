const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 4000;

// 🔹 Middleware
app.use(express.json());
app.use(cors()); // Enable CORS
app.use(helmet()); // Secure HTTP headers
app.use(morgan("dev")); // Log requests

require('./config/connect.js').connectDB();


// 🔹 Routes
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/solar", require("./routes/solarRequestRoutes"));


app.listen(PORT, ()=> 
    console.log(`server is running on ${PORT}`)  // check at localhost:5000
);

