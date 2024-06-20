// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const { getFacultades, createFacultad, updateFacultad, deleteFacultad, getFacultadById, getCarreras, createCarrera, updateCarrera, deleteCarrera, getCarreraById,getConvocatorias, createConvocatoria, updateConvocatoria, deleteConvocatoria, getConvocatoriaById} = require('../controllers/categoriaController');

// Rutas para facultades
router.get('/facultades', getFacultades);
router.post('/facultades', createFacultad);
router.put('/facultades/:id', updateFacultad);
router.delete('/facultades/:id', deleteFacultad);
router.get('/facultades/:id', getFacultadById);

// Rutas para carreras
router.get('/carreras', getCarreras);
router.post('/carreras', createCarrera);
router.put('/carreras/:id', updateCarrera);
router.delete('/carreras/:id', deleteCarrera);
router.get('/carreras/:id', getCarreraById);

// Rutas para convocatorias
router.get('/convocatorias', getConvocatorias);
router.post('/convocatorias', createConvocatoria);
router.put('/convocatorias/:id', updateConvocatoria);
router.delete('/convocatorias/:id', deleteConvocatoria);
router.get('/convocatorias/:id', getConvocatoriaById);

module.exports = router;
