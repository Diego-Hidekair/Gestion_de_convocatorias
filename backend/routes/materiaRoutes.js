// backend/routes/materiaRoutes.js
const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');

// (solo lectura)
router.get('/', materiaController.getAllMaterias); // todas las materias
router.get('/:id', materiaController.getMateriaById); // materia por ID

module.exports = router;
