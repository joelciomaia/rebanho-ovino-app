const express = require('express');
const router = express.Router();
const manejoController = require('../controllers/manejoController');

// ============================================================
// Rotas para /manejos
// ============================================================

// GET /manejos?ovino_id=xxx - Buscar manejos por ovino_id
// GET /manejos - Buscar todos os manejos
// ⚠️ As duas rotas acima conflitam! Vamos unir em uma só:
router.get('/', (req, res) => {
  const { ovino_id } = req.query;
  
  if (ovino_id) {
    // Se tem ovino_id, busca por ovino específico
    return manejoController.getByOvinoId(req, res);
  } else {
    // Se não tem ovino_id, busca todos
    return manejoController.getAll(req, res);
  }
});

// GET /manejos/:id - Buscar manejo por ID
router.get('/:id', manejoController.getById);

// POST /manejos - Criar novo manejo
router.post('/', manejoController.create);

// PUT /manejos/:id - Atualizar manejo
router.put('/:id', manejoController.update);

// DELETE /manejos/:id - Deletar manejo
router.delete('/:id', manejoController.delete);

module.exports = router;