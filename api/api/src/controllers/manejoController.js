const pool = require('../config/db');

// ============================================================
// GET - Buscar manejos por ovino_id
// ============================================================

exports.getByOvinoId = async (req, res) => {
  try {
    const { ovino_id } = req.query;
    
    if (!ovino_id) {
      return res.status(400).json({ error: 'ovino_id é obrigatório' });
    }

    console.log('🔍 [MANEJOS] Buscando manejos para ovino_id:', ovino_id);

    const [manejos] = await pool.execute(`
      SELECT 
        m.*,
        o.brinco as ovino_brinco,
        o.nome as ovino_nome
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      WHERE m.ovino_id = ?
      ORDER BY m.data DESC
    `, [ovino_id]);

    console.log('✅ [MANEJOS] Manjos encontrados:', manejos.length);
    res.json(manejos);
    
  } catch (error) {
    console.error('❌ Erro ao buscar manejos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};


// ============================================================
// GET - Buscar manejo por ID
// ============================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 [MANEJOS] Buscando manejo por ID:', id);

    const [manejos] = await pool.execute(`
      SELECT 
        m.*,
        o.brinco as ovino_brinco,
        o.nome as ovino_nome
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      WHERE m.id = ?
    `, [id]);

    if (manejos.length === 0) {
      return res.status(404).json({ error: 'Manejo não encontrado' });
    }

    console.log('✅ [MANEJOS] Manejo encontrado');
    
    res.json(manejos[0]);
    
  } catch (error) {
    console.error('❌ Erro ao buscar manejo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// POST - Criar novo manejo
// ============================================================
exports.create = async (req, res) => {
  try {
    const {
      ovino_id,
      tipo,
      data,
      descricao,
      reprodutivo_acao,
      sanitario_produto,
      sanitario_dosagem,
      nutricao_alimento,
      nutricao_quantidade,
      observacoes
    } = req.body;

    // Validações básicas
    if (!ovino_id || !tipo || !data) {
      return res.status(400).json({ 
        error: 'ovino_id, tipo e data são obrigatórios' 
      });
    }

    console.log('🔍 [MANEJOS] Criando novo manejo:', {
      ovino_id,
      tipo,
      data
    });

    const [result] = await pool.execute(
      `INSERT INTO manejos (
        id, ovino_id, tipo, data, descricao, 
        reprodutivo_acao, sanitario_produto, sanitario_dosagem,
        nutricao_alimento, nutricao_quantidade, observacoes
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ovino_id,
        tipo,
        data,
        descricao || null,
        reprodutivo_acao || null,
        sanitario_produto || null,
        sanitario_dosagem || null,
        nutricao_alimento || null,
        nutricao_quantidade || null,
        observacoes || null
      ]
    );

    console.log('✅ [MANEJOS] Manejo criado com ID:', result.insertId);
    
    res.status(201).json({
      message: 'Manejo criado com sucesso',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar manejo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// PUT - Atualizar manejo
// ============================================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID do manejo é obrigatório' });
    }

    console.log('🔍 [MANEJOS] Atualizando manejo:', id);

    const fields = Object.keys(updateFields);
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updateFields[field]), id];

    const [result] = await pool.execute(
      `UPDATE manejos SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Manejo não encontrado' });
    }

    console.log('✅ [MANEJOS] Manejo atualizado:', id);
    
    res.json({ message: 'Manejo atualizado com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar manejo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// DELETE - Deletar manejo
// ============================================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID do manejo é obrigatório' });
    }

    console.log('🔍 [MANEJOS] Deletando manejo:', id);

    const [result] = await pool.execute(
      'DELETE FROM manejos WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Manejo não encontrado' });
    }

    console.log('✅ [MANEJOS] Manejo deletado:', id);
    
    res.json({ message: 'Manejo deletado com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro ao deletar manejo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// GET - Buscar todos os manejos (opcional)
// ============================================================
exports.getAll = async (req, res) => {
  try {
    console.log('🔍 [MANEJOS] Buscando todos os manejos...');

    const [manejos] = await pool.execute(`
      SELECT 
        m.*,
        o.brinco as ovino_brinco,
        o.nome as ovino_nome
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      ORDER BY m.data DESC
    `);

    console.log('✅ [MANEJOS] Total de manejos encontrados:', manejos.length);
    
    res.json(manejos);
    
  } catch (error) {
    console.error('❌ Erro ao buscar manejos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};