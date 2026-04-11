// config/initDB.js
// Runs automatically when server starts — creates tables if they don't exist

const db = require('./database');

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password    TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'client',
    avatar      TEXT,
    bio         TEXT,
    location    TEXT,
    is_verified INTEGER NOT NULL DEFAULT 0,
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    slug       TEXT    NOT NULL UNIQUE,
    icon       TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS services (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id    INTEGER NOT NULL,
    category_id   INTEGER,
    title         TEXT    NOT NULL,
    description   TEXT    NOT NULL,
    price         REAL    NOT NULL,
    delivery_days INTEGER NOT NULL DEFAULT 3,
    image         TEXT,
    tags          TEXT,
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    client_id  INTEGER NOT NULL,
    creator_id INTEGER NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'pending',
    price      REAL    NOT NULL,
    notes      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   INTEGER NOT NULL UNIQUE,
    service_id INTEGER NOT NULL,
    client_id  INTEGER NOT NULL,
    rating     INTEGER NOT NULL,
    comment    TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `INSERT OR IGNORE INTO categories (name, slug, icon) VALUES
    ('Design & Branding',  'design',      '🎨'),
    ('Video & Animation',  'video',       '🎬'),
    ('Development',        'development', '💻'),
    ('Photography',        'photography', '📷'),
    ('Writing & Content',  'writing',     '✍️'),
    ('Marketing & SEO',    'marketing',   '📈')`
];

// Run all table creation statements
const runNext = (index) => {
  if (index >= tables.length) {
    console.log('✅ Database ready!');
    return;
  }
  db.run(tables[index], (err) => {
    if (err) {
      console.error('DB init error:', err.message);
    }
    runNext(index + 1);
  });
};

runNext(0);
