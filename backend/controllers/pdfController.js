// backend/controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pool } = require('pg');
const pool = new Pool(); // Configura tu pool de PostgreSQL

// Función para generar el PDF
exports.generatePDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        // Obtener los datos de la convocatoria desde la base de datos
        const result = await pool.query('SELECT * FROM convocatorias WHERE id_convocatoria = $1', [id_convocatoria]);
        const convocatoria = result.rows[0];

        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        // Crear el PDF
        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}.pdf`);
        doc.pipe(fs.createWriteStream(pdfPath));

        // Agregar contenido al PDF
        doc.fontSize(16).text(`Convocatoria: ${convocatoria.nombre}`, { align: 'center' });
        doc.text(`Descripción: ${convocatoria.descripcion}`);
        // Agregar más datos relevantes de la convocatoria aquí

        doc.end();

        // Actualizar el path en la base de datos
        await pool.query(
            'UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2',
            [pdfPath, id_convocatoria]
        );

        res.status(200).json({ message: 'PDF generado con éxito', pdfPath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};
