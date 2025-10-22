const pool = require('../config/db');
const crypto = require('crypto');

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
        o.nome as ovino_nome,
        GROUP_CONCAT(mt.tipo_codigo) as tipos
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      LEFT JOIN manejo_tipos mt ON m.id = mt.manejo_id
      WHERE m.ovino_id = ?
      GROUP BY m.id
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
        o.nome as ovino_nome,
        GROUP_CONCAT(mt.tipo_codigo) as tipos
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      LEFT JOIN manejo_tipos mt ON m.id = mt.manejo_id
      WHERE m.id = ?
      GROUP BY m.id
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
// POST - Criar manejo COMPLETO (substitui o createBasico)
// ============================================================
exports.create = async (req, res) => {
  try {
    const {
      produtor_id,
      ovino_id,
      tipos = [],
      data = new Date(),
      observacao,
      
      // Dados físicos
      fisico_casqueamento_realizado,
      fisico_casqueamento_observacao,
      fisico_tosquia,
      fisico_caudectomia,
      fisico_descorna,
      fisico_castracao,
      
      // Dados técnicos
      tecnico_peso,
      tecnico_escore_corporal,
      tecnico_temperatura,
      
      // Sanitário
      sanitario_famacha,
      sanitario_opg,

      // Reprodutivo
      reprodutivo_acao,
      reprodutivo_tipo_parto,
      reprodutivo_habilidade_materna,
      reprodutivo_quantidade_filhotes,

      // Nutricional
      nutricional_tipo_alimentacao,
      nutricional_quantidade,
      nutricional_suplemento
    } = req.body;

    // Validações
    if (!ovino_id || !produtor_id || !tipos.length) {
      return res.status(400).json({ error: 'ovino_id, produtor_id e tipos são obrigatórios' });
    }

    console.log('🔍 [MANEJOS] Criando manejo para ovino:', ovino_id, 'Tipos:', tipos);

    const id = crypto.randomUUID();

    // INSERT COMPLETO COM TODOS OS CAMPOS
    const query = `
      INSERT INTO manejos (
        id, produtor_id, ovino_id, data, observacao,
        fisico_casqueamento_realizado, fisico_casqueamento_observacao,
        fisico_tosquia, fisico_caudectomia, fisico_descorna, fisico_castracao,
        tecnico_peso, tecnico_escore_corporal, tecnico_temperatura,
        sanitario_famacha, sanitario_opg,
        reprodutivo_acao, reprodutivo_tipo_parto, reprodutivo_habilidade_materna, reprodutivo_quantidade_filhotes,
        nutricional_tipo_alimentacao, nutricional_quantidade, nutricional_suplemento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      produtor_id, 
      ovino_id, 
      data.slice(0, 19).replace('T', ' '),
      observacao || null,
      
      // Físicos
      fisico_casqueamento_realizado || false,
      fisico_casqueamento_observacao || null,
      fisico_tosquia || false,
      fisico_caudectomia || false, 
      fisico_descorna || false,
      fisico_castracao || false,
      
      // Técnicos
      tecnico_peso || null,
      tecnico_escore_corporal || null,
      tecnico_temperatura || null,
      
      // Sanitários
      sanitario_famacha || null,
      sanitario_opg || false,

      // Reprodutivo
      reprodutivo_acao || null,
      reprodutivo_tipo_parto || null,
      reprodutivo_habilidade_materna || null,
      reprodutivo_quantidade_filhotes || null,

      // Nutricional
      nutricional_tipo_alimentacao || null,
      nutricional_quantidade || null,
      nutricional_suplemento || null
    ];

    await pool.execute(query, params);

    // INSERIR OS TIPOS NA TABELA N:N
    for (const tipo of tipos) {
      await pool.execute(
        'INSERT INTO manejo_tipos (manejo_id, tipo_codigo) VALUES (?, ?)',
        [id, tipo]
      );
    }

    // ATUALIZAR DADOS DO ANIMAL SE NECESSÁRIO
    await this.atualizarDadosAnimal(ovino_id, {
      tecnico_peso,
      fisico_castracao
    });

    // ============================================================
    // 🔹 REGISTRAR ATIVIDADE NO DASHBOARD
    // ============================================================
    try {
      // Buscar dados do animal para o brinco
      const [animal] = await pool.execute(
        'SELECT brinco FROM ovinos WHERE id = ?',
        [ovino_id]
      );

      if (animal.length > 0) {
        const ovinoBrinco = animal[0].brinco;
        let tituloAtividade = '';
        let descricaoAtividade = '';

        // Definir título baseado nos tipos de manejo
        if (tipos.includes('vacina')) {
          tituloAtividade = `Vacinação aplicada em ${ovinoBrinco}`;
          descricaoAtividade = observacao || 'Vacinação realizada';
        } else if (tipos.includes('vermifugo')) {
          tituloAtividade = `Vermifugação em ${ovinoBrinco}`;
          descricaoAtividade = observacao || 'Vermifugação realizada';
        } else if (tipos.includes('pesagem')) {
          tituloAtividade = `Pesagem de ${ovinoBrinco}`;
          descricaoAtividade = `Peso registrado: ${tecnico_peso || 'N/A'} kg`;
        } else if (tipos.includes('casqueamento')) {
          tituloAtividade = `Casqueamento em ${ovinoBrinco}`;
          descricaoAtividade = observacao || 'Casqueamento realizado';
        } else {
          tituloAtividade = `Manejo realizado em ${ovinoBrinco}`;
          descricaoAtividade = observacao || `Tipos: ${tipos.join(', ')}`;
        }

        await pool.execute(
          `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            'manejo',
            tituloAtividade,
            descricaoAtividade,
            ovino_id,
            ovinoBrinco,
            req.body.usuario_id || null
          ]
        );

        console.log('✅ Atividade de manejo registrada no dashboard:', tituloAtividade);
      }
    } catch (erroAtividade) {
      console.error('❌ Erro ao registrar atividade (não afeta criação do manejo):', erroAtividade.message);
    }

    console.log('✅ [MANEJOS] Manejo criado com ID:', id, 'Tipos:', tipos);
    
    res.status(201).json({
      message: 'Manejo criado com sucesso',
      id,
      ovino_id,
      tipos
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
// POST - Criar manejos em LOTE
// ============================================================
exports.createLote = async (req, res) => {
  try {
    const {
      produtor_id,
      animais = [], // Array de objetos { id, dados_tecnicos }
      tipos = [], // Tipos de manejo selecionados
      data = new Date(),
      observacao,
      
      // Dados COMUNS a todos os animais
      // Físicos
      fisico_casqueamento_realizado,
      fisico_casqueamento_observacao,
      fisico_tosquia,
      fisico_caudectomia,
      fisico_descorna,
      fisico_castracao,
      
      // Sanitário
      sanitario_famacha,
      sanitario_opg,
      vacinas = [],
      vermifugos = [],
      medicacoes = [],

      // Nutricional
      nutricional_tipo_alimentacao,
      nutricional_quantidade,
      nutricional_suplemento
    } = req.body;

    // Validações
    if (!produtor_id || !animais.length || !tipos.length) {
      return res.status(400).json({ 
        error: 'produtor_id, animais e tipos são obrigatórios' 
      });
    }

    console.log('🔍 [MANEJOS-LOTE] Criando manejos para', animais.length, 'animais. Tipos:', tipos);

    const resultados = [];
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const animal of animais) {
        const manejoId = crypto.randomUUID();
        
        // Dados técnicos INDIVIDUAIS (peso, escore de cada animal)
        const dadosTecnicos = animal.dados_tecnicos || {};
        
        const query = `
          INSERT INTO manejos (
            id, produtor_id, ovino_id, data, observacao,
            fisico_casqueamento_realizado, fisico_casqueamento_observacao,
            fisico_tosquia, fisico_caudectomia, fisico_descorna, fisico_castracao,
            tecnico_peso, tecnico_escore_corporal, tecnico_temperatura,
            sanitario_famacha, sanitario_opg,
            nutricional_tipo_alimentacao, nutricional_quantidade, nutricional_suplemento
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          manejoId,
          produtor_id, 
          animal.id, 
          data.slice(0, 19).replace('T', ' '),
          observacao || null,
          
          // Físicos (comuns)
          fisico_casqueamento_realizado || false,
          fisico_casqueamento_observacao || null,
          fisico_tosquia || false,
          fisico_caudectomia || false, 
          fisico_descorna || false,
          fisico_castracao || false,
          
          // Técnicos (individuais)
          dadosTecnicos.peso || null,
          dadosTecnicos.escore_corporal || null,
          dadosTecnicos.temperatura || null,
          
          // Sanitários (comuns)
          sanitario_famacha || null,
          sanitario_opg || false,

          // Nutricional (comum)
          nutricional_tipo_alimentacao || null,
          nutricional_quantidade || null,
          nutricional_suplemento || null
        ];

        await connection.execute(query, params);

        // INSERIR OS TIPOS NA TABELA N:N
        for (const tipo of tipos) {
          await connection.execute(
            'INSERT INTO manejo_tipos (manejo_id, tipo_codigo) VALUES (?, ?)',
            [manejoId, tipo]
          );
        }

        // ATUALIZAR DADOS DO ANIMAL SE NECESSÁRIO
        if (dadosTecnicos.peso) {
          await connection.execute(
            'UPDATE ovinos SET peso_atual = ? WHERE id = ?',
            [dadosTecnicos.peso, animal.id]
          );
        }

        if (fisico_castracao) {
          await connection.execute(
            'UPDATE ovinos SET categoria = "capão" WHERE id = ?',
            [animal.id]
          );
        }

        resultados.push({
          ovino_id: animal.id,
          manejo_id: manejoId,
          brinco: animal.brinco
        });
      }

      // ============================================================
      // 🔹 REGISTRAR ATIVIDADE EM LOTE NO DASHBOARD
      // ============================================================
      try {
        let tituloAtividade = '';
        let descricaoAtividade = '';

        // Definir título baseado nos tipos de manejo em lote
        if (tipos.includes('vacina')) {
          tituloAtividade = `Vacinação aplicada em ${animais.length} animais`;
          descricaoAtividade = observacao || 'Vacinação em lote realizada';
        } else if (tipos.includes('vermifugo')) {
          tituloAtividade = `Vermifugação em ${animais.length} animais`;
          descricaoAtividade = observacao || 'Vermifugação em lote realizada';
        } else if (tipos.includes('pesagem')) {
          tituloAtividade = `Pesagem realizada em ${animais.length} animais`;
          descricaoAtividade = observacao || 'Pesagem em lote realizada';
        } else {
          tituloAtividade = `Manejo em lote: ${animais.length} animais`;
          descricaoAtividade = observacao || `Tipos: ${tipos.join(', ')}`;
        }

        await connection.execute(
          `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
           VALUES (?, ?, ?, NULL, NULL, ?)`,
          [
            'manejo_lote',
            tituloAtividade,
            descricaoAtividade,
            req.body.usuario_id || null
          ]
        );

        console.log('✅ Atividade de manejo em lote registrada:', tituloAtividade);
      } catch (erroAtividade) {
        console.error('❌ Erro ao registrar atividade em lote:', erroAtividade.message);
      }

      await connection.commit();
      
      console.log('✅ [MANEJOS-LOTE]', resultados.length, 'manejos criados com sucesso');
      
      res.status(201).json({
        message: `${resultados.length} manejos criados com sucesso`,
        resultados,
        tipos
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar manejos em lote:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// FUNÇÃO PARA ATUALIZAR DADOS DO ANIMAL
// ============================================================
exports.atualizarDadosAnimal = async (ovino_id, dadosManejo) => {
  try {
    const { tecnico_peso, fisico_castracao } = dadosManejo;
    
    // ATUALIZAR PESO SE HOUVE
    if (tecnico_peso) {
      await pool.execute(
        'UPDATE ovinos SET peso_atual = ? WHERE id = ?',
        [tecnico_peso, ovino_id]
      );
      console.log('✅ Peso do animal atualizado para:', tecnico_peso);
    }

    // ATUALIZAR CATEGORIA SE CASTROU
    if (fisico_castracao) {
      await pool.execute(
        'UPDATE ovinos SET categoria = "capão" WHERE id = ?',
        [ovino_id]
      );
      console.log('✅ Animal castrado - categoria atualizada para "capão"');
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar dados do animal:', error);
    // Não interrompe o fluxo principal se falhar a atualização
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
// GET - Buscar todos os manejos
// ============================================================
exports.getAll = async (req, res) => {
  try {
    console.log('🔍 [MANEJOS] Buscando todos os manejos...');

    const [manejos] = await pool.execute(`
      SELECT 
        m.*,
        o.brinco as ovino_brinco,
        o.nome as ovino_nome,
        GROUP_CONCAT(mt.tipo_codigo) as tipos
      FROM manejos m
      LEFT JOIN ovinos o ON m.ovino_id = o.id
      LEFT JOIN manejo_tipos mt ON m.id = mt.manejo_id
      GROUP BY m.id
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