//backend/controllers/convocatoriaArchivosController.js
const { Pool } = require('pg');
const { PDFDocument } = require('pdf-lib');
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Función para combinar PDFs
const combinarPDFs = async (pdfBuffers) => {
    const mergedPdf = await PDFDocument.create();
    for (const pdfBuffer of pdfBuffers) {
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
};

// Guardar documentos adicionales en convocatorias_archivos
exports.guardarDocumentosAdicionales = async (req, res) => {
    const { id_convocatoria } = req.params;
    const { resolucion, dictamen, carta, nota, certificado_item, certificado_resumen_presupuestario } = req.files;

    try {
        // Obtener el documento inicial de la tabla documentos
        const documentoInicial = await pool.query(
            `SELECT id_documentos, documento_path FROM documentos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (documentoInicial.rows.length === 0) {
            return res.status(404).json({ error: "Documento inicial no encontrado." });
        }

        const pdfInicial = documentoInicial.rows[0].documento_path;

        // Combinar PDFs (si es necesario)
        const archivosParaCombinar = [pdfInicial];
        if (resolucion) archivosParaCombinar.push(resolucion[0].buffer);
        if (dictamen) archivosParaCombinar.push(dictamen[0].buffer);
        if (carta) archivosParaCombinar.push(carta[0].buffer);
        if (nota) archivosParaCombinar.push(nota[0].buffer);
        if (certificado_item) archivosParaCombinar.push(certificado_item[0].buffer);
        if (certificado_resumen_presupuestario) archivosParaCombinar.push(certificado_resumen_presupuestario[0].buffer);

        const pdfCombinado = await combinarPDFs(archivosParaCombinar);

        // Guardar en convocatorias_archivos
        await pool.query(
            `INSERT INTO convocatorias_archivos (
                convocatoria, resolucion, dictamen, carta, nota, certificado_item, certificado_resumen_presupuestario, id_convocatoria, id_documentos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                pdfCombinado,
                resolucion ? resolucion[0].buffer : null,
                dictamen ? dictamen[0].buffer : null,
                carta ? carta[0].buffer : null,
                nota ? nota[0].buffer : null,
                certificado_item ? certificado_item[0].buffer : null,
                certificado_resumen_presupuestario ? certificado_resumen_presupuestario[0].buffer : null,
                id_convocatoria,
                documentoInicial.rows[0].id_documentos // Referencia al documento inicial
            ]
        );

        res.status(201).json({ message: "Documentos adicionales guardados correctamente." });
    } catch (error) {
        console.error('Error al guardar documentos adicionales:', error);
        res.status(500).json({ error: "Error al guardar documentos adicionales." });
    }
};