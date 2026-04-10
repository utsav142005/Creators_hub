// controllers/categoryController.js

const db = require('../config/database');

const getCategories = (req, res, next) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    res.json({ success: true, categories });
  } catch (err) { next(err); }
};

module.exports = { getCategories };
