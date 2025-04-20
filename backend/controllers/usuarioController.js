// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

const getUsuarios = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular
            FROM usuarios
            ORDER BY nombres
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            error: 'Error al obtener usuarios',
            details: error.message  // Agrega esto para más detalles
        });
    }
};
// backend/controllers/usuarioController.js
const createUser = async (req, res) => {
    try {
      console.log("Datos recibidos:", req.body);
      console.log("Archivo recibido:", req.file);
  
      // Validar campos obligatorios
      const requiredFields = ['id_usuario', 'nombres', 'apellido_paterno', 'rol', 'contraseña'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Campos obligatorios faltantes',
          missing: missingFields
        });
      }
  
      // Verificar si usuario ya existe
      const userExists = await pool.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1', 
        [req.body.id_usuario]
      );
      
      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'El ID de usuario ya existe' });
      }
  
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(req.body.contraseña, 10);
  
      // Preparar datos para inserción
      const userData = {
        id_usuario: req.body.id_usuario,
        nombres: req.body.nombres,
        apellido_paterno: req.body.apellido_paterno,
        apellido_materno: req.body.apellido_materno || null,
        rol: req.body.rol,
        contraseña: hashedPassword,
        celular: req.body.celular || null,
        id_programa: req.body.id_programa || null,
        foto_perfil: req.file ? req.file.buffer : (req.body.foto_url || null)
      };
  
      // Insertar en BD
      const result = await pool.query(
        `INSERT INTO usuarios (
          id_usuario, nombres, apellido_paterno, apellido_materno, 
          rol, contraseña, celular, id_programa, foto_perfil
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular`,
        Object.values(userData)
      );
  
      res.status(201).json(result.rows[0]);
      
    } catch (error) {
      console.error('Error completo:', error);
      res.status(500).json({ 
        error: 'Error en el servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  };
const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { nombres, apellido_paterno, apellido_materno, rol, contraseña, celular, id_programa } = req.body;
    try {
        let hashedPassword;
        let updatedUser;

        if (contraseña) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(contraseña, salt);

            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, contraseña = $5, celular = $6, id_programa = $7 
                WHERE id_usuario = $8 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
                [nombres, apellido_paterno, apellido_materno, rol, hashedPassword, celular, id_programa, id_usuario]
            );
        } else {
            updatedUser = await pool.query(
                `UPDATE usuarios SET nombres = $1, apellido_paterno = $2, apellido_materno = $3, rol = $4, celular = $5, id_programa = $6
                WHERE id_usuario = $7 RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
                [nombres, apellido_paterno, apellido_materno, rol, celular, id_programa, id_usuario]
            );
        }

        res.json(updatedUser.rows[0]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al actualizar el usuario' });
    }
};

const deleteUser = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *', [id_usuario]);

        // Si no se eliminó ningún usuario, envía un error 404
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error en el servidor al eliminar el usuario' });
    }
}; 


const getUsuarioById = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const result = await pool.query('SELECT id_usuario, Nombres, Apellido_paterno, Apellido_materno, Rol, Celular FROM usuarios WHERE id_usuario = $1', [id_usuario]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error en el servidor al obtener el usuario' });
    }
};

const getCurrentUser = async (req, res) => {
    const userId = req.user.id_usuario;
    try {
        const result = await pool.query(`
            SELECT u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, u.rol, u.celular,
                p.programa as nombre_carrera, f.facultad as nombre_facultad
            FROM usuarios u
            LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
            LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE u.id_usuario = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ message: 'Error al obtener el usuario actual', error });
    }
};


module.exports = { createUser, getUsuarios, deleteUser, updateUser, getUsuarioById, getCurrentUser, upload} ;