/* part1/app.js  —— 运行：npm start */

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

/* ---------- ① 建库、建表并插入示例数据 ---------- */
let db;   // 让其他路由能复用

(async () => {
  try {
    /* 1. 先连到 MySQL（不带 database）*/
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''               // ← 如果有密码请改
    });

    /* 2. 建库（幂等）*/
    await conn.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await conn.end();

    /* 3. 再连到 DogWalkService */
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService',
      multipleStatements: true
    });

    /* 4. 执行建表脚本 dogwalks.sql */
    const ddl = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
    await db.query(ddl);

    /* 5. 执行示例数据脚本 insert_data.sql（可先检测是否已有数据） */
    const dml = fs.readFileSync(path.join(__dirname, 'insert_data.sql'), 'utf8');
    await db.query(dml);

    console.log('✅ Database ready');
  } catch (err) {
    console.error(
      '❌ 数据库初始化失败，请确认 MySQL 已运行（service mysql start）\n',
      err
    );
  }
})();

/* ---------- ② /api/dogs ---------- */
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

/* ---------- ③ /api/walkrequests/open ---------- */
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
      JOIN Dogs  d ON w.dog_id  = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE w.status = 'open';
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch open requests' });
  }
});

/* ---------- ④ /api/walkers/summary ---------- */
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.username AS walker_username,
             COUNT(r.rating_id)              AS total_ratings,
             ROUND(AVG(r.rating), 2)         AS average_rating,
             COUNT(CASE WHEN w.status='completed' THEN 1 END) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings  r ON u.user_id = r.walker_id
      LEFT JOIN WalkRequests w ON u.user_id = w.accepted_walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch walker summary' });
  }
});

/* ---------- 静态文件（可无视） ---------- */
app.use(express.static(path.join(__dirname, 'public')));

/* ---------- 启动服务器 ---------- */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));

module.exports = app;
