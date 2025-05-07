//backend/controllers/convocatoriaArchivosController.js
const pool = require('../db');
const { generatePDF } = require('./pdfController');

// Subir/actualizar archivos
const uploadArchivos = async (req, res) => {
    const { id } = req.params; // id_convocatoria
    
    try {
        // 1. Obtener archivos subidos
        const archivos = {
            doc_conv: req.files['doc_conv']?.[0]?.buffer,
            resolucion: req.files['resolucion']?.[0]?.buffer,
            dictamen: req.files['dictamen']?.[0]?.buffer
        };

        // 2. Generar PDF (si es necesario)
        const convocatoria = await pool.query(`
            SELECT c.*, p.programa, f.facultad 
            FROM convocatorias c
            JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id]);

        if (!convocatoria.rows[0]) {
            throw new Error('Convocatoria no encontrada');
        }

        const materias = await pool.query(`
            SELECT m.materia, m.cod_materia, cm.total_horas
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);

        const pdfBuffer = await generatePDF({
            convocatoria: convocatoria.rows[0],
            materias: materias.rows
        });

        // 3. Guardar en base de datos
        await pool.query(`
            UPDATE convocatorias_archivos SET
                nombre_archivo = $1,
                doc_conv = $2,
                resolucion = $3,
                dictamen = $4,
                fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id_convocatoria = $5
        `, [
            `CONVOCATORIA_${id}.pdf`,
            pdfBuffer,
            archivos.resolucion,
            archivos.dictamen,
            id
        ]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Descargar archivos
const downloadArchivo = async (req, res) => {
    const { id, tipo } = req.params; // tipo puede ser: doc_conv, resolucion, dictamen
    
    try {
        const result = await pool.query(
            `SELECT ${tipo}, nombre_archivo 
             FROM convocatorias_archivos 
             WHERE id_convocatoria = $1`,
            [id]
        );

        if (!result.rows[0] || !result.rows[0][tipo]) {
            return res.status(404).json({ error: 'Archivo no encontrado' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${result.rows[0].nombre_archivo}`);
        res.send(result.rows[0][tipo]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadArchivos, downloadArchivo};