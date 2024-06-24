// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const {
    getConvocatoriaMaterias,
    createConvocatoriaMateria,
    deleteConvocatoriaMateria
} = require('../controllers/convocatoriaMateriaController');

router.get('/', getConvocatoriaMaterias);
router.post('/', createConvocatoriaMateria);
router.delete('/:id', deleteConvocatoriaMateria);

module.exports = router;
