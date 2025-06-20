// part1/initDB.js
const fs   = require('fs');
const path = require('path');
const pool = require('./db');

async function init() {
  // 读取并执行建表脚本
  const ddl = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
  await pool.query(ddl);

  // 读取并执行插入示例数据脚本
  const dml = fs.readFileSync(path.join(__dirname, 'insert_data.sql'), 'utf8');
  await pool.query(dml);
}

module.exports = init;
