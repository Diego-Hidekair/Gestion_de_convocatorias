// backend/controllers/docenteVicerrectorController.js
const pool = require('../db');

const getDocentes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id_docente, d.nombres, d.apellidos, f.facultad AS nombre_facultad
      FROM datos_universidad.docente d
      LEFT JOIN datos_universidad.alm_programas_facultades f 
        ON d.id_facultad = f.id_facultad
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener docentes:', error);
    res.status(500).json({ error: 'Error al obtener docentes' });
  }
};

const getVicerrectores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.id_vicerector, v.nombre_vicerector, d.nombres, d.apellidos
      FROM vicerrector v
      JOIN datos_universidad.docente d ON v.id_docente = d.id_docente
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener vicerrectores:', error);
    res.status(500).json({ error: 'Error al obtener vicerrectores' });
  }
};

module.exports = {
  getDocentes,
  getVicerrectores
};
