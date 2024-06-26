// backend/routes/pdfRoutes.js
const express = require('express');
const { PDFDocument, rgb } = require('pdf-lib');
const router = express.Router();

router.post('/create', async (req, res) => {
    const { nombre, fechaInicio, fechaFin, tipoConvocatoria, carrera, facultad } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const fontSize = 20;

    page.drawText(`Convocatoria`, { x: 50, y: height - 4 * fontSize, size: fontSize, color: rgb(0, 0, 0) });
    page.drawText(`Nombre: ${nombre}`, { x: 50, y: height - 6 * fontSize, size: fontSize });
    page.drawText(`Fecha de Inicio: ${fechaInicio}`, { x: 50, y: height - 8 * fontSize, size: fontSize });
    page.drawText(`Fecha de Fin: ${fechaFin}`, { x: 50, y: height - 10 * fontSize, size: fontSize });
    page.drawText(`Tipo de Convocatoria: ${tipoConvocatoria}`, { x: 50, y: height - 12 * fontSize, size: fontSize });
    page.drawText(`Carrera: ${carrera}`, { x: 50, y: height - 14 * fontSize, size: fontSize });
    page.drawText(`Facultad: ${facultad}`, { x: 50, y: height - 16 * fontSize, size: fontSize });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=convocatoria.pdf');
    res.send(Buffer.from(pdfBytes));
});

module.exports = router;
