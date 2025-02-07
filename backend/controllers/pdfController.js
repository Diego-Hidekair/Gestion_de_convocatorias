// backend/controllers/pdfController.js
const { Pool } = require('pg');
const pdf = require('html-pdf');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const generarPDFBuffer = (htmlContent, options) => {//generar el pdf desde un html
    return new Promise((resolve, reject) => {
        pdf.create(htmlContent, options).toBuffer((err, buffer) => {
            if (err) {
                console.error('Error al generar PDF:', err);
                reject(err);
            }
            resolve(buffer);
        });
    });
};

const combinarPDFs = async (pdfBuffers) => { //para poder combinar pdfs
    const mergedPdf = await PDFDocument.create();
    for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
};

const guardarDocumentoPDF = async (id_convocatoria, pdfBuffer) => {//para guardar o actualizar el documento en la DB
    const documentoExistente = await pool.query(
        `SELECT id_documentos FROM documentos WHERE id_convocatoria = $1`,
        [id_convocatoria]
    );

    if (documentoExistente.rowCount > 0) {
        console.log(`Actualizando documento existente para id_convocatoria: ${id_convocatoria}`);
        await pool.query(
            `UPDATE documentos SET documento_path = $1, fecha_generacion = CURRENT_TIMESTAMP WHERE id_convocatoria = $2`,
            [pdfBuffer, id_convocatoria]
        );
    } else {
        console.log(`Insertando nuevo documento para id_convocatoria: ${id_convocatoria}`);
        const result = await pool.query(
            `INSERT INTO documentos (documento_path, id_convocatoria) VALUES ($1, $2) RETURNING id_documentos`,
            [pdfBuffer, id_convocatoria]
        );
        return result.rows[0].id_documentos;
    }
};

const guardarConvocatoriaArchivo = async (id_convocatoria, pdfBuffer, id_documentos) => {
    const convocatoriaArchivoExistente = await pool.query(
        `SELECT id_conv_combinado FROM convocatorias_archivos WHERE id_convocatoria = $1`,
        [id_convocatoria]
    );

    if (convocatoriaArchivoExistente.rowCount > 0) {
        console.log(`Actualizando convocatoria_archivo existente para id_convocatoria: ${id_convocatoria}`);
        await pool.query(
            `UPDATE convocatorias_archivos SET convocatoria = $1 WHERE id_convocatoria = $2`,
            [pdfBuffer, id_convocatoria]
        );
    } else {
        console.log(`Insertando nuevo convocatoria_archivo para id_convocatoria: ${id_convocatoria}`);
        await pool.query(
            `INSERT INTO convocatorias_archivos (convocatoria, id_convocatoria, id_documentos) VALUES ($1, $2, $3)`,
            [pdfBuffer, id_convocatoria, id_documentos]
        );
    }
};

