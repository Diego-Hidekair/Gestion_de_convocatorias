// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const memoryStorage = multer.memoryStorage();


const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error('Tipo de archivo no soportado. Solo PDF, JPEG o PNG.'), false);
  }
};

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

module.exports = upload;

