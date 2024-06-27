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

         // Simular datos dinámicos (puedes reemplazarlos con datos de la base de datos)
         const convocatoria = {
            nombre: req.body.nombre || "Convocatoria 2024",
            fechaInicio: req.body.fechaInicio.split('T')[0] || "2024-06-22",
            fechaFin: req.body.fechaFin.split('T')[0] || "2024-07-22",
            tipoConvocatoria: req.body.tipoConvocatoria || "Regular",
            carrera: req.body.carrera || "Ingeniería de Sistemas",
            facultad: req.body.facultad || "Facultad de Ingeniería",
            materias: req.body.materias || ["Materia 1", "Materia 2", "Materia 3"],
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
        const pdfPath = path.join(__dirname, 'convocatoria.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);

        res.download(pdfPath, 'convocatoria.pdf', (err) => {
            if (err) {
                console.error('Error al enviar el PDF:', err);
                res.status(500).send('Error al enviar el PDF');
            }
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error('Error al crear el PDF:', error);
        res.status(500).send('Error al crear el PDF');
    }
}

module.exports = { createPdf };
/*const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf(req, res) {
    try {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;

        // Datos de la convocatoria
        const convocatoria = {
            nombre: req.body.nombre,
            fechaInicio: req.body.fechaInicio,
            fechaFin: req.body.fechaFin,
            tipoConvocatoria: req.body.tipoConvocatoria,
            carrera: req.body.carrera,
            facultad: req.body.facultad,
            materias: req.body.materias
        };

        // Añadir título y datos de la convocatoria
        page.drawText('Convocatoria', {
            x: 50,
            y: 750,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        page.drawText('Datos Generales', {
            x: 50,
            y: 720,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        const details = [
            `Nombre: ${convocatoria.nombre}`,
            `Fecha de Inicio: ${convocatoria.fechaInicio}`,
            `Fecha de Fin: ${convocatoria.fechaFin}`,
            `Tipo de Convocatoria: ${convocatoria.tipoConvocatoria}`,
            `Carrera: ${convocatoria.carrera}`,
            `Facultad: ${convocatoria.facultad}`
        ];

        let yPosition = 700;
        for (const detail of details) {
            page.drawText(detail, {
                x: 50,
                y: yPosition,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
        }

        page.drawText('Materias:', {
            x: 50,
            y: yPosition - 20,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        yPosition -= 40;
        for (const materia of convocatoria.materias) {
            page.drawText(materia, {
                x: 70,
                y: yPosition,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
            yPosition -= 20;
        }

        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(__dirname, 'convocatoria.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);

        res.download(pdfPath, 'convocatoria.pdf', (err) => {
            if (err) {
                console.error('Error al enviar el PDF:', err);
                res.status(500).send('Error al enviar el PDF');
            }
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error('Error al crear el PDF:', error);
        res.status(500).send('Error al crear el PDF');
    }
}

module.exports = { createPdf };
*/