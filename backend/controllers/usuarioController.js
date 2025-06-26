// backend/controllers/usuarioController.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

const rolesSinPrograma = [
  'admin',
  'personal_administrativo',
  'tecnico_vicerrectorado',
  'vicerrectorado'
];

const UserController = {
  async getUsuarios(req, res) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const offset = (page - 1) * limit;

      let query = `
          SELECT 
              u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
              u.rol, u.celular, u.id_programa,
              p.programa AS nombre_programa,
              f.facultad AS nombre_facultad
          FROM usuarios u
          LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
          LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
      `;

      let countQuery = 'SELECT COUNT(*) FROM usuarios';
      const queryParams = [];
      const countParams = [];
      let paramIndex = 1;

      if (search) {
        const searchTerm = `%${search}%`;
        const searchCondition = `
            WHERE u.id_usuario ILIKE $${paramIndex} OR
            u.nombres ILIKE $${paramIndex} OR
            u.apellido_paterno ILIKE $${paramIndex} OR
            u.apellido_materno ILIKE $${paramIndex}
        `;
        query += searchCondition;
        countQuery += ' WHERE id_usuario ILIKE $1 OR nombres ILIKE $1 OR apellido_paterno ILIKE $1 OR apellido_materno ILIKE $1';

        queryParams.push(searchTerm);
        countParams.push(searchTerm);
        paramIndex++;
      }

      query += ` ORDER BY u.apellido_paterno, u.apellido_materno, u.nombres LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(parseInt(limit));
      queryParams.push(offset);

      const [usersResult, countResult] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, countParams)
      ]);

      // Ocultar programa/carrera para roles sin programa
      const usuarios = usersResult.rows.map(u => {
        if (rolesSinPrograma.includes(u.rol)) {
          return {
            ...u,
            id_programa: null,
            nombre_programa: null,
            nombre_facultad: null
          };
        }
        return u;
      });

      const totalUsers = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        data: usuarios,
        pagination: {
          total: totalUsers,
          totalPages,
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        error: 'Error al obtener usuarios',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async createUser(req, res) {
    try {
      console.log("Datos recibidos:", req.body);
      console.log("Archivo recibido:", req.file);

      const {
        id_usuario,
        nombres,
        apellido_paterno,
        apellido_materno,
        rol,
        contrasena,
        celular,
        id_programa
      } = req.body;

      const requierePrograma = !rolesSinPrograma.includes(rol);

      if (!id_usuario || !nombres?.trim() || !apellido_paterno || !rol || !contrasena) {
        return res.status(400).json({
          error: 'Campos obligatorios faltantes',
          details: {
            id_usuario: !id_usuario,
            nombres: !nombres?.trim(),
            apellido_paterno: !apellido_paterno,
            rol: !rol,
            contrasena: !contrasena
          }
        });
      }

      if (requierePrograma && !id_programa) {
        return res.status(400).json({
          error: 'El campo id_programa es obligatorio para este rol'
        });
      }

      const userExists = await pool.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [id_usuario]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ error: 'El ID de usuario ya existe' });
      }

      const hashedPassword = await bcrypt.hash(contrasena, 10);

      const result = await pool.query(
        `INSERT INTO usuarios (
            id_usuario, nombres, apellido_paterno, apellido_materno, 
            rol, contrasena, celular, id_programa, foto_perfil
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
          RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`,
        [
          id_usuario,
          nombres.trim(),
          apellido_paterno,
          apellido_materno || null,
          rol,
          hashedPassword,
          celular || null,
          requierePrograma ? id_programa : null,
          req.file ? req.file.buffer : null
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear usuario:', error);

      let errorMessage = 'Error en el servidor';
      if (error.code === '23505') {
        errorMessage = 'El ID de usuario ya existe';
      } else if (error.code === '23503') {
        errorMessage = 'El programa especificado no existe';
      }

      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async getUsuarioById(req, res) {
    try {
      const { id_usuario } = req.params;

      const result = await pool.query(`
          SELECT 
              u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
              u.rol, u.celular, u.id_programa,
              p.programa AS nombre_programa,
              f.facultad AS nombre_facultad
          FROM usuarios u
          LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
          LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
          WHERE u.id_usuario = $1
      `, [id_usuario]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      let user = result.rows[0];
      if (rolesSinPrograma.includes(user.rol)) {
        user = {
          ...user,
          id_programa: null,
          nombre_programa: null,
          nombre_facultad: null
        };
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        error: 'Error al obtener usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const file = req.file;

      const userCheck = await pool.query(
        'SELECT 1 FROM usuarios WHERE id_usuario = $1',
        [id]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      let query = 'UPDATE usuarios SET ';
      const values = [];
      let paramIndex = 1;
      const setClauses = [];

      const allowedFields = [
        'nombres', 'apellido_paterno', 'apellido_materno',
        'rol', 'celular', 'id_programa'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          setClauses.push(`${field} = $${paramIndex}`);
          values.push(updates[field]);
          paramIndex++;
        }
      });

      if (updates.contrasena) {
        const hashedPassword = await bcrypt.hash(updates.contrasena, 10);
        setClauses.push(`contrasena = $${paramIndex}`);
        values.push(hashedPassword);
        paramIndex++;
      }

      if (file) {
        setClauses.push(`foto_perfil = $${paramIndex}`);
        values.push(file.buffer);
        paramIndex++;
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
      }

      query += setClauses.join(', ') + ` WHERE id_usuario = $${paramIndex} 
          RETURNING id_usuario, nombres, apellido_paterno, apellido_materno, rol, celular, id_programa`;
      values.push(id);

      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);

      let errorMessage = 'Error al actualizar usuario';
      if (error.code === '23503') {
        errorMessage = 'El programa especificado no existe';
      }

      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id_usuario } = req.params;

      const result = await pool.query(
        'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
        [id_usuario]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({
        message: `Usuario ${result.rows[0].id_usuario} eliminado correctamente`
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);

      let errorMessage = 'Error al eliminar usuario';
      if (error.code === '23503') {
        errorMessage = 'No se puede eliminar el usuario porque tiene registros asociados';
      }

      res.status(500).json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  },

  async getCurrentUser(req, res) {
    try {
      console.log('Usuario en req.user:', req.user);

      if (!req.user?.id_usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado correctamente' });
      }

      const result = await pool.query(`
          SELECT 
              u.id_usuario, u.nombres, u.apellido_paterno, u.apellido_materno, 
              u.rol, u.celular, u.id_programa,
              p.programa AS nombre_programa,
              p.id_facultad,
              f.facultad AS nombre_facultad
          FROM usuarios u
          LEFT JOIN datos_universidad.alm_programas p ON u.id_programa = p.id_programa
          LEFT JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
          WHERE u.id_usuario = $1
      `, [req.user.id_usuario]);

      if (result.rows.length === 0) {
        console.error('Usuario no encontrado en BD con ID:', req.user.id_usuario);
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      let userData = result.rows[0];
      if (rolesSinPrograma.includes(userData.rol)) {
        userData = {
          ...userData,
          id_programa: null,
          nombre_programa: null,
          nombre_facultad: null
        };
      }

      res.json({
        id_usuario: userData.id_usuario,
        nombres: userData.nombres,
        apellido_paterno: userData.apellido_paterno,
        apellido_materno: userData.apellido_materno,
        rol: userData.rol,
        celular: userData.celular,
        id_programa: userData.id_programa,
        nombre_programa: userData.nombre_programa,
        id_facultad: userData.id_facultad,
        nombre_facultad: userData.nombre_facultad
      });
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      res.status(500).json({
        error: 'Error al obtener usuario actual',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  }
};

module.exports = UserController;
