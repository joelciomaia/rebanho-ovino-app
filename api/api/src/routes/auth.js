const express = require("express");
const router = express.Router();
const authController = require("../controllers/usuarioController");

// Rota para registrar usuário
router.post("/register", authController.registrar);

// Rota para login
router.post("/login", authController.login);

// Rota para buscar perfil do criador
router.get("/perfil/:id", authController.getPerfil);

// Rota para atualizar perfil do criador
router.put("/perfil/:id", authController.atualizarPerfil);

module.exports = router;