// part1/initDB.js
const fs   = require('fs');
const path = require('path');
const pool = require('./db');

async function init() {

  const ddl = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
  await pool.query(ddl);


  const dml = fs.readFileSync(path.join(__dirname, 'insert_data.sql'), 'utf8');
  await pool.query(dml);
}

module.exports = init;
