// backend/controllers/pdfController.js
const { Pool, types } = require('pg');
const puppeteer = require('puppeteer');
const generateConsultoresLineaHTML = require('../templates/consultoresLinea');
const generateOrdinarioHTML = require('../templates/ordinario');
const generateExtraordinarioHTML = require('../templates/extraordinario');

types.setTypeParser(17, val => val); // BYTEA como buffer

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// 🧠 Genera PDF en buffer
const generarPDFBuffer = async (htmlContent) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500)); // prevenir errores de carga

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true // 🔧 Importante para evitar PDF negro
  });

  await browser.close();
  return pdfBuffer;
};

// 🧾 Genera y guarda PDF en la base de datos
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

    const materiasRes = await pool.query(`
      SELECT cm.*, m.materia AS materia, m.cod_materia
      FROM convocatorias_materias cm
      JOIN datos_universidad.pln_materias m ON m.id_materia = cm.id_materia
      WHERE cm.id_convocatoria = $1
    `, [id]);

    const materias = materiasRes.rows;
    const totalHoras = materias.reduce((acc, m) => acc + (m.total_horas || 0), 0);

    let htmlContent = '';
    switch (convocatoria.id_tipoconvocatoria) {
      case 1:
        htmlContent = await generateOrdinarioHTML(convocatoria, materias, totalHoras);
        break;
      case 2:
        htmlContent = await generateExtraordinarioHTML(convocatoria, materias, totalHoras);
        break;
      case 3:
        htmlContent = await generateConsultoresLineaHTML(convocatoria, materias, totalHoras);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de convocatoria inválido' });
    }

    const pdfBuffer = await generarPDFBuffer(htmlContent);

    await pool.query(`
      INSERT INTO convocatorias_archivos (id_convocatoria, nombre_archivo, doc_conv)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_convocatoria) DO UPDATE
      SET nombre_archivo = EXCLUDED.nombre_archivo,
          doc_conv = EXCLUDED.doc_conv
    `, [id, `convocatoria_${id}.pdf`, pdfBuffer]);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: 'Error generando el PDF' });
  }
};

const viewPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      'SELECT doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1',
      [id]
    );

    if (!rows[0] || !rows[0].doc_conv) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const pdfBuffer = rows[0].doc_conv;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al visualizar PDF:', error);
    res.status(500).json({ error: 'Error al recuperar el PDF' });
  }
};

module.exports = {
  generateAndSavePDF,
  viewPDF
};
