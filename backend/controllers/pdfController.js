// backend/controllers/pdfController.js

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const multer = require('multer');


// Configuración de Multer para manejar la subida de archivos
const upload = multer({ dest: 'uploads/' });

async function createPdf(req, res) {
    try {
        const { id_convocatoria } = req.body;

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

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        const fontSize = 18;
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawText(`Convocatoria: ${convocatoria.nombre_convocatoria}`, {
            x: 50,
            y: height - 50,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Código: ${convocatoria.cod_convocatoria}`, {
            x: 50,
            y: height - 80,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha Inicio: ${convocatoria.fecha_inicio}`, {
            x: 50,
            y: height - 110,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha Fin: ${convocatoria.fecha_fin}`, {
            x: 50,
            y: height - 140,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Tipo de Convocatoria: ${convocatoria.tipo_convocatoria}`, {
            x: 50,
            y: height - 170,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Carrera: ${convocatoria.nombre_carrera}`, {
            x: 50,
            y: height - 200,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Facultad: ${convocatoria.nombre_facultad}`, {
            x: 50,
            y: height - 230,
            size: fontSize,
            fontRegular,
            color: rgb(0, 0, 0),
        });

        let currentY = height - 260;
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
                size: fontSize,
                fontRegular,
                color: rgb(0, 0, 0),
            });
            currentY -= 30;
        });

        const pdfBytes = await pdfDoc.save();
        const pdfFileName = `N_${convocatoria.cod_convocatoria}_${convocatoria.nombre_convocatoria.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const pdfFilePath = path.join(__dirname, '../pdfs', pdfFileName);
        fs.writeFileSync(pdfFilePath, pdfBytes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfFileName}"`);
        res.send(pdfBytes);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ error: 'Error al generar el PDF' });
    }
}

module.exports = {
    createPdf,
};

        
        /*// Obtener las materias relacionadas con la convocatoria
        const materiasQuery = `
            SELECT m.codigomateria, m.nombre 
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `;
        const materiasResult = await pool.query(materiasQuery, [id_convocatoria]);
        const materias = materiasResult.rows;

        // Crear el PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);  // Cambiado a formato vertical
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;

        page.drawText('Convocatoria', {
            x: 50,
            y: 750,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Código de Convocatoria: ${convocatoria.cod_convocatoria}`, {
            x: 50,
            y: 720,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Nombre: ${convocatoria.nombre_convocatoria}`, {
            x: 50,
            y: 700,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Inicio: ${new Date(convocatoria.fecha_inicio).toLocaleDateString()}`, {
            x: 50,
            y: 680,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Fin: ${new Date(convocatoria.fecha_fin).toLocaleDateString()}`, {
            x: 50,
            y: 660,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Tipo de Convocatoria: ${convocatoria.tipo_convocatoria}`, {
            x: 50,
            y: 640,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Carrera: ${convocatoria.nombre_carrera}`, {
            x: 50,
            y: 620,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Facultad: ${convocatoria.nombre_facultad}`, {
            x: 50,
            y: 600,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });
        
        // Agregar materias al PDF
        page.drawText('Materias:', {
            x: 50,
            y: 580,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        let yPos = 560; // Posición inicial para las materias
        materias.forEach((materia, index) => {
            page.drawText(`${index + 1}. ${materia.codigomateria} - ${materia.nombre}`, {
                x: 70,
                y: yPos,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            yPos -= 20; // Ajustar la posición vertical para la siguiente materia
        });

        // Guardar el PDF con el nombre de archivo adecuado
        const pdfBytes = await pdfDoc.save();
        const sanitizedFileName = `N_${convocatoria.cod_convocatoria}_${convocatoria.nombre_convocatoria.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        const filePath = path.join(__dirname, `../pdfs/${sanitizedFileName}`);
        fs.writeFileSync(filePath, pdfBytes);

        res.sendFile(filePath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
}

module.exports = {createPdf,};*/