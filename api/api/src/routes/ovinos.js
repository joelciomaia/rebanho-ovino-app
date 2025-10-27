const express = require('express');
const router = express.Router();
const controller = require('../controllers/ovinoController');
const autenticarToken = require('../middleware/auth');

router.get('/', autenticarToken, controller.getAll);
router.get('/debug/ovinos', autenticarToken, controller.debugOvinos);
router.get('/racas-ovinas', controller.getRacasOvinas);
router.get('/gestantes', autenticarToken, controller.getGestantes);
router.get('/femeas-para-maternidade', autenticarToken, controller.getFemeasParaMaternidade);
router.get('/machos-para-reproducao', autenticarToken, controller.getMachosParaReproducao);
router.post('/determinar-raca-cordeiro', autenticarToken, controller.determinarRacaCordeiro);
router.get('/:id', autenticarToken, controller.getById);
router.post('/', autenticarToken, controller.create);
router.put('/:id', autenticarToken, controller.update);
router.delete('/:id', autenticarToken, controller.delete);
router.put('/:id/status', autenticarToken, controller.updateStatus);

module.exports = router;