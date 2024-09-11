// backend/routes/pdfRoutes.js
const fs = require('fs');
const path = require('path');
const express = require('express');
const { createPdf } = require('../controllers/pdfController');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Configuración de Multer para manejar la subida de múltiples archivos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        // Guardar el archivo con su nombre original
        cb(null, file.originalname);
    }
});

// Modificar la ruta para aceptar archivos 'resolucion' y 'dictamen'
router.post('/create', upload.fields([{ name: 'resolucion' }, { name: 'dictamen' }]), createPdf);

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
