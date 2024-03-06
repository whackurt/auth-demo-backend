const mongoose = require('mongoose');

const connectToDb = async () => {
	try {
		console.log('Connecting...');
		await mongoose.connect(process.env.DB_URL);
		console.log('Connected to database.');
	} catch (error) {
		console.log(error);
	}
};

module.exports = connectToDb;