exports.generatePDF = async (req, res) => {
    const { id_convocatoria, id_honorario } = req.params;

    try {
        console.log(`Generando PDF para id_convocatoria: ${id_convocatoria}, id_honorario: ${id_honorario}`);
        const convocatoriaResult = await pool.query( //para sacar los datos de las convocatorias
            `SELECT c.nombre, c.fecha_inicio, c.fecha_fin, tc.nombre_convocatoria, 
                    ca.nombre_carrera, f.nombre_facultad
             FROM convocatorias c
             JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
             JOIN alm_programas ca ON c.id_programa = ca.id_programa
             JOIN alm_programas_facultades f ON ca.v_programas_facultades = f.id_facultad
             WHERE c.id_convocatoria = $1`,
            [id_convocatoria]
        );
        console.log('Convocatoria:', convocatoriaResult.rows[0]);

        const convocatoria = convocatoriaResult.rows[0];
        if (!convocatoria) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }
        const honorariosResult = await pool.query(//para sacar los datos de los honroarios
            `SELECT h.pago_mensual, h.dictamen, h.resolucion, tc.nombre_convocatoria
             FROM honorarios h
             JOIN tipos_convocatorias tc ON h.id_tipoconvocatoria = tc.id_tipoconvocatoria
             WHERE h.id_convocatoria = $1 AND h.id_honorario = $2`,
            [id_convocatoria, id_honorario]
        );
        console.log('Honorarios:', honorariosResult.rows[0]);

        const honorarios = honorariosResult.rows[0];
        if (!honorarios) {
            console.error('Error: Honorarios no encontrados para id_convocatoria:', id_convocatoria, 'id_honorario:', id_honorario);
            return res.status(404).json({ error: "Honorarios no encontrados" });
        }

        //pra sacar los datos de materia asociadas a la convocatoria
        const materiasResult = await pool.query(`
            SELECT m.codigomateria, m.nombre AS materia, cm.total_horas, cm.perfil_profesional, cm.tiempo_trabajo
            FROM convocatorias_materias cm
            JOIN planes.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id_convocatoria]);
        console.log('Materias asociadas:', materiasResult.rows);

        const materias = materiasResult.rows;
        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);
        const tiempoTrabajo = materias.length > 0 ? materias[0].tiempo_trabajo : 'No definido';

        //desde aqui se empueza a generar el codgio html para generar el pdf segun el tipo de convcoatoria
        let htmlContent;
        switch (convocatoria.nombre_convocatoria) { 
            case 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA':
                htmlContent = generateConsultoresLineaHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                break;
            case 'DOCENTE EN CALIDAD ORDINARIO':
                htmlContent = generateOrdinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                break;
            case 'DOCENTE EN CALIDAD EXTRAORDINARIO':
                htmlContent = generateExtraordinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo);
                break;
            default:
                return res.status(400).json({ error: `Tipo de convocatoria no aplicable: ${convocatoria.nombre_convocatoria}` });
        }

        const options = { format: 'Letter', border: { top: '3cm', right: '2cm', bottom: '2cm', left: '2cm' } };
        const pdfBuffer = await generarPDFBuffer(htmlContent, options);
        console.log(`PDF generado, tamaño: ${pdfBuffer.length} bytes`);

        await guardarDocumentoPDF(id_convocatoria, pdfBuffer);

        res.status(201).json({ message: "PDF generado y almacenado correctamente." });
    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ error: "Error al generar el PDF." });
    }
};

function generateConsultoresLineaHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
    return `
    <html>
        <head>
            nose que poner </head>
                <body>
                aqui deberia ir el cuerpo
        </body>    
    </html>
    `;
}

function generateOrdinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
    return `
     <html>
        <head>
            nose que poner </head>
                <body>
                aqui deberia ir el cuerpo
        </body>    
    </html>
    `;
}

function generateExtraordinarioHTML(convocatoria, honorarios, materias, totalHoras, tiempoTrabajo) {
    return `
     <html>
        <head>
            nose que poner </head>
                <body>
                aqui deberia ir el cuerpo
        </body>    
    </html>
    `;
}


exports.combinarYGuardarPDFs = async (req, res) => {//combinado y guardado con los documentos que se suben 
    const { id_convocatoria } = req.params;
    const { archivos } = req.body; 

    try {
        const documentoInicial = await pool.query(
            `SELECT documento_path FROM documentos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );
        if (documentoInicial.rows.length === 0) {
            return res.status(404).json({ error: "Documento inicial no encontrado." });
        }
        const pdfInicial = documentoInicial.rows[0].documento_path;  //pdf generado
        const archivosParaCombinar = [pdfInicial, ...archivos];         // Combinar PDFs
        const pdfCombinado = await combinarPDFs(archivosParaCombinar); //pdf combinado
        await guardarDocumentoPDF(id_convocatoria, pdfCombinado);
        res.status(201).json({ message: "PDFs combinados y almacenados correctamente." });
    } catch (error) {
        console.error('Error al combinar y guardar PDFs:', error);
        res.status(500).json({ error: "Error al combinar y guardar los PDFs." });
    }
};

exports.viewCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const result = await pool.query(
            'SELECT documento_path FROM documentos WHERE id_convocatoria = $1',
            [id_convocatoria]
        );

        if (result.rows.length === 0 || !result.rows[0].documento_path) {
            return res.status(404).send('Documento combinado no encontrado.');
        }

        const pdfBuffer = result.rows[0].documento_path;
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error al recuperar el PDF combinado:', error);
        res.status(500).send('Error al recuperar el PDF combinado.');
    }
};

exports.downloadCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const pdfResult = await pool.query(
            `SELECT documento_path FROM documentos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (pdfResult.rows[0] && pdfResult.rows[0].documento_path) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="documento.pdf"');
            res.send(pdfResult.rows[0].documento_path);
        } else {
            res.status(404).json({ error: 'PDF no encontrado' });
        }
    } catch (error) {
        console.error('Error descargando el PDF:', error);
        res.status(500).json({ error: 'Error descargando el PDF' });
    }
};

exports.deletePDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM documentos WHERE id_convocatoria = $1 RETURNING *`,
            [id_convocatoria]
        );

        if (result.rowCount > 0) {
            res.status(200).json({ message: "PDF eliminado correctamente." });
        } else {
            res.status(404).json({ error: "PDF no encontrado." });
        }
    } catch (error) {
        console.error('Error al eliminar el PDF:', error);
        res.status(500).json({ error: "Error al eliminar el PDF." });
    }
};
