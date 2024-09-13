// backend/routes/pdfRoutes.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createPdf } = require('../controllers/pdfController');
const router = express.Router();
const multer = require('multer');

// Configuración de Multer para manejar la subida de archivos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// Ruta para crear el PDF
router.post('/create', upload.fields([{ name: 'resolucion' }, { name: 'dictamen' }]), createPdf);

// Ruta para ver el PDF generado
router.get('/view/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, '../pdfs', fileName);

    // Verificar si el archivo existe
    if (fs.existsSync(filePath)) { 
        res.sendFile(filePath);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

module.exports = router;
