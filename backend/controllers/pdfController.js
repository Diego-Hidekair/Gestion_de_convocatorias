// backend/controllers/pdfController.js
//const { Pool, types } = require('pg');
const pdf = require('html-pdf'); 
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const puppeteer = require('puppeteer');
//const { Pool } = require('pg');
const types = require('pg').types;
const multer = require('multer');
const upload = multer();
const pool = require('../config/db');

types.setTypeParser(17, val => val);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const generarPDFBuffer = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/pdf-template/123', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(500);

    const content = await page.content(); 
    //console.log('Contenido renderizado:',
    console.log('Contenido renderizado:', content); 

    const pdfBuffer = await page.pdf({ format: 'A4' });

  fs.writeFileSync('debug_generado.pdf', pdfBuffer);
  console.log('PDF generado y guardado temporalmente como debug_generado.pdf');
  console.log('Tamaño del buffer PDF generado:', pdfBuffer.length);

  await browser.close();
  return pdfBuffer;
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
    try {
        const existeArchivo = await pool.query(
            `SELECT id_conv_doc FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id_convocatoria]
        );
        
        const nombreArchivo = `convocatoria_${id_convocatoria}_${new Date().toISOString().slice(0, 10)}.pdf`;

        if (existeArchivo.rowCount > 0) {
            await pool.query(
                `UPDATE convocatorias_archivos 
                 SET doc_conv = $1, nombre_archivo = $2, fecha_creacion = CURRENT_TIMESTAMP 
                 WHERE id_convocatoria = $3`,
                [pdfBuffer, nombreArchivo, id_convocatoria]
            );
        } else {
            await pool.query( `INSERT INTO convocatorias_archivos (doc_conv, nombre_archivo, id_convocatoria) VALUES ($1, $2, $3)`,
                [pdfBuffer, nombreArchivo, id_convocatoria]
            );
        }
    } catch (error) {
        console.error('Error al guardar documento:', error);
        throw error;
    }
};

const generatePDF = async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`Buscando convocatoria con ID: ${id}`);
        const convocatoriaResult = await pool.query(`
            SELECT 
                c.id_convocatoria, c.nombre_conv, c.fecha_inicio, c.fecha_fin,
                c.resolucion, c.dictamen, c.tipo_jornada, c.etapa_convocatoria,
                tc.nombre_tipo_conv,
                p.programa,
                f.facultad AS nombre_facultad,
                d.nombres || ' ' || d.apellidos AS nombre_decano,
                v.nombre_vicerector
            FROM convocatorias c
            JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
            JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
            JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
            JOIN datos_universidad.docente d ON f.id_facultad = d.id_facultad
            JOIN vicerrector v ON c.id_vicerector = v.id_vicerector
            WHERE c.id_convocatoria = $1
        `, [id]);

        if (convocatoriaResult.rows.length === 0) {
            return res.status(404).json({ error: "Convocatoria no encontrada" });
        }

        const convocatoria = convocatoriaResult.rows[0];
        const materiasResult = await pool.query(`
            SELECT m.materia, m.cod_materia, cm.total_horas
            FROM convocatorias_materias cm
            JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
            WHERE cm.id_convocatoria = $1
        `, [id]);

        const materias = materiasResult.rows;
        const totalHoras = materias.reduce((sum, m) => sum + (m.total_horas || 0), 0);
        
            console.log('Datos de convocatoria:', convocatoria);
            console.log('Materias:', materias);
            
            
        let htmlContent;
        switch (convocatoria.nombre_tipo_conv) { 
            case 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA':
                htmlContent = generateConsultoresLineaHTML(convocatoria, materias, totalHoras);
                break;
            case 'DOCENTE EN CALIDAD ORDINARIO':
                htmlContent = generateOrdinarioHTML(convocatoria, materias, totalHoras);
                break;
            case 'DOCENTE EN CALIDAD EXTRAORDINARIO':
                htmlContent = generateExtraordinarioHTML(convocatoria, materias, totalHoras);
                break;
            default:
                return res.status(400).json({ error: `Tipo de convocatoria no soportado: ${convocatoria.nombre_tipo_conv}` });
        }
        console.log("HTML generado para PDF:\n", htmlContent);
        const pdfBuffer = await generarPDFBuffer(htmlContent);
        
        await guardarDocumentoPDF(id, pdfBuffer);

        // Enviar respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="nombre.pdf"');
        res.send(pdfBuffer); 
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).json({ 
            error: "Error al generar el PDF",
            details: error.message 
        });
    }
};

function generateConsultoresLineaHTML(convocatoria, materias, totalHoras) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; margin: 4cm 2cm 2cm 2cm; }
            h1 { font-size: 24pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
            h2 { font-size: 18pt; font-weight: bold; text-align: center; text-transform: uppercase; margin-bottom: 20px; }
            h3 { font-size: 14pt; font-weight: bold; text-align: left; margin-bottom: 10px; }
            p { font-size: 12pt; text-align: justify; margin-bottom: 10px; }
            .centrado { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
            th, td { text-align: center; border: 1px solid black; padding: 8px; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <h1>${convocatoria.nombre_conv}</h1>
        <h2>${convocatoria.nombre_tipo_conv}</h2>
        
        <p>
            Por determinación del Consejo de Carrera de <strong>${convocatoria.programa}</strong>, 
            mediante Dictamen N° <strong>${convocatoria.dictamen || 'N/A'}</strong>; homologado por Resolución del Consejo Facultativo N° 
            <strong>${convocatoria.resolucion || 'N/A'}</strong> de la Facultad de <strong>${convocatoria.nombre_facultad}</strong>, 
            se convoca a los profesionales en ${convocatoria.programa} al <strong>CONCURSO DE MÉRITOS</strong> 
            para optar por la docencia universitaria, como Docente Consultor de Línea a 
            <strong>${convocatoria.tipo_jornada}</strong> para la gestión académica 
            ${convocatoria.etapa_convocatoria}.
        </p>

        <h3>Tiempo de trabajo: ${convocatoria.tipo_jornada}</h3>
        
        <h2>MATERIAS OBJETO DE LA CONVOCATORIA:</h2>
        
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
                        ${index === 0 ? `<td rowspan="${materias.length}">${convocatoria.perfil_profesional || 'No especificado'}</td>` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <h3>Total Horas: ${totalHoras}</h3>
        
        <p class="centrado">
            Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
    </body>
    </html>
    `;
    
}

function generateOrdinarioHTML(convocatoria, materias, totalHoras) {
     return `
    <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    line-height: 1.5; 
                    margin: 4cm 2cm 2cm 2cm; 
                }
                h1 { 
                    font-size: 24pt; 
                    font-weight: bold; 
                    text-align: center; 
                    text-transform: uppercase; 
                    margin-bottom: 20px; 
                }
                h2 { 
                    font-size: 18pt; 
                    font-weight: bold; 
                    text-align: center; 
                    text-transform: uppercase; 
                    margin-bottom: 20px; 
                }
                h3 { 
                    font-size: 14pt; 
                    font-weight: bold; 
                    text-align: left; 
                    margin-bottom: 10px;
                    margin-left: 36pt;
                    text-indent: -18pt;
                }
                p { 
                    font-size: 12pt; 
                    text-align: justify; 
                    margin-bottom: 10px; 
                    text-indent: 36pt;
                }
                .centrado { 
                    text-align: center; 
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-top: 20px; 
                    margin-bottom: 20px; 
                }
                th, td { 
                    text-align: center; 
                    border: 1px solid black; 
                    padding: 8px; 
                }
                th { 
                    background-color: #f2f2f2; 
                    font-weight: bold;
                }
                strong {
                    font-weight: bold;
                }
                .sangria {
                    margin-left: 36pt;
                }
            </style>
        </head>
        <body>
            <h1>${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MERITOS Y EXAMENES DE COMPETENCIA</h1>
            <h2>PARA LA PROVISIÓN DE DOCENTE ORDINARIO PARA LA CARRERA DE ${convocatoria.programa.toUpperCase()} - GESTIÓN ${new Date().getFullYear()}</h2>
            
            <p>
                En aplicación de la Nota de Instrucción N° 001/2023 y N° 043/2023 emitidas por el Señor Rector 
                de la Universidad, y por Dictamen de la Comisión Académica N° <strong>${convocatoria.dictamen || 'N/A'}</strong> homologado por la 
                Resolución del Honorable Consejo Universitario N° <strong>${convocatoria.resolucion || 'N/A'}</strong> y cumpliendo con la normativa 
                universitaria se convoca a los profesionales <strong>${convocatoria.perfil_profesional || 'No especificado'}</strong>, al 
                <strong>${convocatoria.etapa_consecatoria}</strong> CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA para optar por la docencia 
                universitaria en la categoría de <strong>Docente Ordinario</strong> en aplicación del Art. 70 del Reglamento del Régimen Académico 
                Docente de la Universidad Boliviana, ingresando el ganador como docente Contratado, conforme lo 
                dispone el Art. 72 del mismo cuerpo normativo, para luego ser sometido a evaluación continua y 
                pasar a la categoría de titular, tal como lo establece el Art. 73 del Reglamento referido, como 
                <strong>Docente Ordinario</strong> en la siguiente asignatura:
            </p>

            <h3>1. MATERIA OBJETO DE LA ${convocatoria.etapa_convocatoria} CONVOCATORIA:</h3>
            <p class="sangria"><strong>DOCENTES ORDINARIOS</strong></p>
            
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
                            ${index === 0 ? `<td rowspan="${materias.length}">${convocatoria.perfil_profesional || 'No especificado'}</td>` : ''}
                        </tr>
                    `).join('')}
                    <tr>
                        <td colspan="2"><strong>TOTAL HORAS</strong></td>
                        <td><strong>${totalHoras}</strong></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <p class="sangria">
                Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la  
                Universidad Boliviana que cumplan los siguientes requisitos mínimos habilitantes de acuerdo al XII  
                Congreso Nacional de Universidades.
            </p>

            <h3>2. REQUISITOS MÍNIMOS HABILITANTES</h3>
            
            <p class="sangria">
                <strong>a)</strong> Carta de solicitud de postulación dirigida al señor Decano de la Facultad de 
                <strong>${convocatoria.nombre_facultad}</strong> especificando la asignatura y sigla a la que postula.
            </p>
            
            <p class="sangria">
                <strong>b)</strong> Curriculum vitae debidamente documentado, adjuntando fotocopias simples. El convocante se 
                reservará el derecho de solicitar la presentación de los documentos originales. (Incisos c.1 y c.6 
                del Art. 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).
            </p>
            
            <p class="sangria">
                <strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaría General de la Universidad que  
                confirió dicho documento, el cual debe ser otorgado por una de las universidades del  
                Sistema de la Universidad Boliviana. (Art. 77 inc. C.2 Reglamento del Régimen Académico  
                Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong> conforme a la Resolución  
                Rectoral N° 410/2019.
            </p>
            
            <p class="sangria">
                <strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General de la  
                Universidad que confirió dicho documento, el cual debe ser otorgado por una de las  
                Universidades del Sistema de la Universidad Boliviana. (Art.77 inc. C.2 Reglamento del  
                Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong> conforme a  
                la Resolución Rectoral N° 410/2019.
            </p>

            <p class="centrado">
                Potosí, ${new Date(convocatoria.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
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
                Facultad de ${convocatoria.nombre_facultad}, con ${totalHoras} horas totales.
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
    const { id } = req.params; 
    let { archivos } = req.body; 
    
    try {
        if (!Array.isArray(archivos)) {
            archivos = [];
        }

        const documentoInicial = await pool.query(
            `SELECT doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1`,
            [id]
        );

        if (documentoInicial.rows.length === 0) {
            return res.status(404).json({ error: "Documento inicial no encontrado." });
        }

        const pdfInicial = documentoInicial.rows[0].doc_conv;
        
        const archivosConvertidos = archivos.map((archivo) => {
            return typeof archivo === 'string' ? Buffer.from(archivo, 'base64') : archivo;
        });

        const archivosParaCombinar = [pdfInicial, ...archivosConvertidos];
        const pdfCombinado = await combinarPDFs(archivosParaCombinar);
        
        await guardarDocumentoPDF(id, pdfCombinado);

        res.status(201).json({ message: "PDFs combinados y almacenados correctamente." });
    } catch (error) {
        console.error('Error al combinar y guardar PDFs:', error);
        res.status(500).json({ error: "Error al combinar y guardar los PDFs." });
    }
};
const viewCombinedPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1',
            [id]
        );

        if (!result.rows[0]?.doc_conv) {
            return res.status(404).json({ 
                error: 'Documento no encontrado',
                solution: 'Primero genere el PDF usando POST /pdf/:id/generar'
            });
        }

        const pdfBuffer = result.rows[0].doc_conv;
        
        // Enviar el buffer binario directamente
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="convocatoria_${id}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error al recuperar el PDF:', error);
        res.status(500).json({ 
            error: 'Error al recuperar el PDF',
            details: error.message
        });
    }
};

const downloadCombinedPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT doc_conv, nombre_archivo FROM convocatorias_archivos WHERE id_convocatoria = $1',
            [id]
        );

        if (!result.rows[0]?.doc_conv) {
            return res.status(404).json({ error: 'PDF no encontrado' });
        }

        const pdfBuffer = result.rows[0].doc_conv;
        const nombreArchivo = result.rows[0].nombre_archivo || `convocatoria_${id}.pdf`;

        // Forzar la descarga (attachment) en lugar de visualización (inline)
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error al descargar el PDF:', error);
        res.status(500).json({ 
            error: 'Error al descargar el PDF',
            details: error.message
        });
    }
};


const deletePDF = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM convocatorias_archivos WHERE id_convocatoria = $1 RETURNING *`,
            [id]
        );

        if (result.rowCount > 0) {
            res.status(200).json({ message: "PDF eliminado correctamente." });
        } else {
            res.status(404).json({ error: "PDF no encontrado." });
        }
    } catch (error) {
        console.error('Error al eliminar el PDF:', error);
        res.status(500).json({ 
            error: "Error al eliminar el PDF.",
            details: error.message 
        });
    }
};
const uploadPDF = async (req, res) => {
  const { id } = req.params;
  const tipo = req.body.tipo;
  const buffer = req.file?.buffer;

  if (!buffer || !tipo) {
    return res.status(400).json({ error: 'Falta archivo o tipo de documento' });
  }

  console.log(` Documento recibido: tipo [${tipo}], convocatoria [${id}]`);

  try {
    await guardarDocumentoPorTipo(id, tipo, buffer);  
    res.status(200).json({ message: 'Archivo subido correctamente.' });
  } catch (error) {
    console.error('Error al guardar el documento:', error);
    res.status(500).json({ error: 'Error al guardar el archivo' });
  }
};

const guardarDocumentoPorTipo = async (idConvocatoria, tipo, buffer) => {
  const columnas = [
    'resolucion', 'dictamen', 'carta',
    'nota', 'certificado_item', 'certificado_presupuestario'
  ];

  if (!columnas.includes(tipo)) {
    throw new Error('Tipo de documento inválido');
  }

  const query = `
    UPDATE convocatorias_archivos
    SET ${tipo} = $1
    WHERE id_convocatoria = $2
  `;

  await pool.query(query, [buffer, idConvocatoria]);
};

module.exports = { generatePDF, combinarYGuardarPDFs, viewCombinedPDF, downloadCombinedPDF, deletePDF, combinarPDFs, uploadPDF, guardarDocumentoPorTipo  };
