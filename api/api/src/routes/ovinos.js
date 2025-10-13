const express = require('express');
const router = express.Router();
const controller = require('../controllers/ovinoController');

router.get('/', controller.getAll);
router.get('/debug/ovinos', controller.debugOvinos);
router.get('/racas-ovinas', controller.getRacasOvinas);
router.get('/gestantes', controller.getGestantes);
router.get('/femeas-para-maternidade', controller.getFemeasParaMaternidade);
router.get('/machos-para-reproducao', controller.getMachosParaReproducao);
router.post('/determinar-raca-cordeiro', controller.determinarRacaCordeiro);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.put('/:id/status', controller.updateStatus);

module.exports = router;