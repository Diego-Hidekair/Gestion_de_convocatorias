// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const {getFacultades, createFacultad, updateFacultad, deleteFacultad, getCarreras, createCarrera, updateCarrera, deleteCarrera, getConvocatorias, createConvocatoria, updateConvocatoria, deleteConvocatoria } = require('../controllers/categoriaController');

/*// Rutas para Facultades
router.get('/facultades', getFacultades);
router.post('/facultades', createFacultad);
router.put('/facultades/:cod_facultad', updateFacultad);
router.delete('/facultades/:cod_facultad', deleteFacultad);*/

// Rutas para facultades
router.get('/facultades', getFacultades);
router.post('/facultades', createFacultad);
router.put('/facultades/:id', updateFacultad);
router.delete('/facultades/:id', deleteFacultad);

// Rutas para carreras
router.get('/carreras', getCarreras);
router.post('/carreras', createCarrera);
router.put('/carreras/:id', updateCarrera);
router.delete('/carreras/:id', deleteCarrera);

// Rutas para convocatorias
router.get('/convocatorias', getConvocatorias);
router.post('/convocatorias', createConvocatoria);
router.put('/convocatorias/:id', updateConvocatoria);
router.delete('/convocatorias/:id', deleteConvocatoria);

module.exports = router;
