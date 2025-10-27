const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

function auth(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.replace('Bearer ', '');

  console.log('🔐 HEADERS:', req.headers);
  console.log('🔐 TOKEN RECEBIDO:', token);

  if (!token) return res.status(403).json({ erro: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.user = decoded;
    next();
  });
}

module.exports = auth;