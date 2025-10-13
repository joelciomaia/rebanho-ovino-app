const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

// Registrar criador (produtor)
exports.registrar = async (req, res) => {
  try {
    const {
      nomeCompleto,
      email,
      telefoneWhatsapp,
      preferenciaRecuperacao,
      senha,
      cabanha
    } = req.body;

    console.log('Dados recebidos para registro:', req.body);

    // verifica se email já existe
    const [existe] = await db.execute("SELECT * FROM criadores WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    // criptografa a senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Insere na tabela CRIADORES com nomes CORRETOS
    const [result] = await db.execute(
      `INSERT INTO criadores 
      (nome_completo, email, telefone_whatsapp, preferencia_recuperacao, senha, 
       cabanha_nome, cabanha_municipio, cabanha_estado, cabanha_localizacao_livre) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomeCompleto,
        email,
        telefoneWhatsapp,
        preferenciaRecuperacao,
        senha_hash,
        cabanha.nome,
        cabanha.municipio,
        cabanha.estado,
        cabanha.localizacaoLivre || ''
      ]
    );

    console.log('Usuário registrado com ID:', result.insertId);

    res.status(201).json({ 
      mensagem: "Cadastro realizado com sucesso!",
      id: result.insertId 
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// Login do criador
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log('Tentativa de login para:', email);

    // Busca na tabela CRIADORES
    const [rows] = await db.execute(
      "SELECT * FROM criadores WHERE email = ? AND ativo = 1", 
      [email]
    );
    
    if (rows.length === 0) {
      console.log('Email não encontrado:', email);
      return res.status(400).json({ erro: "Email ou senha incorretos" });
    }

    const criador = rows[0];
    console.log('Usuário encontrado:', criador.email);

    // compara senha - USA A COLUNA 'senha'
    const senhaValida = await bcrypt.compare(senha, criador.senha);
    if (!senhaValida) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    // gera token
    const token = jwt.sign(
      { 
        id: criador.id, 
        email: criador.email,
        nome: criador.nome_completo,
        cabanha: criador.cabanha_nome
      }, 
      JWT_SECRET, 
      { expiresIn: "24h" }
    );

    // Remove a senha da resposta
    const { senha: _, ...criadorSemSenha } = criador;

    console.log('Login bem-sucedido para:', criador.email);

    res.json({
      mensagem: "Login bem-sucedido",
      token,
      user: criadorSemSenha
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// Buscar perfil do criador
exports.getPerfil = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, nome_completo, email, telefone_whatsapp, preferencia_recuperacao, 
              foto_perfil, data_cadastro, cabanha_nome, cabanha_municipio, cabanha_estado, 
              cabanha_localizacao_livre, cabanha_latitude, cabanha_longitude 
       FROM criadores WHERE id = ? AND ativo = 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Criador não encontrado" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('Erro ao buscar perfil:', err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};

// Atualizar perfil do criador
exports.atualizarPerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nomeCompleto,
      email,
      telefoneWhatsapp,
      preferenciaRecuperacao,
      cabanha
    } = req.body;

    console.log('Atualizando perfil do ID:', id);

    // Verifica se o criador existe
    const [existe] = await db.execute("SELECT id FROM criadores WHERE id = ?", [id]);
    if (existe.length === 0) {
      return res.status(404).json({ erro: "Criador não encontrado" });
    }

    // Atualiza os dados
    await db.execute(
      `UPDATE criadores 
       SET nome_completo = ?, email = ?, telefone_whatsapp = ?, preferencia_recuperacao = ?,
           cabanha_nome = ?, cabanha_municipio = ?, cabanha_estado = ?, cabanha_localizacao_livre = ?
       WHERE id = ?`,
      [
        nomeCompleto,
        email,
        telefoneWhatsapp,
        preferenciaRecuperacao,
        cabanha.nome,
        cabanha.municipio,
        cabanha.estado,
        cabanha.localizacaoLivre || '',
        id
      ]
    );

    console.log('Perfil atualizado com sucesso para ID:', id);

    res.json({ mensagem: "Perfil atualizado com sucesso!" });

  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
};