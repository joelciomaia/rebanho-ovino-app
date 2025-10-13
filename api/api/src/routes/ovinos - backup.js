const express = require('express');
const router = express.Router();
const controller = require('../controllers/ovinoController');

router.get('/', controller.getAll);
router.get('/gestantes', controller.getGestantes); // NOVA ROTA
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;