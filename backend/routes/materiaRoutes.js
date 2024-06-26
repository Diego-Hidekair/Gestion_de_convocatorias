// backend/routes/materiaRoutes.js
const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materiaController');

router.get('/', materiaController.getMaterias);
router.post('/', materiaController.createMateria);
router.put('/:id', materiaController.updateMateria);
router.delete('/:id', materiaController.deleteMateria);
router.get('/:id', materiaController.getMateriaById);

module.exports = router;

