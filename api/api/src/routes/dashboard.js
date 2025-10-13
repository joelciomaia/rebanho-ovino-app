const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/auth");

// todas as rotas do dashboard precisam estar autenticadas
router.get("/", authMiddleware, dashboardController.getResumo);

module.exports = router;
