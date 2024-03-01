// Import required modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDb = require('./config/DBConfig');

// Create an instance of Express
const app = express();

// dependencies
// const authRoutes = require('./api/routes/auth.route');

// connect to database
connectToDb();

// middlewares
app.use(cors());
app.use(express.json());

// routes

// start server
app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});
