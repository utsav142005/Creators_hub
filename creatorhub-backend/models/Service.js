// models/Service.js
const db = require('../config/database');

const getOne = (sql, p = []) => new Promise((res, rej) => db.get(sql, p, (e, r) => e ? rej(e) : res(r)));
const getAll = (sql, p = []) => new Promise((res, rej) => db.all(sql, p, (e, r) => e ? rej(e) : res(r)));
const run    = (sql, p = []) => new Promise((res, rej) => db.run(sql, p, function(e) { e ? rej(e) : res(this); }));

const Service = {
  async create({ creator_id, category_id, title, description, price, delivery_days, image, tags }) {
    const r = await run(
      'INSERT INTO services (creator_id, category_id, title, description, price, delivery_days, image, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [creator_id, category_id, title, description, price, delivery_days, image, tags]
    );
    return this.findById(r.lastID);
  },

  findById(id) {
    return getOne(`
      SELECT s.*, u.name AS creator_name, u.avatar AS creator_avatar,
             c.name AS category_name, c.slug AS category_slug
      FROM services s
      LEFT JOIN users u ON s.creator_id = u.id
      LEFT JOIN categories c ON s.category_id = c.id
      WHERE s.id = ? AND s.is_active = 1`, [id]);
  },

  findAll({ limit = 20, offset = 0, category_id, search } = {}) {
    let sql = `SELECT s.id, s.title, s.price, s.delivery_days, s.image, s.tags, s.created_at,
                      u.name AS creator_name, c.name AS category_name
               FROM services s
               LEFT JOIN users u ON s.creator_id = u.id
               LEFT JOIN categories c ON s.category_id = c.id
               WHERE s.is_active = 1`;
    const params = [];
    if (category_id) { sql += ' AND s.category_id = ?'; params.push(category_id); }
    if (search) {
      sql += ' AND (s.title LIKE ? OR s.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    return getAll(sql, params);
  },

  findByCreator(creator_id) {
    return getAll('SELECT * FROM services WHERE creator_id = ? AND is_active = 1', [creator_id]);
  },

  async update(id, { title, description, price, delivery_days, image, tags, category_id }) {
    await run(
      'UPDATE services SET title=COALESCE(?,title), description=COALESCE(?,description), price=COALESCE(?,price), delivery_days=COALESCE(?,delivery_days), image=COALESCE(?,image), tags=COALESCE(?,tags), category_id=COALESCE(?,category_id), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title, description, price, delivery_days, image, tags, category_id, id]
    );
    return this.findById(id);
  },

  delete(id) { return run('UPDATE services SET is_active = 0 WHERE id = ?', [id]); },
};

module.exports = Service;