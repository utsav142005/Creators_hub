// config/database.js
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './database.sqlite';

const db = new sqlite3.Database(path.resolve(DB_PATH), (err) => {
  if (err) {
    console.error('❌ Could not connect to database:', err.message);
    process.exit(1);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;