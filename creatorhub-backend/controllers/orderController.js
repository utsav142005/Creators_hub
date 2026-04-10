// controllers/orderController.js

const Order   = require('../models/Order');
const Service = require('../models/Service');
const Review  = require('../models/Review');
const { createError } = require('../middleware/errorHandler');

// ── POST /api/orders ──────────────────────────────────────────────────────────
const createOrder = (req, res, next) => {
  try {
    const { service_id, notes } = req.body;
    if (!service_id) throw createError('service_id is required.', 400);

    const service = Service.findById(service_id);
    if (!service) throw createError('Service not found.', 404);
    if (service.creator_id === req.user.id) {
      throw createError('You cannot order your own service.', 400);
    }

    const order = Order.create({
      service_id: parseInt(service_id),
      client_id:  req.user.id,
      creator_id: service.creator_id,
      price:      service.price,
      notes
    });

    res.status(201).json({ success: true, message: 'Order placed!', order });
  } catch (err) { next(err); }
};

// ── GET /api/orders ───────────────────────────────────────────────────────────
// Returns orders for the logged-in user (as client or creator)
const getMyOrders = (req, res, next) => {
  try {
    const role   = req.query.role || 'client';
    const orders = Order.findByUser(req.user.id, role);
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { next(err); }
};

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
const getOrderById = (req, res, next) => {
  try {
    const order = Order.findById(req.params.id);
    if (!order) throw createError('Order not found.', 404);

    // Only involved parties can view the order
    if (order.client_id !== req.user.id && order.creator_id !== req.user.id) {
      throw createError('Not authorised to view this order.', 403);
    }

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// ── PATCH /api/orders/:id/status ──────────────────────────────────────────────
const updateOrderStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['active', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      throw createError(`Status must be one of: ${allowed.join(', ')}`, 400);
    }

    const order = Order.findById(req.params.id);
    if (!order) throw createError('Order not found.', 404);

    // Clients can cancel; creators can mark active/completed
    if (status === 'cancelled' && order.client_id !== req.user.id) {
      throw createError('Only the client can cancel an order.', 403);
    }
    if (['active', 'completed'].includes(status) && order.creator_id !== req.user.id) {
      throw createError('Only the creator can update order progress.', 403);
    }

    const updated = Order.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Order marked as ${status}.`, order: updated });
  } catch (err) { next(err); }
};

// ── POST /api/orders/:id/review ───────────────────────────────────────────────
const leaveReview = (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const order = Order.findById(req.params.id);

    if (!order)                          throw createError('Order not found.', 404);
    if (order.client_id !== req.user.id) throw createError('Only the client can leave a review.', 403);
    if (order.status !== 'completed')    throw createError('You can only review a completed order.', 400);
    if (Review.existsForOrder(order.id)) throw createError('You already reviewed this order.', 409);

    const review = Review.create({
      order_id:   order.id,
      service_id: order.service_id,
      client_id:  req.user.id,
      rating:     parseInt(rating),
      comment
    });

    res.status(201).json({ success: true, message: 'Review submitted!', review });
  } catch (err) { next(err); }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, leaveReview };
