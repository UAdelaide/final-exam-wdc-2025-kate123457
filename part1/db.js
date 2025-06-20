// part1/db.js
const mysql = require('mysql2');
module.exports = mysql
  .createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService',
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
  })
  .promise();
