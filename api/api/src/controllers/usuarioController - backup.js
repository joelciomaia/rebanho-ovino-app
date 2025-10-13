const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || "segredo123"; // coloca no .env depois

// Registrar usuário
exports.registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // verifica se email já existe
    const [existe] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    // criptografa a senha
    const hash = await bcrypt.hash(senha, 10);

    await db.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, hash]);

    res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ erro: "Usuário não encontrado" });

    const usuario = rows[0];

    // compara senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ erro: "Senha inválida" });

    // gera token
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ mensagem: "Login bem-sucedido", token });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
