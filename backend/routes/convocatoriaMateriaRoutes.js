// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const {
    getConvocatoriaMaterias,
    createConvocatoriaMateria,
    updateConvocatoriaMateria,
    deleteConvocatoriaMateria,
} = require('../controllers/convocatoriaMateriaController');

router.get('/:id_convocatoria', getConvocatoriaMaterias);
router.post('/', createConvocatoriaMateria);
router.put('/:id', updateConvocatoriaMateria);
router.delete('/:id', deleteConvocatoriaMateria);

module.exports = router;
