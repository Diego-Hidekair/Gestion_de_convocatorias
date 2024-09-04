// backend/routes/pdfRoutes.js

const fs = require('fs');
const path = require('path');
const express = require('express');
const { createPdf } = require('../controllers/pdfController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Modificar la ruta para aceptar archivos
router.post('/create', upload.array('documentos'), createPdf);

router.get('/view/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, `../pdfs/${fileName}`);

    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

module.exports = router;
