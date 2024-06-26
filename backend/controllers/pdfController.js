// backend/controllers/pdfController.js
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function createPdf(req, res) {
    try {
        // Crear un nuevo documento PDF
        const pdfDoc = await PDFDocument.create();
        
        // Añadir una página
        const page = pdfDoc.addPage([600, 400]);
        
        // Definir la fuente y el tamaño
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontSize = 12;

        // Añadir título
        page.drawText('Convocatoria', {
            x: 50,
            y: 350,
            size: 18,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Añadir subtítulo
        page.drawText('Datos Generales', {
            x: 50,
            y: 320,
            size: 14,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Simular datos dinámicos (puedes reemplazarlos con datos de la base de datos)
        const convocatoria = {
            nombre: req.body.nombre || "Convocatoria 2024",
            fechaInicio: req.body.fechaInicio || "2024-06-22",
            fechaFin: req.body.fechaFin || "2024-07-22",
            tipoConvocatoria: req.body.tipoConvocatoria || "Regular",
            carrera: req.body.carrera || "Ingeniería de Sistemas",
            facultad: req.body.facultad || "Facultad de Ingeniería"
        };

        // Añadir datos dinámicos al PDF
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

        // Guardar el PDF en un archivo temporal
        const pdfBytes = await pdfDoc.save();
        const pdfPath = path.join(__dirname, 'convocatoria.pdf');
        fs.writeFileSync(pdfPath, pdfBytes);

        // Enviar el PDF al cliente
        res.download(pdfPath, 'convocatoria.pdf', (err) => {
            if (err) {
                console.error('Error al enviar el PDF:', err);
                res.status(500).send('Error al enviar el PDF');
            }

            // Eliminar el archivo temporal después de enviarlo
            fs.unlinkSync(pdfPath);
        });
    } catch (error) {
        console.error('Error al crear el PDF:', error);
        res.status(500).send('Error al crear el PDF');
    }
}

module.exports = { createPdf };
