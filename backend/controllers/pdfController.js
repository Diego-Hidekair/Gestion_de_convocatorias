// backend/controllers/pdfController.js
const { Pool } = require('pg');
const pdf = require('html-pdf'); 
const { PDFDocument } = require('pdf-lib');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const generarPDFBuffer = (htmlContent, options) => {
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

const combinarPDFs = async (pdfBuffers) => {
    const mergedPdf = await PDFDocument.create();
    for (const pdfBuffer of pdfBuffers) {
        if (!pdfBuffer) continue; 
        const pdf = await PDFDocument.load(pdfBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
};

const guardarDocumentoPDF = async (id_convocatoria, pdfBuffer) => {
    const documentoExistente = await pool.query(
        `SELECT id_documentos FROM documentos WHERE id_convocatoria = $1`,
        [id_convocatoria]
    );

    if (documentoExistente.rowCount > 0) {
        await pool.query(
            `UPDATE documentos SET documento_path = $1, fecha_generacion = CURRENT_TIMESTAMP WHERE id_convocatoria = $2`,
            [pdfBuffer, id_convocatoria]
        );
    } else {
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
        await pool.query(
            `UPDATE convocatorias_archivos SET convocatoria = $1 WHERE id_convocatoria = $2`,
            [pdfBuffer, id_convocatoria]
        );
    } else {
        await pool.query(
            `INSERT INTO convocatorias_archivos (convocatoria, id_convocatoria, id_documentos) VALUES ($1, $2, $3)`,
            [pdfBuffer, id_convocatoria, id_documentos]
        );
    }
};

const generatePDF = async (convocatoriaData, materias, pago_mensual) => {
    try {
        const { 
            nombre, 
            nombre_convocatoria, 
            nombre_carrera, 
            nombre_facultad, 
            fecha_inicio, 
            fecha_fin, 
            resolucion, 
            dictamen, 
            prioridad, 
            tipo_jornada 
        } = convocatoriaData;

        const totalHoras = materias.reduce((sum, m) => sum + m.total_horas, 0);

        let htmlContent;
        switch (nombre_convocatoria) { 
            case 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA':
                htmlContent = generateConsultoresLineaHTML(convocatoriaData, materias, totalHoras);
                break;
            case 'DOCENTE EN CALIDAD ORDINARIO':
                htmlContent = generateOrdinarioHTML(convocatoriaData, materias, totalHoras);
                break;
            case 'DOCENTE EN CALIDAD EXTRAORDINARIO':
                htmlContent = generateExtraordinarioHTML(convocatoriaData, materias, totalHoras);
                break;
            default:
                throw new Error(`Tipo de convocatoria no aplicable: ${nombre_convocatoria}`);
        }

        const options = { format: 'Letter', border: { top: '3cm', right: '2cm', bottom: '2cm', left: '2cm' } };
        const pdfBuffer = await generarPDFBuffer(htmlContent, options);
        
        return pdfBuffer;
    } catch (error) {
        console.error('Error al generar PDF:', error);
        throw error;
    }
};

function generateConsultoresLineaHTML(convocatoria, materias, totalHoras) {
    return `
    <html>
        <head>
            <style>
                body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
                h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h3 { font-size: 14pt; font-weight: bold; text-align: left; margin-bottom: 10px; }
                p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
                .centrado { text-align: center; }
                .left-align { text-align: left; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
                th, td { text-align: center; border: 1px solid black; padding: 8px; }
                th { background-color: #f2f2f2; }
                .notas { margin-top: 20px; }
                strong { font-weight: bold; }
                u { text-decoration: underline; }
            </style> 
        </head>
        <body>
            <h1>${convocatoria.nombre_conv}</h1>
            <h2>${convocatoria.nombre_tipo_conv}</h2>
            <p>
                Por determinación del Consejo de Carrera de <strong>${convocatoria.programa}</strong>, 
                mediante Dictamen N° <strong>${convocatoria.dictamen}</strong>; homologado por Resolución del Consejo Facultativo N° 
                <strong>${convocatoria.resolucion}</strong> de la Facultad de <strong>${convocatoria.facultad}</strong>, se convoca a los profesionales en 
                ${convocatoria.programa} al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, 
                como Docente Consultor de Línea a <strong>${convocatoria.tipo_jornada}</strong> para la gestión académica 
                ${convocatoria.etapa_convocatoria}.
            </p>
            <h3>Tiempo de trabajo: ${convocatoria.tipo_jornada}</h3>
            <h2>MATERIAS OBJETO DE LA CONVOCATORIA:</h2>
            <p><strong>1) MATERIAS OBJETO DE LA CONVOCATORIA:</strong></p>
            <table>
                <thead>
                    <tr>
                        <th>SIGLA</th>
                        <th>MATERIA</th>
                        <th>HORAS</th>
                        <th>PERFIL REQUERIDO</th>
                    </tr>
                </thead>
                <tbody>
                    ${materias.map((m, index) => `
                        <tr>
                            <td>${m.cod_materia}</td>
                            <td>${m.materia}</td>
                            <td>${m.total_horas}</td>
                            ${index === 0 ? `<td rowspan="${materias.length}">${m.perfil_profesional}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <h3>Total Horas: ${totalHoras}</h3>
            <p class="notas">
                Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por
                la Universidad Boliviana que cumplan los requisitos mínimos habilitantes de acuerdo al
                XII Congreso Nacional de Universidades.
            </p>
            <p class="centrado">Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </body>
    </html>
    `;
}

function generateOrdinarioHTML(convocatoria, materias, totalHoras) {
    return `
    <html>
        <head>
            <style>
                body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
                h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h3 { font-size: 14pt; font-weight: bold; text-align: left; margin-bottom: 10px; }
                p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
                th, td { text-align: center; border: 1px solid black; padding: 8px; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>${convocatoria.nombre_conv}</h1>
            <h2>${convocatoria.nombre_tipo_conv}</h2>
            <p>
                En aplicación de la Nota de Instrucción N° 001/2023 y N° 043/2023 emitidas por el Señor Rector de la Universidad, 
                y por Dictamen de la Comisión Académica N° <strong>${convocatoria.dictamen}</strong> homologado por la Resolución del 
                Honorable Consejo Universitario N° <strong>${convocatoria.resolucion}</strong> y cumpliendo con la normativa universitaria 
                se convoca a los profesionales en <strong>${convocatoria.programa}</strong>, al <strong>${convocatoria.etapa_convocatoria}</strong> 
                al <strong>CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA</strong> para optar por la docencia universitaria en la categoría 
                de Docente Ordinario.
            </p>
            <h3><strong>1. MATERIA OBJETO DE LA ${convocatoria.etapa_convocatoria} CONVOCATORIA:</strong></h3>
            <p><strong>DOCENTES ORDINARIOS</strong></p>
            <p><strong>Ítem N° ${convocatoria.tipo_jornada === 'TIEMPO HORARIO' ? 'A' : 'B'} ${convocatoria.tipo_jornada}</strong></p>
            <table>
                <thead>
                    <tr>
                        <th><strong>SIGLA</strong></th>
                        <th><strong>ASIGNATURA</strong></th>
                        <th><strong>HORAS SEMANA</strong></th>
                        <th><strong>PERFIL PROFESIONAL</strong></th>
                    </tr>
                </thead>
                <tbody>
                    ${materias.map((m, index) => `
                        <tr>
                            <td>${m.cod_materia}</td>
                            <td>${m.materia}</td>
                            <td>${m.total_horas}</td>
                            ${index === 0 ? `<td rowspan="${materias.length}">${m.perfil_profesional}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="centrado">Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </body>
    </html>
    `;
}

function generateExtraordinarioHTML(convocatoria, materias, totalHoras) {
    return `
    <html>
        <head>
            <style>
                body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
                h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
                p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
                th, td { text-align: center; border: 1px solid black; padding: 8px; }
            </style>
        </head>
        <body>
            <h1>${convocatoria.nombre_conv}</h1>
            <h2>${convocatoria.nombre_tipo_conv}</h2>
            <p>
                Convocatoria extraordinaria para la carrera de ${convocatoria.programa}, 
                Facultad de ${convocatoria.facultad}, con ${totalHoras} horas totales.
            </p>
            <table>
                <thead>
                    <tr>
                        <th>Materia</th>
                        <th>Horas</th>
                    </tr>
                </thead>
                <tbody>
                    ${materias.map(m => `
                        <tr>
                            <td>${m.materia}</td>
                            <td>${m.total_horas}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="centrado">Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </body>
    </html>
    `;
}

const combinarYGuardarPDFs = async (req, res) => {  
    const { id_convocatoria } = req.params;
    let { archivos } = req.body; 
    
    try {
        if (!Array.isArray(archivos)) {
            archivos = [];
        }

        const documentoInicial = await pool.query(
            `SELECT documento_path FROM documentos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );

        if (documentoInicial.rows.length === 0) {
            return res.status(404).json({ error: "Documento inicial no encontrado." });
        }

        const pdfInicial = documentoInicial.rows[0].documento_path;
        
        const archivosConvertidos = archivos.map((archivo) => {
            return typeof archivo === 'string' ? Buffer.from(archivo, 'base64') : archivo;
        });

        const archivosParaCombinar = [pdfInicial, ...archivosConvertidos];
        const pdfCombinado = await combinarPDFs(archivosParaCombinar);
        
        await guardarDocumentoPDF(id_convocatoria, pdfCombinado);

        res.status(201).json({ message: "PDFs combinados y almacenados correctamente." });
    } catch (error) {
        console.error('Error al combinar y guardar PDFs:', error);
        res.status(500).json({ error: "Error al combinar y guardar los PDFs." });
    }
};

const viewCombinedPDF = async (req, res) => {
    const { id_convocatoria } = req.params;

    try {
        const result = await pool.query(
            'SELECT documento_path FROM documentos WHERE id_convocatoria = $1',
            [id_convocatoria]
        );

        if (result.rows.length === 0 || !result.rows[0].documento_path) {
            return res.status(404).send('Documento no encontrado.');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(result.rows[0].documento_path);
    } catch (error) {
        console.error('Error al recuperar el PDF:', error);
        res.status(500).send('Error al recuperar el PDF.');
    }
};

const downloadCombinedPDF = async (req, res) => { 
    const { id_convocatoria } = req.params;

    try {
        const result = await pool.query(
            'SELECT documento_path FROM documentos WHERE id_convocatoria = $1',
            [id_convocatoria]
        );

        if (result.rows.length === 0 || !result.rows[0].documento_path) {
            return res.status(404).json({ error: 'PDF no encontrado' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="convocatoria_${id_convocatoria}.pdf"`);
        res.send(result.rows[0].documento_path);
    } catch (error) {
        console.error('Error al descargar el PDF:', error);
        res.status(500).json({ error: 'Error al descargar el PDF' });
    }
};

const deletePDF = async (req, res) => {
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

module.exports = { generatePDF, combinarYGuardarPDFs, viewCombinedPDF, downloadCombinedPDF, deletePDF};