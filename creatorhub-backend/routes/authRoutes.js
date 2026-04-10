// routes/authRoutes.js

const express = require('express');
const router  = express.Router();

const { signup, login, getMe, changePassword } = require('../controllers/authController');
const { protect }                              = require('../middleware/auth');
const { signupRules, loginRules }              = require('../middleware/validate');

// Public routes
router.post('/signup', signupRules, signup);
router.post('/login',  loginRules,  login);

// Protected routes (must be logged in)
router.get ('/me',              protect, getMe);
router.put ('/change-password', protect, changePassword);

module.exports = router;
