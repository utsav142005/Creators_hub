// middleware/validate.js
// ─────────────────────────────────────────────
//  Reusable validation rule sets.
//  Uses express-validator under the hood.
// ─────────────────────────────────────────────

const { body, validationResult } = require('express-validator');

// ── Collect validation errors and return them if any ─────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth Rules ────────────────────────────────────────────────────────────────

const signupRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  body('role')
    .optional()
    .isIn(['creator', 'client']).withMessage('Role must be creator or client'),

  handleValidation,
];

const loginRules = [
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

// ── Service Rules ─────────────────────────────────────────────────────────────

const serviceRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be 5–200 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 1 }).withMessage('Price must be a positive number'),

  body('delivery_days')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Delivery days must be between 1 and 365'),

  handleValidation,
];

// ── Review Rules ──────────────────────────────────────────────────────────────

const reviewRules = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),

  handleValidation,
];

module.exports = { signupRules, loginRules, serviceRules, reviewRules };
