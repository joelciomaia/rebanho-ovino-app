const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.error('🔌 Configurando conexão com banco...');
console.error('📡 Host:', process.env.DB_HOST);
console.error('🚪 Porta:', process.env.DB_PORT);
console.error('👤 Usuário: app_user [NOVO]');
console.error('🔑 Senha: ***');
console.error('🗄️ Banco: gerenciamentoovino');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: 'app_user',
  password: 'MinhaSenha123!',
  database: 'gerenciamentoovino',
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