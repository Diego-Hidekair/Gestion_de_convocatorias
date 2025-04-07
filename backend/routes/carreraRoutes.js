// backend/routes/carreraRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Obtener todas las carreras
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alm_programas');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({ error: 'Error al obtener carreras' });
    }
});

// Obtener carrera por ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM alm_programas WHERE id_programa = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Carrera no encontrada' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener carrera:', error);
        res.status(500).json({ error: 'Error al obtener carrera' });
    }
});

// Obtener carreras por facultad (versión mejorada)
router.get('/facultad/:id_facultad', authenticateToken, async (req, res) => {
    const { id_facultad } = req.params;
    console.log(`Solicitando carreras para facultad ID: ${id_facultad}`);
    
    try {
        // Verificar primero que la facultad existe
        const facultadExists = await pool.query(
            'SELECT 1 FROM alm_programas_facultades WHERE id_facultad = $1', 
            [id_facultad]
        );
        
        if (facultadExists.rows.length === 0) {
            return res.status(404).json({ error: 'Facultad no encontrada' });
        }

        // Obtener las carreras
        const result = await pool.query(
            `SELECT id_programa, nombre_carrera 
             FROM alm_programas 
             WHERE v_programas_facultades = $1
             ORDER BY nombre_carrera`,
            [id_facultad]
        );
        
        console.log(`Carreras encontradas: ${result.rows.length}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener carreras por facultad:', error);
        res.status(500).json({ 
            error: 'Error al obtener carreras', 
            details: error.message 
        });
    }
});

module.exports = router;