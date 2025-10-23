const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-1472b4e9-joelciomaia-ovino.f.aivencloud.com',
  port: process.env.DB_PORT || 21658,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASS || 'AVNS_n9nWd4pJ4DoJxZinQ_V',
  database: process.env.DB_NAME || 'defaultdb',
  ssl: process.env.DB_HOST ? { rejectUnauthorized: true } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;