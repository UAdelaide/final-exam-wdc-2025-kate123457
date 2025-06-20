/* part1/app.js  — run with: npm start */

const express      = require('express');
const path         = require('path');
const fs           = require('fs');
const mysql        = require('mysql2/promise');
const cookieParser = require('cookie-parser');
const logger       = require('morgan');

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ---------- DB bootstrap: create DB, tables, seed data ---------- */
let db;                              // shared connection

(async () => {
  try {
    /* 1. connect to MySQL server (no database yet) */
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''                   // change if root has a password
    });

    /* 2. create database if it does not exist */
    await conn.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await conn.end();

    /* 3. connect to DogWalkService */
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService',
      multipleStatements: true
    });

    /* 4. execute DDL script */
    const ddl = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
    await db.query(ddl);

    /* 5. seed sample data (simple: always run) */
    const dml = fs.readFileSync(path.join(__dirname, 'insert_data.sql'), 'utf8');
    await db.query(dml);

    console.log('✅ Database ready');
  } catch (err) {
    console.error(
      '❌ Failed to initialize database. Is MySQL running? (service mysql start)',
      err
    );
  }
})();

/* ---------- GET /api/dogs ---------- */
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.name AS dog_name,
             d.size,
             u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

/* ---------- GET /api/walkrequests/open ---------- */
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT w.request_id,
             d.name AS dog_name,
             w.requested_time,
             w.duration_minutes,
             w.location,
             u.username AS owner_username
      FROM WalkRequests w
      JOIN Dogs  d ON w.dog_id   = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE w.status = 'open';
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

/* ---------- GET /api/walkers/summary ---------- */
/* uses WalkRatings only: every rating == one completed walk */
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.username                       AS walker_username,
             COUNT(r.rating_id)               AS total_ratings,
             ROUND(AVG(r.rating), 2)          AS average_rating,
             COUNT(r.rating_id)               AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch walker summary' });
  }
});

/* ---------- static files (optional) ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- start server ---------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));

module.exports = app;
