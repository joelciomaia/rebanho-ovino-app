const pool = require('../config/db');
const Ovino = require('../models/Ovino');
const ovinoModel = new Ovino(pool);

// ============================================================
// FUNÇÃO AUXILIAR - Padronizar nome da raça mestiça
// ============================================================
const padronizarNomeMestico = async (racaPaiId, racaMaeId) => {
  try {
    const [racaPai] = await pool.execute(
      'SELECT nome FROM racas_ovinas WHERE id = ?', 
      [racaPaiId]
    );
    const [racaMae] = await pool.execute(
      'SELECT nome FROM racas_ovinas WHERE id = ?', 
      [racaMaeId]
    );

    if (racaPai.length === 0 || racaMae.length === 0) {
      return null;
    }

    const nomeRacaPai = racaPai[0].nome;
    const nomeRacaMae = racaMae[0].nome;

    const racas = [nomeRacaPai, nomeRacaMae].sort();
    const nomeMesticoPadronizado = `Mestico ${racas[0]}/${racas[1]}`;

    return nomeMesticoPadronizado;

  } catch (error) {
    console.error('Erro ao padronizar nome mestico:', error);
    return null;
  }
};

// ============================================================
// FUNÇÃO AUXILIAR - Criar ou buscar raça mestiça
// ============================================================
const criarOuBuscarRacaMestica = async (racaPaiId, racaMaeId) => {
  try {
    if (!racaPaiId || !racaMaeId) {
      return null;
    }

    const nomeMesticoPadronizado = await padronizarNomeMestico(racaPaiId, racaMaeId);
    
    if (!nomeMesticoPadronizado) {
      return null;
    }

    console.log('[RAÇA] Buscando raça mestiça padronizada:', nomeMesticoPadronizado);

    const [racaExistente] = await pool.execute(
      'SELECT id FROM racas_ovinas WHERE nome = ?',
      [nomeMesticoPadronizado]
    );

    if (racaExistente.length > 0) {
      console.log('[RAÇA] Raça mestiça já existe:', nomeMesticoPadronizado);
      return racaExistente[0].id;
    }

    console.log('[RAÇA] Criando nova raça mestiça padronizada:', nomeMesticoPadronizado);
    
    const [novaRaca] = await pool.execute(
      'INSERT INTO racas_ovinas (nome, ativa) VALUES (?, 1)',
      [nomeMesticoPadronizado]
    );

    console.log('[RAÇA] Nova raça mestiça criada:', nomeMesticoPadronizado);
    return novaRaca.insertId;

  } catch (error) {
    console.error('Erro ao criar/buscar raça mestiça:', error);
    return null;
  }
};

// ============================================================
// GET - Buscar todos os ovinos
// ============================================================
exports.getAll = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    console.log('[CONTROLLER] Buscando ovinos do produtor:', produtorId);
    const data = await ovinoModel.getAll(produtorId);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar ovinos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// GET - Buscar ovino por ID
