const pool = require('../config/db');
const Ovino = require('../models/Ovino');
const ovinoModel = new Ovino(pool);

exports.getAll = async (req, res) => {
  const data = await ovinoModel.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await ovinoModel.getById(req.params.id);
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await ovinoModel.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await ovinoModel.update(req.params.id, req.body);
  res.json(data);
};

exports.delete = async (req, res) => {
  const data = await ovinoModel.delete(req.params.id);
  res.json(data);
};

// NOVO MÉTODO: Buscar fêmeas gestantes COM TODOS OS DADOS
exports.getGestantes = async (req, res) => {
  try {
    const [results] = await pool.execute(`
      SELECT DISTINCT 
        o.*,  -- TODOS os campos do ovino
        m.data as data_diagnostico,
        DATE_ADD(m.data, INTERVAL 150 DAY) as previsao_parto,
        DATEDIFF(DATE_ADD(m.data, INTERVAL 150 DAY), CURDATE()) as dias_para_parto
      FROM ovinos o
      JOIN manejos m ON m.ovino_id = o.id
      WHERE o.sexo = 'femea'
        AND o.situacao = 'ativo'
        AND m.tipo = 'reprodutivo'
        AND m.reprodutivo_acao LIKE 'diagnóstico de prenhez%'
        AND DATE_ADD(m.data, INTERVAL 150 DAY) >= CURDATE()
        AND m.data = (
          SELECT MAX(m2.data) 
          FROM manejos m2 
          WHERE m2.ovino_id = o.id 
            AND m2.tipo = 'reprodutivo'
            AND m2.reprodutivo_acao LIKE 'diagnóstico de prenhez%'
        )
      ORDER BY previsao_parto
    `);
    
    res.json(results);
    
  } catch (error) {
    console.error('Erro ao buscar gestantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};