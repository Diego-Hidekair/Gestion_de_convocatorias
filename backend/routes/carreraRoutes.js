// backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const carreraController = require('../controllers/carreraController');

router.get('/', carreraController.getCarreras);
router.get('/:id', carreraController.getCarreraById);
router.get('/facultad/:id_facultad', carreraController.getCarrerasByFacultad);

module.exports = router;