const express = require("express");
const app = express();
const cors = require("cors");

const produtorRoutes = require("./routes/produtores");
const ovinoRoutes = require("./routes/ovinos");
const manejoRoutes = require('./routes/manejos');
const vacinaRoutes = require("./routes/vacinas");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");

app.use(cors());
app.use(express.json());

// rotas principais
app.use("/produtores", produtorRoutes);
app.use("/ovinos", ovinoRoutes);
app.use("/manejos", manejoRoutes);
app.use("/vacinas", vacinaRoutes);
app.use("/auth", authRoutes); 
app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));