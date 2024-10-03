// backend/controllers/pdfController.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pool } = require('pg');
const pool = new Pool(); // Configura tu conexión a PostgreSQL

exports.generatePDF = async (req, res) => {
    const { id_convocatoria } = req.params;  // Obtener el ID de la convocatoria

    try {
        console.log("ID Convocatoria recibido:", id_convocatoria);

        // Obtener los datos de la convocatoria
        const convocatoriaResult = await pool.query(`
            SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, ca.nombre_carrera, f.nombre_facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `, [id_convocatoria]);

        const convocatoria = convocatoriaResult.rows[0];
        console.log("Convocatoria obtenida:", convocatoria);

        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        // Obtener las materias asociadas a la convocatoria
        const materiasResult = await pool.query(`
            SELECT m.nombre AS materia, cm.total_horas, cm.perfil_profesional
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);

        const materias = materiasResult.rows;
        console.log("Materias obtenidas:", materias);

        // Obtener los honorarios asociados a la convocatoria
        const honorariosResult = await pool.query(`
            SELECT h.pago_mensual, tc.nombre_convocatoria AS tipo_convocatoria
            FROM honorarios h
            JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_convocatoria = $1
        `, [id_convocatoria]);

        const honorarios = honorariosResult.rows[0]; // Tomar el primer resultado
        console.log("Honorarios obtenidos:", honorarios);

        // Crear el PDF
        const pdfDirectory = path.join(__dirname, '..', 'pdfs');
        const pdfPath = path.join(pdfDirectory, `convocatoria_${id_convocatoria}.pdf`);
        console.log('Ruta de la carpeta PDF:', pdfDirectory);
        console.log('Ruta completa del PDF:', pdfPath);

        // Asegura que el directorio de PDFs exista
        if (!fs.existsSync(pdfDirectory)) {
            console.log('Directorio de PDFs no existe. Creando...');
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        // Encabezado del PDF
        doc.fontSize(16).text('SEGUNDA CONVOCATORIA A CONCURSO DE MÉRITOS', { align: 'center' });
        doc.fontSize(14).text('PARA LA CONTRATACIÓN DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA', { align: 'center' });
        doc.moveDown();

        // Información de la convocatoria
        doc.fontSize(12).text(`Nombre: ${convocatoria.nombre}`);
        doc.text(`Fecha Inicio: ${convocatoria.fecha_inicio}`);
        doc.text(`Fecha Fin: ${convocatoria.fecha_fin}`);
        doc.text(`Tipo de Convocatoria: ${convocatoria.nombre_convocatoria}`);
        doc.text(`Carrera: ${convocatoria.nombre_carrera}`);
        doc.text(`Facultad: ${convocatoria.nombre_facultad}`);
        doc.moveDown();

        // Materias de la convocatoria
        doc.fontSize(12).text('Materias:');
        materias.forEach((materia, index) => {
            doc.text(`${index + 1}. ${materia.materia} - Horas: ${materia.total_horas}, Perfil: ${materia.perfil_profesional}`);
        });
        doc.moveDown();

        // Honorarios
        if (honorarios) {
            doc.text(`Honorarios: ${honorarios.pago_mensual}`);
            doc.text(`Tipo de Convocatoria: ${honorarios.tipo_convocatoria}`);
        }

        // Finalizar y guardar el PDF
        doc.end();
        console.log('PDF generado correctamente:', pdfPath);

        // Actualizar la base de datos con la ruta del PDF generado
        await pool.query('UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2', [pdfPath, id_convocatoria]);

        res.status(200).json({ message: 'PDF generado con éxito', pdfPath });
    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};
