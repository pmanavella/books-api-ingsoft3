// backend/db.js
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const USE_SQLITE = process.env.DB_CLIENT === 'sqlite';

// API común: db.query(sql, params)
let db = {};

if (USE_SQLITE) {
  const dbPath = process.env.SQLITE_PATH || path.join(__dirname, 'data.sqlite');
  const sqlite = new sqlite3.Database(dbPath);

  // Crear tabla si no existe
  sqlite.serialize(() => {
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        year INTEGER NOT NULL
      )
    `);
  });

  db.query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
      const q = sql.trim().toLowerCase();

      if (q.startsWith('select')) {
        sqlite.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve([rows, []]);
        });
      } else {
        sqlite.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve([{ insertId: this.lastID, affectedRows: this.changes }, []]);
        });
      }
    });
  };

} else {
  // MODO MYSQL (LOCAL)
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  db.query = (...args) => pool.query(...args);
}

module.exports = db;
