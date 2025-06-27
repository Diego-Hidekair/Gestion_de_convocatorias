// backend/routes/pdfRoutes.js
const express = require('express');
const router = express.Router();

const { generateAndSavePDF, viewPDF } = require('../controllers/pdfController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const secretariaOnly = authorizeRoles(['secretaria_de_decanatura']);

router.use(authenticateToken);

// Generar PDF y guardarlo
router.post('/:id/generar', secretariaOnly, generateAndSavePDF);

// Ver PDF guardado
router.get('/:id/ver', viewPDF);

module.exports = router;
