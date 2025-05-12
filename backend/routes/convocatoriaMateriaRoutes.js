// backend/routes/convocatoriaMateriaRoutes.js
// backend/routes/convocatoriaMateriaRoutes.js
const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/convocatoriaMateriaController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.post('/:id/materias',     authenticateToken, secretariaOnly, materiaController.addMaterias);
router.get('/:id/materias', authenticateToken, materiaController.getMateriasByConvocatoria);
router.delete('/:id/materias/:id_materia', authenticateToken, secretariaOnly, materiaController.deleteMateria);

module.exports = router;    