const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET - Atividades recentes (últimos 7 dias)
router.get('/recentes', async (req, res) => {
  try {
    const [atividades] = await pool.execute(`
      SELECT 
        id, tipo, titulo, descricao, 
        animal_id, animal_brinco, data_acao,
        usuario_id, created_at
      FROM atividades 
      WHERE data_acao >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY data_acao DESC
      LIMIT 5 -- AQUI É O TAMANHO DA LISTA
    `);

    res.json(atividades);
  } catch (error) {
    console.error('❌ Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Atividades com filtros
router.get('/', async (req, res) => {
  try {
    const { dias = 7, tipo, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        id, tipo, titulo, descricao, 
        animal_id, animal_brinco, data_acao,
        usuario_id, created_at
      FROM atividades 
      WHERE 1=1
    `;
    
    const params = [];

    if (dias) {
      query += ' AND data_acao >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      params.push(parseInt(dias));
    }

    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }

    query += ' ORDER BY data_acao DESC LIMIT ?';
    params.push(parseInt(limit));

    const [atividades] = await pool.execute(query, params);
    res.json(atividades);

  } catch (error) {
    console.error('❌ Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;