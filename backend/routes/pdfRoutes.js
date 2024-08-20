// backend/routes/pdfRoutes.js
const express = require('express');
const { createPdf } = require('../controllers/pdfController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


// Modificar la ruta para aceptar archivos
router.post('/create', upload.array('documentos'), createPdf);

module.exports = router;
