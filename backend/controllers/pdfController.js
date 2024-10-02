// backend/controllers/pdfController.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pool } = require('pg');
const pool = new Pool(); // Configura tu conexión a PostgreSQL

exports.generatePDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        // Obtener los datos de la convocatoria desde la base de datos
        const result = await pool.query('SELECT * FROM convocatorias WHERE id_convocatoria = $1', [id_convocatoria]);
        const convocatoria = result.rows[0];

        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${convocatoria.id_convocatoria}.pdf`);
        doc.pipe(fs.createWriteStream(pdfPath));

        // Encabezado del PDF
        doc.fontSize(14).text('SEGUNDA CONVOCATORIA A CONCURSO DE MÉRITOS PARA LA CONTRATACIÓN', { align: 'center' });
        doc.fontSize(14).text('DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A TIEMPO', { align: 'center' });
        doc.fontSize(14).text('COMPLETO PARA LA CARRERA DE INGENIERIA COMERCIAL POR LA GESTIÓN ACADÉMICA 2/2024.', { align: 'center' });
        doc.moveDown();

        // Cuerpo de la convocatoria
        doc.fontSize(12).text(`Por determinación del Consejo de Carrera de Ingeniería Comercial, mediante Dictamen N° 046; homologado por Resolución del Consejo Facultativo N° 295 de la Facultad de Ciencias Económicas Financieras Administrativas; se convoca a los profesionales en Ingeniería Comercial, al CONCURSO DE MÉRITOS para optar por la docencia universitaria, como Docente Consultor de Línea a Tiempo Completo, para la gestión académica 2/2024.`);
        doc.moveDown();

        // Tabla de materias
        doc.fontSize(12).text('1) MATERIAS OBJETO DE LA CONVOCATORIA:', { underline: true });
        doc.text('ITEM “1” Tiempo Completo');
        doc.text('Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la Universidad Boliviana que cumplan los requisitos mínimos habilitantes de acuerdo al XII Congreso Nacional de Universidades.');
        doc.moveDown();

        // Tabla con las materias
        doc.text('SIGLA       MATERIA                             HORAS SEMANA           PERFIL REQUERIDO', { underline: true });
        doc.text('ICO 221     Contabilidad Intermedia            6                        Ingeniero Comercial');
        doc.text('ICO 431     Econometría                       6                        Ingeniero Comercial');
        doc.text('ICO 741     Análisis Cuantitativo Decisional   6                        Ingeniero Comercial');
        doc.text('ICO 881     Gestión de Calidad                6                        Ingeniero Comercial');
        doc.text('TOTAL HORAS: 24');
        doc.moveDown();

        // Otros detalles
        doc.text('REQUISITOS MÍNIMOS HABILITANTES:');
        doc.text('a) Carta de postulación dirigida al señor Rector, especificando el ítem y las asignaturas a las que postula.');
        doc.text('b) Currículum vitae debidamente documentado, adjuntando fotocopias simples.');
        // Puedes seguir agregando más detalles como en el documento original...
        
        doc.end();

        // Actualizar la base de datos con la ruta del PDF generado
        await pool.query('UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2', [pdfPath, id_convocatoria]);

        res.status(200).json({ message: 'PDF generado con éxito', pdfPath });
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};


