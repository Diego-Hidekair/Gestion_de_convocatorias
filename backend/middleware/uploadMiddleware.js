// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 
  },
  fileFilter: fileFilter
});

const handleFileUpload = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      if (err) {
        console.error('Error en upload middleware:', err);
        return res.status(400).json({
          error: 'Error al procesar archivos',
          details: err.message
        });
      }
      
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          error: 'No se subieron archivos',
          details: 'Debe subir al menos un archivo PDF'
        });
      }
      
      console.log('Archivos recibidos:', Object.keys(req.files));
      next();
    });
  };
};

module.exports = { upload, handleFileUpload };