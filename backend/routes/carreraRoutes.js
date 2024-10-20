// backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const carreraController = require('../controllers/carreraController');

router.get('/', carreraController.getCarreras);
router.get('/:id', carreraController.getCarreraById);

module.exports = router;
