// backend/routes/tipoConvocatoriaRoutes.js
const express = require('express');
const router = express.Router();
const { getAllTiposConvocatoria, getTipoConvocatoriaById, createTipoConvocatoria, updateTipoConvocatoria, deleteTipoConvocatoria} = require('../controllers/tipoConvocatoriaController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getAllTiposConvocatoria);
router.get('/:id', getTipoConvocatoriaById);
router.use(authenticateToken);
router.use(authorizeRoles(['admin']));

router.post('/', createTipoConvocatoria);
router.put('/:id', updateTipoConvocatoria);
router.delete('/:id', deleteTipoConvocatoria);

module.exports = router;