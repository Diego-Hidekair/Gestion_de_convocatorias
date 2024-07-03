// backend/controllers/pdfController.js

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf(req, res) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;

        // Obtener datos de la solicitud
        const convocatoria = {
            nombre: req.body.nombre || "Convocatoria 2024",
            fechaInicio: req.body.fechaInicio ? req.body.fechaInicio.split('T')[0] : "2024-06-22",
            fechaFin: req.body.fechaFin ? req.body.fechaFin.split('T')[0] : "2024-07-22",
            tipoConvocatoria: req.body.tipoConvocatoria || "Regular",
            carrera: req.body.carrera || "Ingeniería de Sistemas",
            facultad: req.body.facultad || "Facultad de Ingeniería",
            materias: req.body.materias && req.body.materias.length ? req.body.materias : ["Materia 1", "Materia 2", "Materia 3"],
            creadoPor: req.body.creadoPor || "Admin",
            fechaCreacion: req.body.fechaCreacion || new Date().toISOString().split('T')[0]
        };

         // Añadir datos dinámicos al PDF
        page.drawText('Convocatoria', {
            x: 50,
            y: 350,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText('Datos Generales', {
            x: 50,
            y: 320,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Nombre: ${convocatoria.nombre}`, {
            x: 50,
            y: 290,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Inicio: ${convocatoria.fechaInicio}`, {
            x: 50,
            y: 270,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Fin: ${convocatoria.fechaFin}`, {
            x: 50,
            y: 250,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Tipo de Convocatoria: ${convocatoria.tipoConvocatoria}`, {
            x: 50,
            y: 230,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Carrera: ${convocatoria.carrera}`, {
            x: 50,
            y: 210,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Facultad: ${convocatoria.facultad}`, {
            x: 50,
            y: 190,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Añadir materias
        let yOffset = 170;
        convocatoria.materias.forEach((materia, index) => {
            page.drawText(`Materia ${index + 1}: ${materia}`, {
                x: 50,
                y: yOffset,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            yOffset -= 20;
        });
        
// Añadir creador y fecha de creación
        page.drawText(`Creado por: ${convocatoria.creadoPor}`, {
            x: 50,
            y: yOffset - 20,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Fecha de Creación: ${convocatoria.fechaCreacion}`, {
            x: 50,
            y: yOffset - 40,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        const filePath = path.join(__dirname, 'convocatoria.pdf');
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