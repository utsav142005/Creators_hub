
const db = require('../config/database');

const getAllUsers = (req, res, next) => {
  db.all('SELECT id, name, email, role, avatar, bio, location, created_at FROM users WHERE is_active = 1', [], (err, rows) => {
    if (err) return next(err);
    res.json({ success: true, count: rows.length, users: rows });
  });
};

const getUserById = (req, res, next) => {
  db.get('SELECT id, name, email, role, avatar, bio, location, created_at FROM users WHERE id = ? AND is_active = 1', [req.params.id], (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    db.all('SELECT * FROM services WHERE creator_id = ? AND is_active = 1', [req.params.id], (err2, services) => {
      if (err2) return next(err2);
      res.json({ success: true, user: user, services: services || [] });
    });
  });
};

const updateProfile = (req, res, next) => {
  const { name, bio, avatar, location } = req.body;
  db.run('UPDATE users SET name=COALESCE(?,name), bio=COALESCE(?,bio), avatar=COALESCE(?,avatar), location=COALESCE(?,location), updated_at=CURRENT_TIMESTAMP WHERE id=?', [name, bio, avatar, location, req.user.id], function(err) {
    if (err) return next(err);
    db.get('SELECT id, name, email, role, avatar, bio, location FROM users WHERE id=?', [req.user.id], (err2, user) => {
      if (err2) return next(err2);
      res.json({ success: true, message: 'Profile updated.', user });
    });
  });
};

const deleteAccount = (req, res, next) => {
  db.run('UPDATE users SET is_active=0 WHERE id=?', [req.user.id], (err) => {
    if (err) return next(err);
    res.json({ success: true, message: 'Account deactivated.' });
  });
};

module.exports = { getAllUsers, getUserById, updateProfile, deleteAccount };