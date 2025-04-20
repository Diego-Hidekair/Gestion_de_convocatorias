// backend/routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const { createUser, upload, getUsuarios, deleteUser, updateUser, getCurrentUser, getUsuarioById } = require('../controllers/usuarioController');
const { authenticateToken, authorizeAdmin, verificarRol } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, getCurrentUser);
router.get('/', authenticateToken, authorizeAdmin, getUsuarios);
router.get('/:id_usuario', authenticateToken, getUsuarioById);

// Ruta para crear usuario con manejo de archivos
//router.post('/', authenticateToken, verificarRol('admin', 'secretaria_de_decanatura'), (req, res, next) => {    upload(req, res, (err) => { if (err) { return res.status(400).json({ error: err.message });} next();});},createUser);
//router.post('/', authenticateToken,  verificarRol('admin', 'secretaria_de_decanatura'), (req, res, next) => { upload(req, res, function(err) { if (err) { return res.status(400).json({ error: err.message }); } if (!req.file && !req.body.foto_url) { req.body.foto_perfil = null; } next(); }); }, createUser);
router.post('/', 
    authenticateToken, 
    verificarRol('admin', 'secretaria_de_decanatura'),
    (req, res, next) => {
      upload.single('foto_perfil')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ error: err.message });
        } else if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    },
    createUser
  );
router.delete('/:id_usuario', authenticateToken, authorizeAdmin, deleteUser);
router.put('/:id_usuario', authenticateToken, authorizeAdmin, updateUser);

module.exports = router;