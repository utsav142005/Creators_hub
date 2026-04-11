// server.js
// ─────────────────────────────────────────────
//  CreatorHub Backend — Entry Point
//  Start with: node server.js  OR  npm run dev
// ─────────────────────────────────────────────

require('dotenv').config();   // Load .env FIRST before anything else

const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const authRoutes     = require('./routes/authRoutes');
const userRoutes     = require('./routes/userRoutes');
const serviceRoutes  = require('./routes/serviceRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────

// helmet sets secure HTTP headers (protects against common attacks)
app.use(helmet());

// CORS — allows your frontend URL to talk to this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiter — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// Tighter rate limit for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// ── BODY PARSING ──────────────────────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));       // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// ── REQUEST LOGGING (dev only) ────────────────────────────────────────────────

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '⚡ CreatorHub API is running!',
    version: '1.0.0',
    docs: '/api'
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'CreatorHub REST API',
    endpoints: {
      auth:       '/api/auth',
      users:      '/api/users',
      services:   '/api/services',
      orders:     '/api/orders',
      categories: '/api/categories',
    }
  });
});

// ── API ROUTES ────────────────────────────────────────────────────────────────

app.use('/api/auth',       authRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/services',   serviceRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/categories', categoryRoutes);

// ── 404 HANDLER ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Must be last — catches errors from all routes above

app.use(errorHandler);

// ── START SERVER ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('  ⚡  CreatorHub API');
  console.log(`  🚀  Running on    → http://localhost:${PORT}`);
  console.log(`  🌍  Environment   → ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📦  Database      → ${process.env.DB_PATH || './database.sqlite'}`);
  console.log('');
});

module.exports = app;
