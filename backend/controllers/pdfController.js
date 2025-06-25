// backend/controllers/pdfController.js
const { Pool, types } = require('pg');
const puppeteer = require('puppeteer');
const fs = require('fs');

const generateConsultoresLineaHTML = require('../templates/consultoresLinea');
const generateOrdinarioHTML = require('../templates/ordinario');
const generateExtraordinarioHTML = require('../templates/extraordinario');

// Aseguramos que el tipo BYTEA se interprete como buffer
types.setTypeParser(17, val => val);

// Conexión a la base de datos
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Generar PDF con Puppeteer
const generarPDFBuffer = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500)); // Espera por precaución
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
};

// Guardar PDF localmente (para probar sin base de datos)
const generarPDFLocal = async (htmlContent) => {
  const pdfBuffer = await generarPDFBuffer(htmlContent);
  fs.writeFileSync('prueba.pdf', pdfBuffer);
  console.log('PDF guardado localmente como prueba.pdf');
};

// Guardar PDF en la base de datos
const guardarDocumentoPDF = async (id_convocatoria, pdfBuffer) => {
  const nombreArchivo = `convocatoria_${id_convocatoria}_${new Date().toISOString().slice(0, 10)}.pdf`;
  const existe = await pool.query(
    `SELECT id_conv_doc FROM convocatorias_archivos WHERE id_convocatoria = $1`,
    [id_convocatoria]
  );

  if (existe.rowCount > 0) {
    await pool.query(`
      UPDATE convocatorias_archivos 
      SET doc_conv = $1, nombre_archivo = $2, fecha_creacion = CURRENT_TIMESTAMP 
      WHERE id_convocatoria = $3
    `, [pdfBuffer, nombreArchivo, id_convocatoria]);
  } else {
    await pool.query(`
      INSERT INTO convocatorias_archivos (doc_conv, nombre_archivo, id_convocatoria) 
      VALUES ($1, $2, $3)
    `, [pdfBuffer, nombreArchivo, id_convocatoria]);
  }
};

// Generar y guardar PDF desde datos
const generatePDF = async (req, res) => {
  const { id } = req.params;
  try {
    const convocatoriaRes = await pool.query(`
      SELECT c.*, tc.nombre_tipo_conv,
             p.programa, f.facultad AS nombre_facultad,
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

    if (convocatoriaRes.rowCount === 0) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }

    const convocatoria = convocatoriaRes.rows[0];

    const materiasRes = await pool.query(`
      SELECT m.materia, m.cod_materia, cm.total_horas
      FROM convocatorias_materias cm
      JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
      WHERE cm.id_convocatoria = $1
    `, [id]);

    const materias = materiasRes.rows;
    const totalHoras = materias.reduce((acc, m) => acc + (m.total_horas || 0), 0);

    // Generar HTML según el tipo de convocatoria
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
        return res.status(400).json({ error: 'Tipo de convocatoria no soportado' });
    }
    await generarPDFLocal(htmlContent);
    const pdfBuffer = await generarPDFBuffer(htmlContent);
    await guardarDocumentoPDF(id, pdfBuffer);

    // Enviar al navegador o Postman
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="convocatoria.pdf"');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar el PDF:', error);
    res.status(500).json({ error: 'Error al generar el PDF', details: error.message });
  }
};

// Ver PDF en navegador
const viewPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1',
      [id]
    );

    if (!result.rows[0]?.doc_conv) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const pdfBuffer = result.rows[0].doc_conv;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="convocatoria_${id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al recuperar el PDF:', error);
    res.status(500).json({ error: 'Error al recuperar el PDF', details: error.message });
  }
};


// Descargar PDF como archivo
const downloadPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT doc_conv, nombre_archivo FROM convocatorias_archivos WHERE id_convocatoria = $1',
      [id]
    );

    if (!result.rows[0]?.doc_conv) {
      return res.status(404).json({ error: 'PDF no encontrado' });
    }

    const nombreArchivo = result.rows[0].nombre_archivo || `convocatoria_${id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send(result.rows[0].doc_conv);
  } catch (error) {
    console.error('Error al descargar el PDF:', error);
    res.status(500).json({ error: 'Error al descargar el PDF', details: error.message });
  }
};

// Eliminar PDF
const deletePDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM convocatorias_archivos WHERE id_convocatoria = $1 RETURNING *',
      [id]
    );
    if (result.rowCount > 0) {
      res.status(200).json({ message: 'PDF eliminado correctamente.' });
    } else {
      res.status(404).json({ error: 'PDF no encontrado.' });
    }
  } catch (error) {
    console.error('Error al eliminar el PDF:', error);
    res.status(500).json({ error: 'Error al eliminar el PDF.', details: error.message });
  }
};

// Subir otro tipo de PDF
const uploadPDF = async (req, res) => {
  const { id } = req.params;
  const tipo = req.body.tipo;
  const buffer = req.file?.buffer;

  if (!buffer || !tipo) {
    return res.status(400).json({ error: 'Falta archivo o tipo de documento' });
  }

  try {
    await guardarDocumentoPorTipo(id, tipo, buffer);
    res.status(200).json({ message: 'Archivo subido correctamente.' });
  } catch (error) {
    console.error('Error al guardar el documento:', error);
    res.status(500).json({ error: 'Error al guardar el archivo' });
  }
};

// Guardar otros tipos de documentos
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

const debugPDF = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT nombre_archivo, octet_length(doc_conv) AS tamaño FROM convocatorias_archivos WHERE id_convocatoria = $1',
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Convocatoria o archivo no encontrado' });
    }
    res.json({
      nombreArchivo: result.rows[0].nombre_archivo,
      tamañoBytes: result.rows[0].tamaño
    });
  } catch (error) {
    console.error('Error en ruta debug:', error);
    res.status(500).json({ error: 'Error en la consulta', details: error.message });
  }
};
// Exportar todas las funciones
module.exports = { generatePDF, viewPDF, downloadPDF, deletePDF, uploadPDF, guardarDocumentoPorTipo, generarPDFLocal,debugPDF};
