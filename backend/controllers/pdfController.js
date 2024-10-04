// backend/controllers/pdfController.js
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Pool } = require('pg');
const { PDFDocument: PDFLibDocument } = require('pdf-lib');  // Usaremos pdf-lib para combinar
//configuracion para verificar la conexion a la base de datos
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para generar el PDF (esta no la tocamos)
exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
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

        // Obtener los honorarios asociados a la convocatoria
        const honorariosResult = await pool.query(`
            SELECT h.pago_mensual, tc.nombre_convocatoria AS tipo_convocatoria
            FROM honorarios h
            JOIN tipo_convocatoria tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
            WHERE h.id_convocatoria = $1 AND h.id_honorario = $2
        `, [id_convocatoria, id_honorario]);

        const honorarios = honorariosResult.rows[0]; // Primer resultado

        // Crear la ruta del PDF
        const pdfDirectory = path.join(__dirname, '..', 'pdfs');
        const pdfPath = path.join(pdfDirectory, `convocatoria_${id_convocatoria}.pdf`);

        // Asegura que el directorio de PDFs exista
        if (!fs.existsSync(pdfDirectory)) {
            fs.mkdirSync(pdfDirectory, { recursive: true });
        }

        // Crear el documento PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        // Agregar contenido al PDF
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

        // Actualizar la base de datos con la ruta del PDF generado
        await pool.query('UPDATE documentos SET documento_path = $1 WHERE id_convocatoria = $2', [pdfPath, id_convocatoria]);

        res.status(200).json({ message: 'PDF generado con éxito', pdfPath });

    } catch (error) {
        console.error('Error generando el PDF:', error);
        res.status(500).json({ error: 'Error generando el PDF' });
    }
};

// función para combinar PDFs
exports.combinePDFs = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        // Rutas de los PDFs a combinar
        const basePDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}.pdf`);
        const resolucionPath = req.body.resolucion_path || null;
        const dictamenPath = req.body.dictamen_path || null;
        const cartaPath = req.body.carta_path || null;

        // Verificar si el archivo base existe
        if (!fs.existsSync(basePDFPath)) {
            return res.status(404).json({ error: 'PDF base no encontrado' });
        }

        // Cargar el PDF base
        const basePDFBytes = fs.readFileSync(basePDFPath);
        const basePDFDoc = await PDFLibDocument.load(basePDFBytes);

        // Agregar los otros PDFs si existen
        if (resolucionPath && fs.existsSync(resolucionPath)) {
            const resolucionBytes = fs.readFileSync(resolucionPath);
            const resolucionDoc = await PDFLibDocument.load(resolucionBytes);
            const pages = await basePDFDoc.copyPages(resolucionDoc, resolucionDoc.getPageIndices());
            pages.forEach((page) => basePDFDoc.addPage(page));
        }

        if (dictamenPath && fs.existsSync(dictamenPath)) {
            const dictamenBytes = fs.readFileSync(dictamenPath);
            const dictamenDoc = await PDFLibDocument.load(dictamenBytes);
            const pages = await basePDFDoc.copyPages(dictamenDoc, dictamenDoc.getPageIndices());
            pages.forEach((page) => basePDFDoc.addPage(page));
        }

        if (cartaPath && fs.existsSync(cartaPath)) {
            const cartaBytes = fs.readFileSync(cartaPath);
            const cartaDoc = await PDFLibDocument.load(cartaBytes);
            const pages = await basePDFDoc.copyPages(cartaDoc, cartaDoc.getPageIndices());
            pages.forEach((page) => basePDFDoc.addPage(page));
        }

        // Guardar el PDF combinado
        const combinedPDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}_combinado.pdf`);
        const combinedPDFBytes = await basePDFDoc.save();
        fs.writeFileSync(combinedPDFPath, combinedPDFBytes);

        // Actualizar la base de datos con la ruta del PDF combinado
        await pool.query('UPDATE documentos SET resolucion_path = $1, dictamen_path = $2, carta_path = $3 WHERE id_convocatoria = $4', 
            [resolucionPath, dictamenPath, cartaPath, id_convocatoria]);

        res.status(200).json({ message: 'PDF combinado con éxito', combinedPDFPath });

    } catch (error) {
        console.error('Error combinando los PDFs:', error);
        res.status(500).json({ error: 'Error combinando los PDFs' });
    }
};

// función para ver el PDF combinado
exports.viewCombinedPDF = (req, res) => {
    const { id_convocatoria } = req.params;
    const combinedPDFPath = path.join(__dirname, '..', 'pdfs', `convocatoria_${id_convocatoria}_combinado.pdf`);

    if (fs.existsSync(combinedPDFPath)) {
        res.sendFile(combinedPDFPath);
    } else {
        res.status(404).json({ error: 'PDF combinado no encontrado' });
    }
};