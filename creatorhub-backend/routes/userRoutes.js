// routes/userRoutes.js

const express = require('express');
const router  = express.Router();

const { getAllUsers, getUserById, updateProfile, deleteAccount } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

// Public — anyone can browse user profiles
router.get('/',    getAllUsers);
router.get('/:id', getUserById);

// Protected — must be logged in
router.put   ('/me', protect, updateProfile);
router.delete('/me', protect, deleteAccount);

module.exports = router;
