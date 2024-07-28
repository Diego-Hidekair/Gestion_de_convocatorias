// backend/controllers/pdfController.js

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

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
            SELECT m.nombre 
            FROM convocatoria_materia cm
            JOIN materia m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `;
        const materiasResult = await pool.query(materiasQuery, [id_convocatoria]);
        const materias = materiasResult.rows;

        // Crear el PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;

        page.drawText('Convocatoria', {
            x: 50,
            y: 350,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Código de Convocatoria: ${convocatoria.cod_convocatoria}`, {
            x: 50,
            y: 320,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Nombre: ${convocatoria.nombre_convocatoria}`, {
            x: 50,
            y: 300,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Inicio: ${convocatoria.fecha_inicio}`, {
            x: 50,
            y: 280,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Fin: ${convocatoria.fecha_fin}`, {
            x: 50,
            y: 260,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Tipo de Convocatoria: ${convocatoria.tipo_convocatoria}`, {
            x: 50,
            y: 240,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Carrera: ${convocatoria.nombre_carrera}`, {
            x: 50,
            y: 220,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Facultad: ${convocatoria.nombre_facultad}`, {
            x: 50,
            y: 200,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Agregar materias al PDF
        page.drawText('Materias:', {
            x: 50,
            y: 180,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        let yPos = 160; // Posición inicial para las materias
        materias.forEach((materia, index) => {
            page.drawText(`${index + 1}. ${materia.nombre}`, {
                x: 70,
                y: yPos,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            yPos -= 20; // Ajustar la posición vertical para la siguiente materia
        });

        const pdfBytes = await pdfDoc.save();
        const sanitizedFileName = convocatoria.nombre_convocatoria.replace(/[^a-zA-Z0-9]/g, '_'); // Para evitar caracteres no permitidos en nombres de archivos
        const filePath = path.join(__dirname, `../pdfs/${sanitizedFileName}.pdf`);
        fs.writeFileSync(filePath, pdfBytes);

        res.sendFile(filePath);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
    }
}

module.exports = {
    createPdf,
};
