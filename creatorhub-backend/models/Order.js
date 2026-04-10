// models/Order.js
const db = require('../config/database');

const getOne = (sql, p = []) => new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));
const getAll = (sql, p = []) => new Promise((res, rej) => db.all(sql, p, (e, r) => e ? rej(e) : res(r)));
const run    = (sql, p = []) => new Promise((res, rej) => db.run(sql, p, function(e) { e ? rej(e) : res(this); }));

const Order = {
  async create({ service_id, client_id, creator_id, price, notes }) {
    const r = await run(
      'INSERT INTO orders (service_id, client_id, creator_id, price, notes) VALUES (?, ?, ?, ?, ?)',
      [service_id, client_id, creator_id, price, notes]
    );
    return this.findById(r.lastID);
  },

  findById(id) {
    return getOne(`
      SELECT o.*, s.title AS service_title, u1.name AS client_name, u2.name AS creator_name
      FROM orders o
      LEFT JOIN services s ON o.service_id = s.id
      LEFT JOIN users u1 ON o.client_id = u1.id
      LEFT JOIN users u2 ON o.creator_id = u2.id
      WHERE o.id = ?`, [id]);
  },

  findByUser(user_id, role = 'client') {
    const col = role === 'creator' ? 'creator_id' : 'client_id';
    return getAll(`SELECT o.*, s.title AS service_title FROM orders o LEFT JOIN services s ON o.service_id = s.id WHERE o.${col} = ? ORDER BY o.created_at DESC`, [user_id]);
  },

  async updateStatus(id, status) {
    await run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    return this.findById(id);
  },
};

module.exports = Order;