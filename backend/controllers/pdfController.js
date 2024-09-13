//backend/controllers/pdfController.js

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function createPdf(req, res) {
    try {
        const { id_convocatoria } = req.body;

        // Obtener los archivos subidos
        const resolucionFile = req.files['resolucion'] ? req.files['resolucion'][0] : null;
        const dictamenFile = req.files['dictamen'] ? req.files['dictamen'][0] : null;

        // Procesar los archivos subidos y guardarlos
        const resolucionPath = resolucionFile ? path.join(__dirname, '../uploads/', resolucionFile.filename) : null;
        const dictamenPath = dictamenFile ? path.join(__dirname, '../uploads/', dictamenFile.filename) : null;

        // Obtener datos de la convocatoria desde la base de datos
        const query = `
            SELECT c.cod_convocatoria, c.nombre AS nombre_convocatoria, c.fecha_inicio, c.fecha_fin, 
                   tc.nombre_convocatoria AS tipo_convocatoria, ca.nombre_carrera AS nombre_carrera, f.nombre_facultad AS nombre_facultad
            FROM convocatorias c
            JOIN tipo_convocatoria tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN carrera ca ON c.id_carrera = ca.id_carrera
            JOIN facultad f ON c.id_facultad = f.id_facultad
            WHERE c.id_convocatoria = $1
        `;
        const result = await pool.query(query, [id_convocatoria]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Convocatoria no encontrada' });
        }

        const convocatoria = result.rows[0];

        // Obtener las materias relacionadas con la convocatoria
        const materiasQuery = `
            SELECT m.codigomateria, m.nombre 
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `;
        const materiasResult = await pool.query(materiasQuery, [id_convocatoria]);
        const materias = materiasResult.rows;

        // Crear el PDF generado
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        const fontSize = 18;
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Añadir contenido al PDF
        page.drawText(`Convocatoria: ${convocatoria.nombre_convocatoria}`, {
            x: 50,
            y: height - 50,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });

        let currentY = height - 100;
        page.drawText('Materias:', {
            x: 50,
            y: currentY,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });

        currentY -= 30;
        materias.forEach((materia, index) => {
            page.drawText(`${index + 1}. ${materia.nombre} - ${materia.codigomateria}`, {
                x: 70,
                y: currentY,
                size: fontSize - 2,
                font: fontRegular,
                color: rgb(0, 0, 0),
            });
            currentY -= 30;
        });

        // Guardar el PDF generado temporalmente
        const generatedPdfBytes = await pdfDoc.save();
        const generatedPdfPath = path.join(__dirname, '../uploads/', `convocatoria_${id_convocatoria}.pdf`);
        fs.writeFileSync(generatedPdfPath, generatedPdfBytes);

        // Ahora combinamos los PDFs
        const pdfPaths = [generatedPdfPath];
        if (resolucionPath) pdfPaths.push(resolucionPath);
        if (dictamenPath) pdfPaths.push(dictamenPath);
        
        const combinedPdfFileName = `N_${convocatoria.cod_convocatoria}_${convocatoria.nombre_convocatoria.replace(/[^\w\s]/gi, '_')}.pdf`;
        const combinedPdfPath = path.join(__dirname, '../pdfs', combinedPdfFileName);
        await combinePDFs(pdfPaths, combinedPdfPath);

        // Guardar en la base de datos los paths de los documentos
        const insertQuery = `
            INSERT INTO GeneracionPDF (id_convocatoria, resolucion_path, dictamen_path, fecha_generacion)
            VALUES ($1, $2, $3, NOW()) RETURNING id_generacion;
        `;
        const resultInsert = await pool.query(insertQuery, [id_convocatoria, resolucionPath, dictamenPath]);
        const id_generacion = resultInsert.rows[0].id_generacion;
        //await pool.query(insertQuery, [combinedPdfPath, resolucionPath, dictamenPath, id_convocatoria]);

        // Enviar el PDF combinado al cliente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${combinedPdfFileName}"`);
        const combinedPdfBytes = fs.readFileSync(combinedPdfPath);
        res.send(combinedPdfBytes);

        // Eliminar los archivos temporales si es necesario
        fs.unlinkSync(generatedPdfPath);
        if (resolucionPath) fs.unlinkSync(resolucionPath);
        if (dictamenPath) fs.unlinkSync(dictamenPath);

    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ error: 'Error al generar el PDF' });
    }
}

async function combinePDFs(pdfPaths, outputPath) {
    const pdfDoc = await PDFDocument.create();

    for (let pdfPath of pdfPaths) {
        const pdfBytes = fs.readFileSync(pdfPath);
        const tempPdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await pdfDoc.copyPages(tempPdf, tempPdf.getPageIndices());
        copiedPages.forEach((page) => pdfDoc.addPage(page));
    }

    const pdfBytes = await pdfDoc.save();
    await fsPromises.writeFile(generatedPdfPath, generatedPdfBytes);
//    fs.writeFileSync(outputPath, pdfBytes);
}

module.exports = { 
    createPdf,
};
