// controllers/authController.js
// ─────────────────────────────────────────────
//  Handles user registration and login.
//  Uses async/await with sqlite3 (NOT MongoDB)
// ─────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { createError } = require('../middleware/errorHandler');
const db = require('../config/database');

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ── Helper: db.get wrapped in a Promise ──────────────────────────────────────
const dbGet = (sql, params) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
  );

// ── Helper: db.run wrapped in a Promise ──────────────────────────────────────
const dbRun = (sql, params) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this); })
  );

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password, role = 'client' } = req.body;

    // 1. Check for duplicate email (async)
    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      throw createError('An account with this email already exists.', 409);
    }

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Insert the user into database
    const result = await dbRun(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // 4. Fetch the newly created user (without password)
    const user = await dbGet(
      'SELECT id, name, email, role, avatar, bio, location, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    // 5. Sign a token
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user
    });

  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user WITH password hash (async)
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    // Generic message — don't reveal if email exists or not
    if (!user) {
      throw createError('Invalid email or password.', 401);
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw createError('Invalid email or password.', 401);
    }

    // 3. Sign a token
    const token = signToken(user);

    // 4. Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: userWithoutPassword
    });

  } catch (err) {
    next(err);
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

// ── PUT /api/auth/change-password ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw createError('Both current and new password are required.', 400);
    }
    if (newPassword.length < 8) {
      throw createError('New password must be at least 8 characters.', 400);
    }

    // Re-fetch user with password hash
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [req.user.email]
    );

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw createError('Current password is incorrect.', 401);

    const hashed = await bcrypt.hash(newPassword, 12);
    await dbRun(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashed, req.user.id]
    );

    res.json({ success: true, message: 'Password changed successfully.' });

  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, changePassword };