//Backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const carreraController = require('../controllers/carreraController');

router.get('/', carreraController.getCarreras);
router.post('/', carreraController.createCarrera);
router.put('/:id', carreraController.updateCarrera);
router.delete('/:id', carreraController.deleteCarrera);
router.get('/:id', carreraController.getCarreraById);

module.exports = router;
