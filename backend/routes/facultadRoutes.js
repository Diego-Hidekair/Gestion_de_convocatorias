const express = require('express');
const router = express.Router();
const facultadController = require('../controllers/facultadController');

router.get('/', facultadController.getFacultades);
router.post('/', facultadController.createFacultad);
router.put('/:id', facultadController.updateFacultad);
router.delete('/:id', facultadController.deleteFacultad);
router.get('/:id', facultadController.getFacultadById);

module.exports = router;
