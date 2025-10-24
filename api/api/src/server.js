const express = require("express");
const app = express();
const cors = require("cors");

const produtorRoutes = require("./routes/produtores");
const ovinoRoutes = require("./routes/ovinos");
const manejoRoutes = require('./routes/manejos');
const vacinaRoutes = require("./routes/vacinas");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const atividadesRoutes = require("./routes/atividades");

// ✅ CORREÇÃO: Configurar CORS e body parser ANTES das rotas
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ← ADICIONADO

console.error('🛣️  Configurando rotas...');
console.error('📡 Rota /auth:', !!authRoutes);
console.error('📡 Rota /ovinos:', !!ovinoRoutes);

// rotas principais
app.use("/produtores", produtorRoutes);
app.use("/ovinos", ovinoRoutes);
app.use("/manejos", manejoRoutes);
app.use("/vacinas", vacinaRoutes);
app.use("/auth", authRoutes); 
app.use("/dashboard", dashboardRoutes);
app.use("/api/atividades", atividadesRoutes);

console.error('✅ Todas as rotas configuradas!');

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT} (acesso externo permitido)`));