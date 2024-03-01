const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Assuming the User model is in a separate file

const signUp = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if the user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res
				.status(400)
				.json({ success: false, message: 'Email address is already taken' });
		}

		// Hash the password before saving it to the database
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create a new user
		const newUser = new User({
			email,
			password: hashedPassword,
		});

		// Save the user to the database
		await newUser.save();

		res.status(201).json({ success: true, message: 'Signed up successfully' });
	} catch (error) {
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

const logIn = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if the user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Compare the entered password with the hashed password in the database
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid username or password' });
		}

		// Create a JSON Web Token (JWT) for authentication
		const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
			expiresIn: '1h',
		});

		res.status(200).json({
			success: true,
			message: 'Logged in successfully.',
			token,
			userId: user._id,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: 'Internal server error' });
	}
};

module.exports = {
	signUp,
	logIn,
};
