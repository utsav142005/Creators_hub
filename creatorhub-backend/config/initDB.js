// config/initDB.js
// Runs automatically when server starts.
// Creates tables AND seeds default creators so data is never empty.

require('dotenv').config();
const db     = require('./database');
const bcrypt = require('bcryptjs');

const DEFAULT_CREATORS = [
  { name: 'Utsav Talreja',   email: 'utsav@creatorhub.com',   bio: 'UI/UX Designer with 5 years experience. Specializing in modern web interfaces.',    location: 'Mumbai'    },
  { name: 'Arjun Mehta',     email: 'arjun@creatorhub.com',   bio: 'Video Editor & Motion Designer. YouTube and Instagram content specialist.',          location: 'Delhi'     },
  { name: 'Neha Kapoor',     email: 'neha@creatorhub.com',    bio: 'Full-Stack Developer specializing in React, Node.js and modern web applications.',   location: 'Bangalore' },
  { name: 'Rohan Verma',     email: 'rohan@creatorhub.com',   bio: 'Content Strategist and SEO Writer. 200+ articles published across top platforms.',   location: 'Chennai'   },
  { name: 'Simran Kaur',     email: 'simran@creatorhub.com',  bio: 'Social Media Manager. Grew 15+ brand accounts to 100K+ followers on Instagram.',    location: 'Pune'      },
  { name: 'Dev Anand',       email: 'dev@creatorhub.com',     bio: 'Music Producer and Audio Engineer. Worked on 50+ commercial projects.',              location: 'Hyderabad' },
];

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

const createTables = () => new Promise((resolve, reject) => {
  let i = 0;
  const next = () => {
    if (i >= tables.length) return resolve();
    db.run(tables[i++], (err) => {
      if (err) return reject(err);
      next();
    });
  };
  next();
});

const seedCreator = (creator) => new Promise((resolve) => {
  db.get('SELECT id FROM users WHERE email = ?', [creator.email], (err, row) => {
    if (row) return resolve();
    const hash = bcrypt.hashSync('Creator@123', 10);
    db.run(
      'INSERT INTO users (name, email, password, role, bio, location) VALUES (?, ?, ?, ?, ?, ?)',
      [creator.name, creator.email, hash, 'creator', creator.bio, creator.location],
      function(err) {
        if (err) console.log('  Seed skip:', creator.name);
        else console.log('  ✓ Seeded:', creator.name, '(id=' + this.lastID + ')');
        resolve();
      }
    );
  });
});

const initDB = async () => {
  try {
    await createTables();
    console.log('✅  Tables ready');
    console.log('🌱  Seeding default creators...');
    for (const creator of DEFAULT_CREATORS) {
      await seedCreator(creator);
    }
    console.log('✅  Database ready!\n');
  } catch (err) {
    console.error('❌  DB init error:', err.message);
  }
};

module.exports = initDB;
