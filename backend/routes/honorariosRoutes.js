// backend/routes/honorariosRoutes.js

const express = require('express');
const router = express.Router();
const honorariosController = require('../controllers/honorariosController');

router.get('/', honorariosController.getHonorarios);
router.get('/:id', honorariosController.getHonorarioById);
router.post('/', honorariosController.createHonorario);
router.put('/:id', honorariosController.updateHonorario);
router.delete('/:id', honorariosController.deleteHonorario);

module.exports = router;
 