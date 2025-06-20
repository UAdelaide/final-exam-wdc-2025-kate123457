// part1/db.js
const mysql = require('mysql2');
const pool = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '12345',// 你的 root 密码
    database: 'DogWalkService',
    multipleStatements: true, // 允许一次执行多语句
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();

module.exports = pool;
