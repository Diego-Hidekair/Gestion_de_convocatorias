// backend/controllers/convocatoriaController.js
const pool = require('../db');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const getConvocatorias = async (req, res) => {
    const { rol, id } = req.user;  // Extraer el rol y el id del usuario autenticado

    try {
        let query;
        let values;

        if (rol === 'admin') {
            // Si es admin, mostrar todas las convocatorias
            query = `
                SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin,
                       tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                       ca.nombre_carrera AS nombre_carrera, 
                       f.nombre_facultad AS nombre_facultad
                FROM convocatorias c
                LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
                LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
                LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
                ORDER BY c.cod_convocatoria
            `;
            values = [];
        } else {
            // Si es otro rol, mostrar solo las convocatorias creadas por ese usuario
            query = `
                SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin,
                       tc.nombre_convocatoria AS nombre_tipoconvocatoria, 
                       ca.nombre_carrera AS nombre_carrera, 
                       f.nombre_facultad AS nombre_facultad
                FROM convocatorias c
                LEFT JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
                LEFT JOIN carrera ca ON c.id_carrera = ca.id_carrera
                LEFT JOIN facultad f ON c.id_facultad = f.id_facultad
                WHERE c.id_usuario = $1
                ORDER BY c.cod_convocatoria
            `;
            values = [id];
        }

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear una nueva convocatoria
const createConvocatoria = async (req, res) => {
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, materias } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO convocatorias (cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad]
        );
        const convocatoria = result.rows[0];

        // Agregar materias a la tabla convocatoria_materia
        if (materias && materias.length > 0) {
            for (const id_materia of materias) {
                await pool.query(
                    'INSERT INTO convocatoria_materia (id_convocatoria, id_materia) VALUES ($1, $2)',
                    [convocatoria.id_convocatoria, id_materia]
                );
            }
        }

        res.status(201).json(convocatoria);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getConvocatoriaById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT c.id_convocatoria, c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, 
                   ca.nombre_carrera AS carrera, 
                   f.nombre_facultad AS facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar una convocatoria existente
const updateConvocatoria = async (req, res) => {
    const { id } = req.params;
    const { cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, materias } = req.body;
    try {
        const result = await pool.query(
            'UPDATE convocatorias SET cod_convocatoria = $1, nombre = $2, fecha_inicio = $3, fecha_fin = $4, id_tipoconvocatoria = $5, id_carrera = $6, id_facultad = $7 WHERE id_convocatoria = $8 RETURNING *',
            [cod_convocatoria, nombre, fecha_inicio, fecha_fin, id_tipoconvocatoria, id_carrera, id_facultad, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const convocatoria = result.rows[0];

        // Actualizar materias en la tabla convocatoria_materia
        await pool.query('DELETE FROM convocatoria_materia WHERE id_convocatoria = $1', [id]);

        if (materias && materias.length > 0) {
            for (const id_materia of materias) {
                await pool.query(
                    'INSERT INTO convocatoria_materia (id_convocatoria, id_materia) VALUES ($1, $2)',
                    [id, id_materia]
                );
            }
        }

        res.json(convocatoria);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Estado de la convocatoria
const getConvocatoriasWithEstado = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT ROW_NUMBER() OVER (ORDER BY cod_convocatoria) AS numero,
                   id_convocatoria, cod_convocatoria, nombre, fecha_inicio, fecha_fin, estado 
            FROM convocatorias
            ORDER BY cod_convocatoria
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al obtener convocatorias' });
    }
}; 

// Actualizar el estado de la convocatoria
const updateConvocatoriaEstado = async (req, res) => {
    const { id_convocatoria } = req.params;
    const { estado } = req.body;

    try {
        const result = await pool.query(
            'UPDATE convocatorias SET estado = $1 WHERE id_convocatoria = $2 RETURNING *',
            [estado, id_convocatoria]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        res.json({ message: 'Estado actualizado correctamente', convocatoria: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
};

// Eliminar una convocatoria
const deleteConvocatoria = async (req, res) => {
    const { id } = req.params;
    try {
        // Eliminar las materias asociadas a la convocatoria
        await pool.query('DELETE FROM convocatoria_materia WHERE id_convocatoria = $1', [id]);

        const result = await pool.query('DELETE FROM convocatorias WHERE id_convocatoria = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear y combinar PDFs
const createPdf = async (req, res) => {
    const { id_convocatoria } = req.body;
    try {
        // Obtener la convocatoria y sus detalles
        const convocatoria = await pool.query(`
            SELECT c.cod_convocatoria, c.nombre, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, 
                   ca.nombre_carrera AS carrera, 
                   f.nombre_facultad AS facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id_convocatoria]);

        if (convocatoria.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const convocatoriaData = convocatoria.rows[0];

        // Obtener materias asociadas a la convocatoria
        const materias = await pool.query(`
            SELECT m.nombre, cm.horas_teoria + cm.horas_practica + cm.horas_laboratorio AS total_horas
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materiasData = materias.rows.map(m => `Materia: ${m.nombre}, Horas: ${m.total_horas}`).join('\n');

        // Crear PDF con la información de la convocatoria
        const pdfPath = path.join(__dirname, '../pdfs', `${convocatoriaData.nombre}.pdf`);
        const pdfContent = `
            Código de Convocatoria: ${convocatoriaData.cod_convocatoria}
            Nombre: ${convocatoriaData.nombre}
            Fecha de Inicio: ${convocatoriaData.fecha_inicio.toLocaleDateString()}
            Fecha de Fin: ${convocatoriaData.fecha_fin ? convocatoriaData.fecha_fin.toLocaleDateString() : 'N/A'}
            Tipo de Convocatoria: ${convocatoriaData.tipo_convocatoria}
            Carrera: ${convocatoriaData.carrera}
            Facultad: ${convocatoriaData.facultad}
            Materias: 
            ${materiasData}
        `;

        // Crear un nuevo PDF con pdf-lib
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText(pdfContent, { x: 50, y: 700 });

        // Guardar el PDF en el servidor
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(pdfPath, pdfBytes);

        res.status(201).json({ message: 'PDF creado y guardado correctamente', pdfPath });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error al crear PDF' });
    }
};

module.exports = { getConvocatorias, getConvocatoriaById, createConvocatoria, updateConvocatoria, deleteConvocatoria, updateConvocatoriaEstado, getConvocatoriasWithEstado, createPdf };
