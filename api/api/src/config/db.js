const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, 'ca.pem'))
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;