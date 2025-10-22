const express = require('express');
const router = express.Router();
const manejoController = require('../controllers/manejoController');

// ============================================================
// Rotas para /manejos
// ============================================================

// GET /manejos - Buscar todos OU por ovino_id
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

// POST /manejos/lote - Criar manejos em lote
router.post('/lote', manejoController.createLote);

// POST /manejos - Criar manejo individual
router.post('/', manejoController.create);

// PUT /manejos/:id - Atualizar manejo
router.put('/:id', manejoController.update);

// DELETE /manejos/:id - Deletar manejo
router.delete('/:id', manejoController.delete);

module.exports = router;