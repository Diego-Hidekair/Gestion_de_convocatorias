// routes/categoriaRoutes.js
const express = require('express');
const router = express.Router();
const { getFacultades, createFacultad, updateFacultad, deleteFacultad, getFacultadById, getCarreras, createCarrera, updateCarrera, deleteCarrera,
    getCarreraById, getTipoConvocatorias, createTipoConvocatoria, updateTipoConvocatoria, deleteTipoConvocatoria, getTipoConvocatoriaById} = require('../controllers/categoriaController');

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
router.get('/tipo_convocatorias', getTipoConvocatorias);
router.post('/tipo_convocatorias', createTipoConvocatoria);
router.put('/tipo_convocatorias/:id', updateTipoConvocatoria);
router.delete('/tipo_convocatorias/:id', deleteTipoConvocatoria);
router.get('/tipo_convocatorias/:id', getTipoConvocatoriaById);

module.exports = router;
