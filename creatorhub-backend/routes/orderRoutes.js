// routes/orderRoutes.js

const express = require('express');
const router  = express.Router();

const {
  createOrder, getMyOrders,
  getOrderById, updateOrderStatus, leaveReview
} = require('../controllers/orderController');

const { protect }      = require('../middleware/auth');
const { reviewRules }  = require('../middleware/validate');

// All order routes require authentication
router.use(protect);

router.get ('/',              getMyOrders);
router.post('/',              createOrder);
router.get ('/:id',           getOrderById);
router.patch('/:id/status',   updateOrderStatus);
router.post ('/:id/review',   reviewRules, leaveReview);

module.exports = router;
