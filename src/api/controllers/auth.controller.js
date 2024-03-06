const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Assuming the User model is in a separate file
const OTP = require('../models/otp.model');

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

const signUpWithOtp = async (req, res) => {
	try {
		const { email, password, otp } = req.body;
		// Check if all details are provided
		if (!email || !password || !otp) {
			return res.status(403).json({
				success: false,
				message: 'All fields are required',
			});
		}
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists',
			});
		}
		// Find the most recent OTP for the email
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		if (response.length === 0 || otp !== response[0].otp) {
			return res.status(400).json({
				success: false,
				message: 'The OTP is not valid',
			});
		}
		// Secure password
		let hashedPassword;

		try {
			hashedPassword = await bcrypt.hash(password, 10);
		} catch (error) {
			return res.status(500).json({
				success: false,
				message: `Hashing password error for ${password}: ` + error.message,
			});
		}

		const newUser = await User.create({
			email,
			password: hashedPassword,
		});

		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
			user: newUser,
		});
	} catch (error) {
		console.log(error.message);
		return res.status(500).json({ success: false, error: error.message });
	}
};

module.exports = {
	signUp,
	logIn,
	signUpWithOtp,
};
