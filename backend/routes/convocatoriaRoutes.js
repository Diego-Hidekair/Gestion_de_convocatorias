const express = require('express');
const {
    getConvocatorias,
    createConvocatoria,
    updateConvocatoria,
    deleteConvocatoria,
    getConvocatoriaById
} = require('../controllers/convocatoriaController.js');

const router = express.Router();

router.get('/convocatorias', getConvocatorias);
router.post('/convocatorias', createConvocatoria);
router.put('/convocatorias/:id', updateConvocatoria);
router.delete('/convocatorias/:id', deleteConvocatoria);
router.get('/convocatorias/:id', getConvocatoriaById);

module.exports = router;
