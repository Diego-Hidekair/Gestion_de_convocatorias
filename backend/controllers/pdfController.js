// backend/controllers/pdfController.js
const { Pool } = require('pg');
const types = require('pg').types;
const puppeteer = require('puppeteer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const generateConsultoresLineaHTML = require('../templates/consultoresLinea');
const generateOrdinarioHTML = require('../templates/ordinario');
const generateExtraordinarioHTML = require('../templates/extraordinario');

types.setTypeParser(17, val => val); // BYTEA

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
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.waitForTimeout(500);

  const content = await page.content();
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
      await pool.query(
        `INSERT INTO convocatorias_archivos (doc_conv, nombre_archivo, id_convocatoria) VALUES ($1, $2, $3)`,
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
          tc.nombre_tipo_conv, c.perfil_profesional,
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

            const pdfBuffer = await generarPDFBuffer(htmlContent);
            await guardarDocumentoPDF(id, pdfBuffer);

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

const generateConsultoresLineaHTML = require('./templates/consultoresLinea');
const generateOrdinarioHTML = require('./templates/ordinario');


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
