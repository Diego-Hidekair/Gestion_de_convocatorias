//backend/routes/facultadRoutes.js
const express = require('express');
const router = express.Router();
const facultadController = require('../controllers/facultadController');

// Solo las rutas de lectura, ya que la tabla es de solo lectura
router.get('/', facultadController.getFacultades);
router.get('/:id', facultadController.getFacultadById);
router.get('/tipos-convocatorias', facultadController.getTipoConvocatorias);

module.exports = router;
