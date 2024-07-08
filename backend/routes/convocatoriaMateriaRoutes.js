// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const {
    addMateriaToConvocatoria,
    getMateriasByConvocatoria
} = require('../controllers/convocatoriaMateriaController');

router.post('/', addMateriaToConvocatoria);
router.get('/:id_convocatoria', getMateriasByConvocatoria);
module.exports = router;
