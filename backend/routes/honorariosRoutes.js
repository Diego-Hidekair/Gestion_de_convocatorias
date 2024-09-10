// backend/routes/honorariosRoutes.js

const express = require('express');
const router = express.Router();
const { getHonorarios, getHonorarioById, createHonorario, updateHonorario, deleteHonorario } = require('../controllers/honorariosController');

router.get('/', getHonorarios);
router.get('/:id', getHonorarioById);
router.post('/', createHonorario);
router.put('/:id', updateHonorario);
router.delete('/:id', deleteHonorario);

module.exports = router;
