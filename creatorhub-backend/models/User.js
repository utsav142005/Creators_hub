// models/User.js
// All DB operations use sqlite3 with Promises (async/await)

const db = require('../config/database');

// ── Reusable helpers ──────────────────────────────────────────────────────────
const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
  );

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows))
  );

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this); })
  );

// ── User Model ────────────────────────────────────────────────────────────────
const User = {

  async create({ name, email, password, role = 'client' }) {
    const r = await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return dbGet(
      'SELECT id, name, email, role, avatar, bio, location, created_at FROM users WHERE id = ?',
      [r.lastID]
    );
  },

  findById(id) {
    return dbGet(
      'SELECT id, name, email, role, avatar, bio, location, is_verified, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
  },

  findByEmailWithPassword(email) {
    return dbGet(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );
  },

  findByEmail(email) {
    return dbGet(
      'SELECT id, name, email, role FROM users WHERE email = ?',
      [email]
    );
  },

  findAll({ limit = 20, offset = 0 } = {}) {
    return dbAll(
      'SELECT id, name, email, role, avatar, bio, location, created_at FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
  },

  async update(id, { name, bio, avatar, location }) {
    await dbRun(
      'UPDATE users SET name=COALESCE(?,name), bio=COALESCE(?,bio), avatar=COALESCE(?,avatar), location=COALESCE(?,location), updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name, bio, avatar, location, id]
    );
    return dbGet(
      'SELECT id, name, email, role, avatar, bio, location FROM users WHERE id = ?',
      [id]
    );
  },

  updatePassword(id, hashedPassword) {
    return dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
  },

  deactivate(id) {
    return dbRun('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  },

};

module.exports = User;