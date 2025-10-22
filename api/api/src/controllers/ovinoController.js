const pool = require('../config/db');
const Ovino = require('../models/Ovino');
const ovinoModel = new Ovino(pool);

// ============================================================
// FUNÇÃO AUXILIAR - Padronizar nome da raça mestiça
// ============================================================
const padronizarNomeMestico = async (racaPaiId, racaMaeId) => {
  try {
    // Buscar nomes das raças
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

    // 🔹 PADRONIZAÇÃO: Ordenar alfabeticamente para evitar duplicatas
    const racas = [nomeRacaPai, nomeRacaMae].sort();
    
    // Criar nome padronizado (ex: sempre "Mestiço Dorper/Santa Inês" em ordem alfabética)
    const nomeMesticoPadronizado = `Mestiço ${racas[0]}/${racas[1]}`;

    return nomeMesticoPadronizado;

  } catch (error) {
    console.error('❌ Erro ao padronizar nome mestiço:', error);
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

    // 🔹 Usar nome padronizado
    const nomeMesticoPadronizado = await padronizarNomeMestico(racaPaiId, racaMaeId);
    
    if (!nomeMesticoPadronizado) {
      return null;
    }

    console.log('🔍 [RAÇA] Buscando raça mestiça padronizada:', nomeMesticoPadronizado);

    // Verificar se já existe (agora com nome padronizado)
    const [racaExistente] = await pool.execute(
      'SELECT id FROM racas_ovinas WHERE nome = ?',
      [nomeMesticoPadronizado]
    );

    if (racaExistente.length > 0) {
      console.log('✅ [RAÇA] Raça mestiça já existe:', nomeMesticoPadronizado);
      return racaExistente[0].id;
    }

    // Criar nova raça mestiça padronizada
    console.log('🔍 [RAÇA] Criando nova raça mestiça padronizada:', nomeMesticoPadronizado);
    
    const [novaRaca] = await pool.execute(
      'INSERT INTO racas_ovinas (nome, ativa) VALUES (?, 1)',
      [nomeMesticoPadronizado]
    );

    console.log('✅ [RAÇA] Nova raça mestiça criada:', nomeMesticoPadronizado);
    return novaRaca.insertId;

  } catch (error) {
    console.error('❌ Erro ao criar/buscar raça mestiça:', error);
    return null;
  }
};

