const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.error('🔌 Configurando conexão com banco...');
console.error('📡 Host:', process.env.DB_HOST);
console.error('🚪 Porta:', process.env.DB_PORT);
console.error('👤 Usuário:', process.env.DB_USER);
console.error('🔑 Senha:', process.env.DB_PASS ? '***' : 'não definida');
console.error('🗄️ Banco: defaultdb [CORRIGIDO]');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'defaultdb', // ← BANCO CORRIGIDO
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '../ca.pem'))
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.error('✅ Pool de conexão criado!');

module.exports = pool;