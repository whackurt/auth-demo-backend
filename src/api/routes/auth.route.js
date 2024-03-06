const express = require('express');
const authController = require('../controllers/auth.controller');
const otpController = require('../controllers/otp.controller');
const router = express.Router();

router.post('/signup', authController.signUpWithOtp);
// router.post('/signup-otp', authController.signUpWithOtp);
router.post('/login', authController.logIn);
router.post('/send-otp', otpController.sendOTP);

module.exports = router;