// ============================================================
// GET - Buscar todos os ovinos
// ============================================================
exports.getAll = async (req, res) => {
  try {
    const data = await ovinoModel.getAll();
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
    if (!req.body.brinco || req.body.brinco.trim() === '') {
      return res.status(400).json({ error: 'Número do brinco é obrigatório' });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM ovinos WHERE brinco = ? AND situacao = "ativo"',
      [req.body.brinco]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um animal ativo com este número de brinco' });
    }

    // DEBUG: Verificar dados recebidos
    console.log('🔍 [DEBUG] Dados recebidos no create:', {
      peso_nascimento: req.body.peso_nascimento,
      peso_atual: req.body.peso_atual,
      origem: req.body.origem,
      mae_id: req.body.mae_id,
      pai_id: req.body.pai_id
    });

    // 🔹 DETERMINAR RAÇA AUTOMATICAMENTE PARA NASCIDOS
    let raca_id = req.body.raca_id || null;
    
    if (req.body.origem === 'nascido' && req.body.mae_id && req.body.pai_id) {
      try {
        console.log('🔍 [RAÇA] Determinando raça automaticamente para cordeiro nascido...');
        
        // Buscar raças dos genitores
        const [mae] = await pool.execute(
          'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ?', 
          [req.body.mae_id]
        );
        const [pai] = await pool.execute(
          'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ?', 
          [req.body.pai_id]
        );

        if (mae.length > 0 && pai.length > 0) {
          const racaMae = mae[0].raca_id;
          const racaPai = pai[0].raca_id;
          const nomeRacaMae = mae[0].raca_nome;
          const nomeRacaPai = pai[0].raca_nome;

          console.log('🔍 [RAÇA] Genitores:', {
            mae: { id: racaMae, nome: nomeRacaMae },
            pai: { id: racaPai, nome: nomeRacaPai }
          });

          // Lógica para determinar a raça
          if (racaMae && racaPai) {
            if (racaMae === racaPai) {
              // mesma raça = puro
              raca_id = racaMae;
              console.log('✅ [RAÇA] Cordeiro será da mesma raça dos pais:', nomeRacaMae);
            } else {
              // raças diferentes = mestiço (usando função padronizada)
              raca_id = await criarOuBuscarRacaMestica(racaPai, racaMae);
              console.log('✅ [RAÇA] Cordeiro será mestiço com raça_id:', raca_id);
            }
          } else if (racaMae && !racaPai) {
            raca_id = racaMae;
            console.log('✅ [RAÇA] Cordeiro herda raça da mãe:', nomeRacaMae);
          } else if (!racaMae && racaPai) {
            raca_id = racaPai;
            console.log('✅ [RAÇA] Cordeiro herda raça do pai:', nomeRacaPai);
          } else {
            console.log('⚠️ [RAÇA] Ambos os genitores sem raça definida');
          }
        }
      } catch (error) {
        console.error('❌ [RAÇA] Erro ao determinar raça:', error);
      }
    }

    const ovinoData = {
      produtor_id: req.body.produtor_id || 'default-produtor-id',
      brinco: req.body.brinco,
      sexo: req.body.sexo,
      situacao: 'ativo',

      // Nascimento
      data_nascimento: req.body.data_nascimento || null,
      peso_nascimento: req.body.peso_nascimento || null,
      
      // ✅ CORREÇÃO: Campo peso_atual definido UMA ÚNICA VEZ
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

      // Compra
      raca_id: raca_id, // 🔹 Agora com a raça determinada automaticamente
      categoria: req.body.categoria || 'outro',
      nome: req.body.nome || null,
      foto_perfil: req.body.foto_perfil || null,
      origem: req.body.origem || 'nascido'
    };

    // DEBUG: Verificar dados antes de criar
    console.log('🔍 [DEBUG] Dados do ovino antes de criar:', {
      peso_nascimento: ovinoData.peso_nascimento,
      peso_atual: ovinoData.peso_atual,
      origem: ovinoData.origem,
      raca_id: ovinoData.raca_id
    });

    const data = await ovinoModel.create(ovinoData);

    // ============================================================
    // 🔹 REGISTRAR ATIVIDADE NO DASHBOARD
    // ============================================================
    try {
      const ovinoId = data.insertId || data.id;
      const ovinoBrinco = req.body.brinco;
      let tipoAtividade, tituloAtividade;

      if (req.body.origem === 'nascido') {
        tipoAtividade = 'nascimento';
        tituloAtividade = `${ovinoBrinco} teve parição registrada`;
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
          req.body.usuario_id || null
        ]
      );

      console.log('✅ Atividade registrada no dashboard:', tituloAtividade);
    } catch (erroAtividade) {
      console.error('❌ Erro ao registrar atividade (não afeta criação do ovino):', erroAtividade.message);
    }

    // ============================================================
    // 🔹 Registrar parto automaticamente se for cordeiro nascido
    // ============================================================
    if (req.body.mae_id && req.body.data_nascimento) {
      try {
        const dataParto = req.body.data_nascimento.split('T')[0] || req.body.data_nascimento;

        console.log('🔍 [PARTO] Tentando registrar parto:', {
          mae_id: req.body.mae_id,
          dataParto: dataParto,
          tipo_parto: req.body.tipo_parto_nascimento,
          cordeiro_id: data.insertId || data.id
        });

        // Verifica se já existe parto dessa mãe nessa data
        const [partoExistente] = await pool.execute(
          'SELECT id FROM partos WHERE mae_id = ? AND data_parto = ?',
          [req.body.mae_id, dataParto]
        );

        let partoId;
        if (partoExistente.length > 0) {
          partoId = partoExistente[0].id;
          console.log('🔍 [PARTO] Parto existente encontrado:', partoId);
          await pool.execute(
            'UPDATE partos SET numero_cordeiros = numero_cordeiros + 1 WHERE id = ?',
            [partoId]
          );
        } else {
          console.log('🔍 [PARTO] Criando novo parto...');
          
          // ✅ CORREÇÃO: Gerar UUID no Node.js e usar no INSERT
          partoId = require('crypto').randomUUID();
          
          await pool.execute(
            `INSERT INTO partos (id, mae_id, data_parto, tipo_parto, numero_cordeiros, observacoes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              partoId, // ✅ UUID gerado no Node.js
              req.body.mae_id,
              dataParto,
              req.body.tipo_parto_nascimento || 'simples',
              1,
              req.body.observacao_nascimento || null
            ]
          );
          
          console.log('🔍 [PARTO] Novo parto criado com ID:', partoId);
        }

        // Vincula cordeiro ao parto
        console.log('🔍 [PARTO] Vinculando cordeiro ao parto:', { 
          partoId, 
          cordeiroId: data.insertId || data.id 
        });
        
        await pool.execute(
          `INSERT INTO cordeiros_parto (id, parto_id, cordeiro_id)
           VALUES (UUID(), ?, ?)`,
          [partoId, data.insertId || data.id]
        );

        console.log('✅ Parto registrado e cordeiro vinculado com sucesso!');
      } catch (erroParto) {
        console.error('❌ Erro ao registrar parto automaticamente:', erroParto.message);
        console.error('❌ Stack:', erroParto.stack);
      }
    }

    // DEBUG: Verificar dados após criação
    console.log('✅ [DEBUG] Ovino criado com sucesso:', {
      id: data.insertId || data.id,
      peso_nascimento: ovinoData.peso_nascimento,
      peso_atual: ovinoData.peso_atual,
      raca_id: ovinoData.raca_id
    });

    res.status(201).json({
      message: 'Ovino criado com sucesso',
      id: data.insertId || data.id,
      data: ovinoData
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar ovino:', error);
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

// ============================================================
// GET - Fêmeas aptas à maternidade
// ============================================================
exports.getFemeasParaMaternidade = async (req, res) => {
  try {
    const dataNascimento = req.query.dataNascimento || new Date().toISOString().split('T')[0];
    
    console.log('🔍 [BACKEND] Buscando fêmeas para maternidade com data:', dataNascimento);
    
    const [results] = await pool.execute(`
      SELECT 
        id, brinco, nome, raca_id, data_nascimento,
        TIMESTAMPDIFF(MONTH, data_nascimento, ?) as idade_meses
      FROM ovinos 
      WHERE sexo = 'femea' 
        AND situacao = 'ativo'
        AND data_nascimento IS NOT NULL
        AND TIMESTAMPDIFF(MONTH, data_nascimento, ?) >= 6
        AND DATEDIFF(?, data_nascimento) >= 180
      ORDER BY brinco
    `, [dataNascimento, dataNascimento, dataNascimento]);
    
    console.log('🔍 [BACKEND] Fêmeas encontradas:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Erro ao buscar fêmeas para maternidade:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// GET - Machos próprios aptos para reprodução
// ============================================================
exports.getMachosParaReproducao = async (req, res) => {
  try {
    const dataNascimento = req.query.dataNascimento || new Date().toISOString().split('T')[0];
    
    console.log('🔍 [BACKEND] Buscando machos para reprodução com data:', dataNascimento);
    
    const [results] = await pool.execute(`
      SELECT 
        id, brinco, nome, raca_id, data_nascimento,
        categoria, situacao, descarte_data
      FROM ovinos 
      WHERE sexo = 'macho' 
        AND (categoria != 'machocasto' OR categoria IS NULL)
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
    `, [dataNascimento, dataNascimento]);
    
    console.log('🔍 [BACKEND] Machos encontrados:', results.length);
    res.json(results);
  } catch (error) {
    console.error('❌ Erro ao buscar machos para reprodução:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// POST - Determinar raça do cordeiro automaticamente
// ============================================================
exports.determinarRacaCordeiro = async (req, res) => {
  try {
    const { mae_id, pai_id } = req.body;
    if (!mae_id || !pai_id) return res.status(400).json({ error: 'IDs da mãe e pai são obrigatórios' });

    // Buscar raças dos genitores
    const [mae] = await pool.execute(
      'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ?', 
      [mae_id]
    );
    const [pai] = await pool.execute(
      'SELECT o.raca_id, r.nome as raca_nome FROM ovinos o LEFT JOIN racas_ovinas r ON o.raca_id = r.id WHERE o.id = ?', 
      [pai_id]
    );

    if (mae.length === 0 || pai.length === 0) {
      return res.status(404).json({ error: 'Genitores não encontrados' });
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
        // mesma raça = puro
        racaCordeiro = racaMae;
        nomeRaca = nomeRacaMae;
        tipo = 'puro';
      } else {
        // raças diferentes = mestiço (usando nome padronizado)
        const racasOrdenadas = [nomeRacaPai, nomeRacaMae].sort();
        nomeRaca = `Mestiço ${racasOrdenadas[0]}/${racasOrdenadas[1]}`;
        
        // Verifica se já existe essa combinação PADRONIZADA
        const [racaExistente] = await pool.execute(
          'SELECT id FROM racas_ovinas WHERE nome = ?',
          [nomeRaca]
        );

        if (racaExistente.length > 0) {
          racaCordeiro = racaExistente[0].id;
        } else {
          // Cria nova raça mestiça PADRONIZADA
          const [novaRaca] = await pool.execute(
            'INSERT INTO racas_ovinas (nome, ativa) VALUES (?, 1)',
            [nomeRaca]
          );
          racaCordeiro = novaRaca.insertId;
        }
        tipo = 'mestiço';
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
    console.log('🔍 [BACKEND] Buscando raças ovinas...');
    
    const [rows] = await pool.execute(`
      SELECT id, nome 
      FROM racas_ovinas 
      WHERE ativa = 1 
      ORDER BY nome
    `);
    
    console.log('🔍 [BACKEND] Raças encontradas:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erro ao buscar raças ovinas:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// GET - Listar todas as raças (incluindo mestiças)
// ============================================================
exports.getTodasRacas = async (req, res) => {
  try {
    console.log('🔍 [BACKEND] Buscando todas as raças...');
    
    const [rows] = await pool.execute(`
      SELECT id, nome, ativa
      FROM racas_ovinas 
      ORDER BY 
        CASE WHEN nome LIKE 'Mestiço%' THEN 1 ELSE 0 END,
        nome
    `);
    
    console.log('🔍 [BACKEND] Total de raças encontradas:', rows.length);
    res.status(200).json(rows);
  } catch (error) {
    console.error('❌ Erro ao buscar raças:', error);
    res.status(500).json({ error: 'Erro interno do servidor: ' + error.message });
  }
};

// ============================================================
// DEBUG - Verificar dados dos animais
// ============================================================
exports.debugOvinos = async (req, res) => {
  try {
    const [ovinos] = await pool.execute(`
      SELECT 
        o.id, o.brinco, o.nome, o.sexo, o.raca_id, r.nome as raca_nome,
        o.data_nascimento, o.categoria, o.situacao
      FROM ovinos o
      LEFT JOIN racas_ovinas r ON o.raca_id = r.id
      WHERE o.situacao = 'ativo'
      ORDER BY o.brinco
      LIMIT 10
    `);
    
    console.log('🔍 [DEBUG] Primeiros 10 ovinos:', ovinos);
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
    const { id } = req.params;
    const { situacao, descarte_data, descarte_observacao, descarte_tipo } = req.body;

    const data = await ovinoModel.updateStatus(id, {
      situacao,
      descarte_data,
      descarte_observacao,
      descarte_tipo
    });

    // ============================================================
    // 🔹 REGISTRAR ATIVIDADE DE DESCARTE NO DASHBOARD
    // ============================================================
    if (situacao === 'descarte') {
      try {
        // Buscar dados do animal para obter o brinco
        const [animal] = await pool.execute(
          'SELECT brinco FROM ovinos WHERE id = ?',
          [id]
        );

        if (animal.length > 0) {
          const ovinoBrinco = animal[0].brinco;
          const tituloAtividade = `${ovinoBrinco} mudou para descarte`;
          const descricaoAtividade = descarte_observacao || `Motivo: ${descarte_tipo || 'não informado'}`;

          await pool.execute(
            `INSERT INTO atividades (tipo, titulo, descricao, animal_id, animal_brinco, usuario_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              'descarte',
              tituloAtividade,
              descricaoAtividade,
              id,
              ovinoBrinco,
              req.body.usuario_id || null
            ]
          );

          console.log('✅ Atividade de descarte registrada no dashboard:', tituloAtividade);
        }
      } catch (erroAtividade) {
        console.error('❌ Erro ao registrar atividade de descarte:', erroAtividade.message);
      }
    }

    // ============================================================
    // 🔹 REGISTRAR ATIVIDADE DE REATIVAÇÃO
    // ============================================================
    if (situacao === 'ativo' && req.body.situacao_anterior === 'descarte') {
      try {
        const [animal] = await pool.execute(
          'SELECT brinco FROM ovinos WHERE id = ?',
          [id]
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
              req.body.usuario_id || null
            ]
          );

          console.log('✅ Atividade de reativação registrada:', tituloAtividade);
        }
      } catch (erroAtividade) {
        console.error('❌ Erro ao registrar atividade de reativação:', erroAtividade.message);
      }
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};