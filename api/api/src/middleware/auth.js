const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

function auth(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ erro: "Token não fornecido" });

  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ erro: "Token inválido" });
    req.usuario = decoded;
    next();
  });
}

module.exports = auth;
