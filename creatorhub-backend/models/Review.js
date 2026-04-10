// models/Review.js
const db = require('../config/database');

const getOne = (sql, p = []) => new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));
const getAll = (sql, p = []) => new Promise((res, rej) => db.all(sql, p, (e, r) => e ? rej(e) : res(r)));
const run    = (sql, p = []) => new Promise((res, rej) => db.run(sql, p, function(e) { e ? rej(e) : res(this); }));

const Review = {
  async create({ order_id, service_id, client_id, rating, comment }) {
    const r = await run(
      'INSERT INTO reviews (order_id, service_id, client_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [order_id, service_id, client_id, rating, comment]
    );
    return this.findById(r.lastID);
  },

  findById(id) {
    return getOne('SELECT r.*, u.name AS client_name FROM reviews r LEFT JOIN users u ON r.client_id = u.id WHERE r.id = ?', [id]);
  },

  findByService(service_id) {
    return getAll('SELECT r.*, u.name AS client_name FROM reviews r LEFT JOIN users u ON r.client_id = u.id WHERE r.service_id = ? ORDER BY r.created_at DESC', [service_id]);
  },

  async existsForOrder(order_id) {
    const row = await getOne('SELECT id FROM reviews WHERE order_id = ?', [order_id]);
    return !!row;
  },
};

module.exports = Review;