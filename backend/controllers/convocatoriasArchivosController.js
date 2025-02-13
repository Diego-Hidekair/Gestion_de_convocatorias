// backend/controllers/convocatoriaArchivosaController.js
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

exports.subirDocumentosAdicionales = async (req, res) => {//subir documentos extra
    const { id_convocatoria } = req.params;

    try {
        if (!req.files) {
            return res.status(400).json({ error: "No se subieron archivos." });
        }
        const { resolucion, dictamen, carta, nota, certificado_item, certificado_resumen_presupuestario } = req.files;

        const convocatoriaArchivoExistente = await pool.query(
            `SELECT id_conv_combinado FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (convocatoriaArchivoExistente.rowCount > 0) {
            await pool.query(
                `UPDATE convocatorias_archivos 
                 SET resolucion = $1, dictamen = $2, carta = $3, nota = $4, certificado_item = $5, certificado_resumen_presupuestario = $6
                 WHERE id_convocatoria = $7`,
                [
                    resolucion?.data, 
                    dictamen?.data,
                    carta?.data,
                    nota?.data,
                    certificado_item?.data,
                    certificado_resumen_presupuestario?.data,
                    id_convocatoria
                ]
            );
        } else {//nuevo registro 
            await pool.query(
                `INSERT INTO convocatorias_archivos 
                 (resolucion, dictamen, carta, nota, certificado_item, certificado_resumen_presupuestario, id_convocatoria) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    resolucion?.data,
                    dictamen?.data,
                    carta?.data,
                    nota?.data,
                    certificado_item?.data,
                    certificado_resumen_presupuestario?.data,
                    id_convocatoria
                ]
            );
        }

        res.status(201).json({ message: "Documentos adicionales subidos correctamente." });
    } catch (error) {
        console.error('Error al subir documentos adicionales:', error);
        res.status(500).json({ error: "Error al subir documentos adicionales." });
    }
};

// Obtener documentos adicionales
exports.obtenerDocumentosAdicionales = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No se encontraron documentos adicionales." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener documentos adicionales:', error);
        res.status(500).json({ error: "Error al obtener documentos adicionales." });
    }
};

// Eliminar documentos adicionales
exports.eliminarDocumentosAdicionales = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        await pool.query(
            `DELETE FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        res.status(200).json({ message: "Documentos adicionales eliminados correctamente." });
    } catch (error) {
        console.error('Error al eliminar documentos adicionales:', error);
        res.status(500).json({ error: "Error al eliminar documentos adicionales." });
    }
};