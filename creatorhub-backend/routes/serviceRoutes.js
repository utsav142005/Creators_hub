// routes/serviceRoutes.js

const express = require('express');
const router  = express.Router();

const {
  getAllServices, getServiceById,
  createService,  updateService, deleteService
} = require('../controllers/serviceController');

const { protect, restrictTo } = require('../middleware/auth');
const { serviceRules }        = require('../middleware/validate');

// Public
router.get('/',    getAllServices);
router.get('/:id', getServiceById);

// Protected — only creators can manage services
router.post  ('/',    protect, restrictTo('creator'), serviceRules, createService);
router.put   ('/:id', protect, restrictTo('creator', 'admin'), updateService);
router.delete('/:id', protect, restrictTo('creator', 'admin'), deleteService);

module.exports = router;
