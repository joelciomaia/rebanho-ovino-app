const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com Aiven...');
    
    const connection = await mysql.createConnection({
      host: 'mysql-1472b4e9-joelciomaia-ovino.f.aivencloud.com',
      port: 21658,
      user: 'avnadmin',
      password: 'AVNS_n9nWd4pJ4DoJxZinQ_V',
      database: 'defaultdb',
      ssl: { rejectUnauthorized: true }
    });

    console.log('✅ Conectado ao banco!');
    
    // Teste uma query simples
    const [rows] = await connection.execute('SELECT 1 + 1 as result');
    console.log('✅ Query teste:', rows);
    
    // Teste buscar ovinos
    const [ovinos] = await connection.execute('SELECT COUNT(*) as total FROM ovinos');
    console.log('✅ Total de ovinos:', ovinos[0].total);
    
    await connection.end();
    console.log('🎉 Conexão testada com sucesso!');
    
  } catch (error) {
    console.error('❌ ERRO na conexão:', error);
  }
}

testConnection();