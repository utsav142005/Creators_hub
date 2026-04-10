// controllers/serviceController.js

const Service = require('../models/Service');
const { createError } = require('../middleware/errorHandler');

// ── GET /api/services ─────────────────────────────────────────────────────────
const getAllServices = (req, res, next) => {
  try {
    const { limit = 20, offset = 0, category_id, search } = req.query;
    const services = Service.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category_id: category_id ? parseInt(category_id) : undefined,
      search
    });
    res.json({ success: true, count: services.length, services });
  } catch (err) { next(err); }
};

// ── GET /api/services/:id ─────────────────────────────────────────────────────
const getServiceById = (req, res, next) => {
  try {
    const service = Service.findById(req.params.id);
    if (!service) throw createError('Service not found.', 404);
    res.json({ success: true, service });
  } catch (err) { next(err); }
};

// ── POST /api/services ────────────────────────────────────────────────────────
const createService = (req, res, next) => {
  try {
    // Only creators can post services (also enforced via restrictTo in routes)
    const { title, description, price, delivery_days, image, tags, category_id } = req.body;
    const service = Service.create({
      creator_id: req.user.id,
      category_id: category_id ? parseInt(category_id) : null,
      title, description,
      price: parseFloat(price),
      delivery_days: parseInt(delivery_days) || 3,
      image, tags
    });
    res.status(201).json({ success: true, message: 'Service created.', service });
  } catch (err) { next(err); }
};

// ── PUT /api/services/:id ─────────────────────────────────────────────────────
const updateService = (req, res, next) => {
  try {
    const service = Service.findById(req.params.id);
    if (!service) throw createError('Service not found.', 404);

    // Only the owner (or admin) can edit
    if (service.creator_id !== req.user.id && req.user.role !== 'admin') {
      throw createError('You are not authorised to edit this service.', 403);
    }

    const updated = Service.update(req.params.id, req.body);
    res.json({ success: true, message: 'Service updated.', service: updated });
  } catch (err) { next(err); }
};

// ── DELETE /api/services/:id ──────────────────────────────────────────────────
const deleteService = (req, res, next) => {
  try {
    const service = Service.findById(req.params.id);
    if (!service) throw createError('Service not found.', 404);

    if (service.creator_id !== req.user.id && req.user.role !== 'admin') {
      throw createError('You are not authorised to delete this service.', 403);
    }

    Service.delete(req.params.id);
    res.json({ success: true, message: 'Service deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
