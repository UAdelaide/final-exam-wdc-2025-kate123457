

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


let db;

(async () => {
  try {

    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });


    await conn.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await conn.end();


    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService',
      multipleStatements: true
    });


    const ddl = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
    await db.query(ddl);


    const dml = fs.readFileSync(path.join(__dirname, 'insert_data.sql'), 'utf8');
    await db.query(dml);

    console.log(' Database ready');
  } catch (err) {
    console.error(
      ' Failed to initialize database. Is MySQL running? (service mysql start)',
      err
    );
  }
})();


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


app.use(express.static(path.join(__dirname, 'public')));


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));

module.exports = app;
