// backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const carreraController = require('../controllers/carreraController');

router.get('/', carreraController.getCarreras);
router.get('/:id', carreraController.getCarreraById);
router.get('/facultad/:nombre_facultad', carreraController.getCarrerasByFacultad);
router.get('/facultad-id/:id_facultad', carreraController.getCarrerasByFacultadId);

module.exports = router;