// ============================================================
exports.getById = async (req, res) => {
  try {
    const data = await ovinoModel.getById(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar ovino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// POST - Criar novo ovino (nascido ou comprado)
// ============================================================
exports.create = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    if (!req.body.brinco || req.body.brinco.trim() === '') {
      return res.status(400).json({ error: 'Numero do brinco e obrigatorio' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM ovinos WHERE brinco = ? AND situacao = "ativo" AND produtor_id = ?',
      [req.body.brinco, produtorId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Ja existe um animal ativo com este numero de brinco' });
    }

    let raca_id = req.body.raca_id || null;
    
    if (req.body.origem === 'nascido' && req.body.mae_id && req.body.pai_id) {
      try {
        console.log('[RAÇA] Determinando raça automaticamente para cordeiro nascido...');
        
        const [mae] = await pool.execute(
          'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ? AND o.produtor_id = ?', 
          [req.body.mae_id, produtorId]
        );
        const [pai] = await pool.execute(
          'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ? AND o.produtor_id = ?', 
          [req.body.pai_id, produtorId]
        );

        if (mae.length > 0 && pai.length > 0) {
          const racaMae = mae[0].raca_id;
          const racaPai = pai[0].raca_id;

          if (racaMae && racaPai) {
            if (racaMae === racaPai) {
              raca_id = racaMae;
            } else {
              raca_id = await criarOuBuscarRacaMestica(racaPai, racaMae);
            }
          } else if (racaMae && !racaPai) {
            raca_id = racaMae;
          } else if (!racaMae && racaPai) {
            raca_id = racaPai;
          }
        }
      } catch (error) {
        console.error('[RAÇA] Erro ao determinar raça:', error);
      }
    }

    const ovinoData = {
      produtor_id: produtorId,
      brinco: req.body.brinco,
      sexo: req.body.sexo,
      situacao: 'ativo',
      data_nascimento: req.body.data_nascimento || null,
      peso_nascimento: req.body.peso_nascimento || null,
      peso_atual: req.body.origem === 'nascido' ? 
                  (req.body.peso_nascimento || null) : 
                  (req.body.peso_atual || null),
      tipo_parto_nascimento: req.body.tipo_parto_nascimento || null,
      vigor_nascimento: req.body.vigor_nascimento || null,
      mamou_colostro: req.body.mamou_colostro !== undefined ? req.body.mamou_colostro : 1,
      habilidade_materna_nascimento: req.body.habilidade_materna_nascimento || null,
      mae_id: req.body.mae_id || null,
      pai_id: req.body.pai_id || null,
      observacao_nascimento: req.body.observacao_nascimento || null,
      raca_id: raca_id,
      categoria: req.body.categoria || 'outro',
      nome: req.body.nome || null,
      foto_perfil: req.body.foto_perfil || null,
      origem: req.body.origem || 'nascido'
    };

    const data = await ovinoModel.create(ovinoData);

    try {
      const ovinoId = data.insertId || data.id;
      const ovinoBrinco = req.body.brinco;
      let tipoAtividade, tituloAtividade;

      if (req.body.origem === 'nascido') {
        tipoAtividade = 'nascimento';
        tituloAtividade = `${ovinoBrinco} teve paricao registrada`;
      } else {
        tipoAtividade = 'compra';
        tituloAtividade = `${ovinoBrinco} foi comprado`;
      }

      await pool.execute(
        `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          tipoAtividade,
          tituloAtividade,
          req.body.observacao_nascimento || null,
          ovinoId,
          ovinoBrinco,
          produtorId
        ]
      );
    } catch (erroAtividade) {
      console.error('Erro ao registrar atividade:', erroAtividade.message);
    }

    if (req.body.mae_id && req.body.data_nascimento) {
      try {
        const dataParto = req.body.data_nascimento.split('T')[0] || req.body.data_nascimento;

        const [partoExistente] = await pool.execute(
          'SELECT id FROM partos WHERE mae_id = ? AND data_parto = ?',
          [req.body.mae_id, dataParto]
        );

        let partoId;
        if (partoExistente.length > 0) {
          partoId = partoExistente[0].id;
          await pool.execute(
            'UPDATE partos SET numero_cordeiros = numero_cordeiros + 1 WHERE id = ?',
            [partoId]
          );
        } else {
          partoId = require('crypto').randomUUID();
          
          await pool.execute(
            `INSERT INTO partos (id, mae_id, data_parto, tipo_parto, numero_cordeiros, observacoes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              partoId,
              req.body.mae_id,
              dataParto,
              req.body.tipo_parto_nascimento || 'simples',
              1,
              req.body.observacao_nascimento || null
            ]
          );
        }

        await pool.execute(
          `INSERT INTO cordeiros_parto (id, parto_id, cordeiro_id)
           VALUES (UUID(), ?, ?)`,
          [partoId, data.insertId || data.id]
        );

      } catch (erroParto) {
        console.error('Erro ao registrar parto automaticamente:', erroParto.message);
      }
    }

    res.status(201).json({
      message: 'Ovino criado com sucesso',
      id: data.insertId || data.id,
      data: ovinoData
    });
    
  } catch (error) {
    console.error('Erro ao criar ovino:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
};

// ============================================================
// PUT - Atualizar ovino
// ============================================================
exports.update = async (req, res) => {
  try {
    const data = await ovinoModel.update(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar ovino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// DELETE - Deletar ovino
// ============================================================
exports.delete = async (req, res) => {
  try {
    const data = await ovinoModel.delete(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Erro ao deletar ovino:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// GET - Buscar fêmeas gestantes
// ============================================================
exports.getGestantes = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const [results] = await pool.execute(`
      SELECT DISTINCT 
        o.*,
        m.data as data_diagnostico,
        DATE_ADD(m.data, INTERVAL 150 DAY) as previsao_parto,
        DATEDIFF(DATE_ADD(m.data, INTERVAL 150 DAY), CURDATE()) as dias_para_parto
      FROM ovinos o
      JOIN manejos m ON m.ovino_id = o.id
      WHERE o.sexo = 'femea'
        AND o.situacao = 'ativo'
        AND o.produtor_id = ?
        AND m.tipo = 'reprodutivo'
        AND m.reprodutivo_acao LIKE 'diagnostico de prenhez%'
        AND DATE_ADD(m.data, INTERVAL 150 DAY) >= CURDATE()
        AND m.data = (
          SELECT MAX(m2.data)
          FROM manejos m2 
          WHERE m2.ovino_id = o.id 
            AND m2.tipo = 'reprodutivo'
            AND m2.reprodutivo_acao LIKE 'diagnostico de prenhez%'
        )
      ORDER BY previsao_parto
    `, [produtorId]);
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar gestantes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// GET - Fêmeas aptas à maternidade
// ============================================================
exports.getFemeasParaMaternidade = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const dataNascimento = req.query.dataNascimento || new Date().toISOString().split('T')[0];
    
    const [results] = await pool.execute(`
      SELECT 
        id, brinco, nome, raca_id, data_nascimento,
        TIMESTAMPDIFF(MONTH, data_nascimento, ?) as idade_meses
      FROM ovinos 
      WHERE sexo = 'femea' 
        AND situacao = 'ativo'
        AND produtor_id = ?
        AND data_nascimento IS NOT NULL
        AND TIMESTAMPDIFF(MONTH, data_nascimento, ?) >= 6
        AND DATEDIFF(?, data_nascimento) >= 180
      ORDER BY brinco
    `, [dataNascimento, produtorId, dataNascimento, dataNascimento]);
    
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar femeas para maternidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// GET - Machos próprios aptos para reprodução
// ============================================================
exports.getMachosParaReproducao = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const dataNascimento = req.query.dataNascimento || new Date().toISOString().split('T')[0];
    
    const [results] = await pool.execute(`
      SELECT 
        id, brinco, nome, raca_id, data_nascimento,
        categoria, situacao, descarte_data
      FROM ovinos 
      WHERE sexo = 'macho' 
        AND (categoria != 'machocasto' OR categoria IS NULL)
        AND produtor_id = ?
        AND data_nascimento IS NOT NULL
        AND TIMESTAMPDIFF(MONTH, data_nascimento, ?) >= 6
        AND (
          situacao = 'ativo' 
          OR (
            situacao = 'desativado' 
            AND descarte_data IS NOT NULL 
            AND DATEDIFF(?, descarte_data) <= 180
          )
        )
      ORDER BY brinco
    `, [produtorId, dataNascimento, dataNascimento]);
    
    res.json(results);
  } catch (error) {
    console.error('Erro ao buscar machos para reproducao:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// POST - Determinar raça do cordeiro automaticamente
// ============================================================
exports.determinarRacaCordeiro = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const { mae_id, pai_id } = req.body;
    if (!mae_id || !pai_id) return res.status(400).json({ error: 'IDs da mae e pai sao obrigatorios' });

    const [mae] = await pool.execute(
      'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ? AND o.produtor_id = ?', 
      [mae_id, produtorId]
    );
    const [pai] = await pool.execute(
      'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ? AND o.produtor_id = ?', 
      [pai_id, produtorId]
    );

    if (mae.length === 0 || pai.length === 0) {
      return res.status(404).json({ error: 'Genitores nao encontrados' });
    }

    const racaMae = mae[0].raca_id;
    const racaPai = pai[0].raca_id;
    const nomeRacaMae = mae[0].raca_nome;
    const nomeRacaPai = pai[0].raca_nome;

    let racaCordeiro = null;
    let tipo = 'indefinido';
    let nomeRaca = null;

    if (racaMae && racaPai) {
      if (racaMae === racaPai) {
        racaCordeiro = racaMae;
        nomeRaca = nomeRacaMae;
        tipo = 'puro';
      } else {
        const racasOrdenadas = [nomeRacaPai, nomeRacaMae].sort();
        nomeRaca = `Mestico ${racasOrdenadas[0]}/${racasOrdenadas[1]}`;
        
        const [racaExistente] = await pool.execute(
          'SELECT id FROM racas_ovinas WHERE nome = ?',
          [nomeRaca]
        );

        if (racaExistente.length > 0) {
          racaCordeiro = racaExistente[0].id;
        } else {
          const [novaRaca] = await pool.execute(
            'INSERT INTO racas_ovinas (nome, ativa) VALUES (?, 1)',
            [nomeRaca]
          );
          racaCordeiro = novaRaca.insertId;
        }
        tipo = 'mestico';
      }
    } else if (racaMae && !racaPai) {
      racaCordeiro = racaMae;
      nomeRaca = nomeRacaMae;
      tipo = 'herda_mae';
    } else if (!racaMae && racaPai) {
      racaCordeiro = racaPai;
      nomeRaca = nomeRacaPai;
      tipo = 'herda_pai';
    }

    res.json({ 
      raca_id: racaCordeiro,
      nome_raca: nomeRaca,
      tipo: tipo,
      detalhes: {
        raca_mae: nomeRacaMae,
        raca_pai: nomeRacaPai
      }
    });

  } catch (error) {
    console.error('Erro ao determinar raça do cordeiro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ============================================================
// GET - Raças ovinas (tabela racas_ovinas)
// ============================================================
exports.getRacasOvinas = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nome 
      FROM racas_ovinas 
      WHERE ativa = 1 
      ORDER BY nome
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar racas ovinas:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// GET - Listar todas as raças (incluindo mestiças)
// ============================================================
exports.getTodasRacas = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nome, ativa
      FROM racas_ovinas 
      ORDER BY 
        CASE WHEN nome LIKE 'Mestico%' THEN 1 ELSE 0 END,
        nome
    `);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar racas:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// DEBUG - Verificar dados dos animais
// ============================================================
exports.debugOvinos = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const [ovinos] = await pool.execute(`
      SELECT 
        o.id, o.brinco, o.nome, o.sexo, o.raca_id, r.nome as raca_nome,
        o.data_nascimento, o.categoria, o.situacao, o.produtor_id
      FROM ovinos o
      LEFT JOIN racas_ovinas r ON o.raca_id = r.id
      WHERE o.situacao = 'ativo'
        AND o.produtor_id = ?
      ORDER BY o.brinco
      LIMIT 10
    `, [produtorId]);
    
    res.json(ovinos);
  } catch (error) {
    console.error('Erro no debug:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// PUT - Atualizar apenas o status do ovino
// ============================================================
exports.updateStatus = async (req, res) => {
  try {
    const produtorId = req.user?.id;
    if (!produtorId) {
      return res.status(401).json({ error: 'Usuario nao autenticado' });
    }

    const { id } = req.params;
    const { situacao, descarte_data, descarte_observacao, descarte_tipo } = req.body;

    const data = await ovinoModel.updateStatus(id, {
      situacao,
      descarte_data,
      descarte_observacao,
      descarte_tipo
    });

    if (situacao === 'descarte') {
      try {
        const [animal] = await pool.execute(
          'SELECT brinco FROM ovinos WHERE id = ? AND produtor_id = ?',
          [id, produtorId]
        );

        if (animal.length > 0) {
          const ovinoBrinco = animal[0].brinco;
          const tituloAtividade = `${ovinoBrinco} mudou para descarte`;
          const descricaoAtividade = descarte_observacao || `Motivo: ${descarte_tipo || 'nao informado'}`;

          await pool.execute(
            `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              'descarte',
              tituloAtividade,
              descricaoAtividade,
              id,
              ovinoBrinco,
              produtorId
            ]
          );
        }
      } catch (erroAtividade) {
        console.error('Erro ao registrar atividade de descarte:', erroAtividade.message);
      }
    }

    if (situacao === 'ativo' && req.body.situacao_anterior === 'descarte') {
      try {
        const [animal] = await pool.execute(
          'SELECT brinco FROM ovinos WHERE id = ? AND produtor_id = ?',
          [id, produtorId]
        );

        if (animal.length > 0) {
          const ovinoBrinco = animal[0].brinco;
          const tituloAtividade = `${ovinoBrinco} foi reativado`;

          await pool.execute(
            `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              'categoria',
              tituloAtividade,
              'Animal reativado no sistema',
              id,
              ovinoBrinco,
              produtorId
            ]
          );
        }
      } catch (erroAtividade) {
        console.error('Erro ao registrar atividade de reativacao:', erroAtividade.message);
      }
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};