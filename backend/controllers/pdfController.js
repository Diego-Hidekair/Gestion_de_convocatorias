// backend/controllers/pdfController.js
const { Pool, types } = require('pg');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');


const generateConsultoresLineaHTML = require('../templates/consultoresLinea');
const generateOrdinarioHTML = require('../templates/ordinario');
const generateExtraordinarioHTML = require('../templates/extraordinario');

types.setTypeParser(17, val => val); 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Función para generar PDF en buffer usando Puppeteer y HTML
const generarPDFBuffer = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
 const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500)); // espera para que cargue bien

  const pdfBuffer = await page.pdf({ format: 'A4' });
 const outputPath = path.join(__dirname, '../pdfs/prueba.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log('✅ PDF generado y guardado localmente en:', outputPath);

  await browser.close();
  return pdfBuffer;
};

// Controlador para generar y guardar PDF según tipo de convocatoria
const generateAndSavePDF = async (req, res) => {
  const { id } = req.params;

  try {
    const convocatoriaRes = await pool.query(
  `SELECT * FROM convocatorias WHERE id_convocatoria = $1`,
  [id]
);

if (convocatoriaRes.rows.length === 0) {
  return res.status(404).json({ error: 'Convocatoria no encontrada' });
}

const convocatoria = convocatoriaRes.rows[0];

const materiasRes = await pool.query(
  `SELECT * FROM convocatorias_materias WHERE id_convocatoria = $1`,
  [id]
);

const materias = materiasRes.rows;
const totalHoras = materias.reduce((acc, m) => acc + (m.total_horas || 0), 0);

console.log('📄 Convocatoria:', convocatoria);
console.log('📘 Materias:', materias);

let htmlContent = '';
if (convocatoria.id_tipoconvocatoria === 1) {
  htmlContent = await generateOrdinarioHTML(convocatoria, materias, totalHoras);
} else if (convocatoria.id_tipoconvocatoria === 2) {
  htmlContent = await generateExtraordinarioHTML(convocatoria, materias, totalHoras);
} else if (convocatoria.id_tipoconvocatoria === 3) {
  htmlContent = await generateConsultoresLineaHTML(convocatoria, materias, totalHoras);
} else {
  return res.status(400).json({ error: 'Tipo de convocatoria inválido' });
}

console.log('📝 HTML generado:\n', htmlContent);
    const pdfBuffer = await generarPDFBuffer(htmlContent);
    // Guardar o actualizar en convocatorias_archivos
    await pool.query(
      `INSERT INTO convocatorias_archivos (id_convocatoria, nombre_archivo, doc_conv)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_convocatoria) DO UPDATE
       SET nombre_archivo = EXCLUDED.nombre_archivo,
           doc_conv = EXCLUDED.doc_conv`,
      [id, `convocatoria_${id}.pdf`, pdfBuffer]
    );

    // Responder con el PDF generado para ver en navegador
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error generando el PDF' });
  }
};

// Controlador para ver PDF guardado (doc_conv)
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

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
    res.send(result.rows[0].doc_conv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar el PDF' });
  }
};

module.exports = {
  generateAndSavePDF,
  viewPDF
};
