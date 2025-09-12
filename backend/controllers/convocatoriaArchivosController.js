// backend/controllers/convocatoriaArchivosController.js
const { Pool } = require('pg');
const puppeteer = require('puppeteer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const generateConsultoresLineaHTML = require('../templates/consultoresLinea');
const generateOrdinarioHTML = require('../templates/ordinario');
const generateExtraordinarioHTML = require('../templates/extraordinario');


const os = require('os');
//const BASE_DESKTOP = path.join(os.homedir(), 'Desktop', 'convocatorias');
const BASE_DOCUMENTS = path.join(os.homedir(), 'Documents', 'convocatorias');

const safe = s => s.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');

const generarPDFBuffer = async html => {
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const buf = await page.pdf({ 
    format: 'A4', 
    printBackground: true,
    margin: {
      top: '2cm',
      right: '2cm',
      bottom: '2cm',
      left: '2cm'
    }
  });
  await browser.close();
  return buf;
};

const getDirs = (facultad, programa, tipo, id) => {
  const baseDir = path.join(BASE_DOCUMENTS, safe(facultad), safe(programa), safe(tipo), `convocatoria_${id}`);
  const pdfPath = path.join(baseDir, `convocatoria_${id}.pdf`);
  return { baseDir, pdfPath };
};

const getConvocatoriaCompleta = async (id) => {
  try {
    const convocatoriaQuery = `
      SELECT 
        c.*, 
        tc.nombre_tipo_conv, 
        tc.titulo_tipo_conv,
        p.programa, 
        f.facultad,
        f.nombre_decano,
        vr.nombre_vicerector,
        c.tipo_jornada
      FROM convocatorias c
      JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
      JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
      JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
      JOIN vicerrector vr ON c.id_vicerector = vr.id_vicerector
      WHERE c.id_convocatoria = $1
    `;

    const convRes = await pool.query(convocatoriaQuery, [id]);
    if (convRes.rowCount === 0) return null;

    const conv = convRes.rows[0];

    const materiasRes = await pool.query(`
      SELECT 
        cm.*, 
        m.materia, 
        m.cod_materia,
        m.horas_teoria,
        m.horas_practica,
        m.horas_laboratorio,
        (COALESCE(m.horas_teoria,0) + COALESCE(m.horas_practica,0) + COALESCE(m.horas_laboratorio,0)) AS total_horas
      FROM convocatorias_materias cm
      JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
      WHERE cm.id_convocatoria = $1
    `, [id]);

    const horasAsignadasRes = await pool.query(`
      SELECT SUM(total_horas) AS horas_asignadas
      FROM convocatorias_materias
      WHERE id_convocatoria = $1
    `, [id]);

    const horasAsignadas = horasAsignadasRes.rows[0]?.horas_asignadas || 0;
    return {
      ...conv,
      materias: materiasRes.rows,
      totalHoras: materiasRes.rows.reduce((acc, m) => acc + (m.total_horas || 0), 0),
      horas_asignadas: horasAsignadas
    };
  } catch (error) {
    console.error('❌ Error en getConvocatoriaCompleta:', error);
    throw error;
  }
};


exports.generateConvocatoriaPDF = async (req, res) => {
  
  const { id } = req.params;
  try {
    // Obtener todos los datos necesarios de la convocatoria
    const convocatoria = await getConvocatoriaCompleta(id);
    if (!convocatoria) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }
    if (convocatoria.apertura_sobres) {
      const apertura = new Date(convocatoria.apertura_sobres);
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      convocatoria.apertura_formateada = {
        dia_semana: diasSemana[apertura.getDay()],
        dia: apertura.getDate(),
        mes: meses[apertura.getMonth()],
        anio: apertura.getFullYear(),
        hora: apertura.toTimeString().substring(0, 5)
      };
    }
      if (convocatoria.plazo_presentacion_horas) {
      convocatoria.plazo_presentacion_horas_formateado = convocatoria.plazo_presentacion_horas.substring(0, 5);
    }
    if (convocatoria.fecha_inicio) {
      const inicio = new Date(convocatoria.fecha_inicio);
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      convocatoria.inicio_formateado = {
        dia_semana: diasSemana[inicio.getDay()],
        dia: inicio.getDate(),
        mes: meses[inicio.getMonth()],
        anio: inicio.getFullYear()
      };
    }
    const archivosObligatorios = await pool.query(`
      SELECT resolucion, dictamen, certificado_presupuestario 
      FROM convocatorias_archivos 
      WHERE id_convocatoria = $1
    `, [id]);

    if (!archivosObligatorios.rowCount) {
      return res.status(400).json({ error: 'No se encontraron archivos vinculados a la convocatoria.' });
    }

    const { resolucion, dictamen, certificado_presupuestario } = archivosObligatorios.rows[0];

    if (!resolucion || !dictamen || !certificado_presupuestario) {
      return res.status(400).json({
        error: 'Faltan documentos obligatorios para generar el PDF',
        faltantes: {
          resolucion: !!resolucion,
          dictamen: !!dictamen,
          certificado_presupuestario: !!certificado_presupuestario
        } 
      });
    }
    const tipo = convocatoria.nombre_tipo_conv.trim().toUpperCase();
convocatoria.nombre_facultad = convocatoria.facultad;
convocatoria.nombre_programa = convocatoria.programa;
let html;
switch (tipo) {
  case 'DOCENTE EN CALIDAD ORDINARIO':
    html = await generateOrdinarioHTML(convocatoria);
    break;
  case 'DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA':
    html = await generateConsultoresLineaHTML(convocatoria);
    break;
  case 'DOCENTE EN CALIDAD EXTRAORDINARIO':
    html = await generateExtraordinarioHTML(convocatoria);
    break;
  default:
    return res.status(400).json({
      error: 'Tipo de convocatoria no soportado',
      details: `Tipo recibido: ${convocatoria.nombre_tipo_conv}`
    });
}

    // Generar el PDF
    const buffer = await generarPDFBuffer(html);
    
    // Guardar el PDF en el sistema de archivos
    const { baseDir, pdfPath } = getDirs(
      convocatoria.facultad,
      convocatoria.programa,
      convocatoria.nombre_tipo_conv,
      id
    );
    
    fs.mkdirSync(baseDir, { recursive: true });
    fs.writeFileSync(pdfPath, buffer);

    const relPath = path.relative(BASE_DOCUMENTS, pdfPath).replace(/\\/g, '/');
    await pool.query(`
      UPDATE convocatorias_archivos
      SET nombre_archivo = $1, doc_conv = $2
      WHERE id_convocatoria = $3
    `, [`convocatoria_${id}.pdf`, relPath, id]);

    // Enviar el PDF como respuesta
   res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=convocatoria_${id}.pdf`);
    res.send(buffer);

  } catch (e) {
    console.error('Error al generar PDF:', e);
    res.status(500).json({ 
      error: 'Error generando el PDF',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

exports.viewConvocatoriaPDF = async (req, res) => {
  const { id } = req.params;

  try {
    const row = (await pool.query(`
      SELECT nombre_archivo, doc_conv FROM convocatorias_archivos WHERE id_convocatoria = $1
    `, [id])).rows[0];

   if (!row?.doc_conv) return res.status(404).json({ error: 'PDF no generado aún' });

    const file = path.join(BASE_DOCUMENTS, row.doc_conv); // CAMBIO AQUI
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Archivo no encontrado en disco' });


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${row.nombre_archivo}`);
    fs.createReadStream(file).pipe(res);
  } catch (e) {
  console.error('Error visualizando PDF:', e);
  res.status(500).json({ error: 'Error al visualizar PDF' });
}
};

const upload = multer({ storage: multer.memoryStorage() });
exports.uploadFileByType = upload.single('file');

const tipos = ['resolucion', 'dictamen', 'carta', 'nota', 'certificado_item', 'certificado_presupuestario'];

exports.handleUploadByType = async (req, res) => {
  const { id, tipo } = req.params;
  if (!tipos.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });
  if (!req.file) return res.status(400).json({ error: 'Archivo no recibido' });

  try {
    const conv = (await pool.query(`
      SELECT c.id_convocatoria, tc.nombre_tipo_conv, p.programa, f.facultad
      FROM convocatorias c
      JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
      JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
      JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
      WHERE c.id_convocatoria = $1
    `, [id])).rows[0];

    if (!conv) return res.status(404).json({ error: 'Convocatoria no encontrada' });

    const { buffer, originalname } = req.file;
    const { baseDir } = getDirs(conv.facultad, conv.programa, conv.nombre_tipo_conv, id);

    fs.mkdirSync(baseDir, { recursive: true });
    const filename = `${tipo}_${Date.now()}${path.extname(originalname)}`;
    const filePath = path.join(baseDir, filename);
    fs.writeFileSync(filePath, buffer);

    const relPath = path.relative(BASE_DOCUMENTS, filePath).replace(/\\/g, '/');
    await pool.query(`
      UPDATE convocatorias_archivos
      SET ${tipo} = $1
      WHERE id_convocatoria = $2
    `, [relPath, id]);

    res.json({ success: true, path: relPath });
  } catch (err) {
    console.error('Error subiendo archivo adjunto:', err);
    res.status(500).json({ error: 'Error subiendo el archivo adjunto' });
  }
};

exports.viewPDFbyType = async (req, res) => {
  const { id, tipo } = req.params;
  if (!tipos.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });

  const row = (await pool.query(`
    SELECT ${tipo} FROM convocatorias_archivos WHERE id_convocatoria = $1
  `, [id])).rows[0];

  if (!row?.[tipo]) return res.status(404).json({ error: 'Archivo no disponible' });

  const file = path.join(BASE_DOCUMENTS, row[tipo]);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Archivo no encontrado' });

//  console.log('PDF guardado en:', pdfPath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=${path.basename(file)}`);
  fs.createReadStream(file).pipe(res);
};

exports.downloadPDFbyType = async (req, res) => {
  const { id, tipo } = req.params;
  if (!tipos.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });

  const row = (await pool.query(`
    SELECT ${tipo} FROM convocatorias_archivos WHERE id_convocatoria = $1
  `, [id])).rows[0];

  if (!row?.[tipo]) return res.status(404).json({ error: 'Archivo no disponible' });

  const file = path.join(BASE_DOCUMENTS, row[tipo]);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Archivo no encontrado' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${path.basename(file)}`);
  fs.createReadStream(file).pipe(res);
};

exports.deleteFileByType = async (req, res) => {
  const { id, tipo } = req.params;
  if (!tipos.includes(tipo)) return res.status(400).json({ error: 'Tipo inválido' });

  const row = (await pool.query(`
    SELECT ${tipo} FROM convocatorias_archivos WHERE id_convocatoria = $1
  `, [id])).rows[0];

  if (row?.[tipo]) {
    const file = path.join(BASE_DOCUMENTS, row[tipo]);
    if (fs.existsSync(file)) fs.unlinkSync(file);

    await pool.query(`UPDATE convocatorias_archivos SET ${tipo} = NULL WHERE id_convocatoria = $1`, [id]);
  }

  res.json({ success: true });
};

exports.obtenerInfoArchivos = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT 
        nombre_archivo,
        doc_conv IS NOT NULL AS has_pdf,
        resolucion IS NOT NULL AS has_resolucion,
        dictamen IS NOT NULL AS has_dictamen,
        carta IS NOT NULL AS has_carta,
        nota IS NOT NULL AS has_nota,
        certificado_item IS NOT NULL AS has_certificado_item,
        certificado_presupuestario IS NOT NULL AS has_certificado_presupuestario
      FROM convocatorias_archivos
      WHERE id_convocatoria = $1
    `, [id]);

    if (!result.rowCount) return res.status(404).json({ error: 'No se encontró información de archivos' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener información de archivos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};  

exports.handleMultipleUploads = async (req, res) => {
  const { id } = req.params;
  const archivos = req.files;

  try {
    const conv = await pool.query(`
      SELECT tc.nombre_tipo_conv, p.programa, f.facultad
      FROM convocatorias c
      JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
      JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
      JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
      WHERE c.id_convocatoria = $1
    `, [id]);

    if (!conv.rowCount) return res.status(404).json({ error: 'Convocatoria no encontrada' });

    const { facultad, programa, nombre_tipo_conv } = conv.rows[0];
    const { baseDir } = getDirs(facultad, programa, nombre_tipo_conv, id);
    fs.mkdirSync(baseDir, { recursive: true });

    const campos = Object.keys(archivos);
    for (const tipo of campos) {
      const file = archivos[tipo][0];
      const filename = `${tipo}_${Date.now()}${path.extname(file.originalname)}`;
      const filePath = path.join(baseDir, filename);
      fs.writeFileSync(filePath, file.buffer);

      const relPath = path.relative(BASE_DOCUMENTS, filePath).replace(/\\/g, '/');
      await pool.query(`UPDATE convocatorias_archivos SET ${tipo} = $1 WHERE id_convocatoria = $2`, [relPath, id]);
    }

    res.json({ success: true, uploaded: campos });

  } catch (err) {
    console.error('Error subiendo múltiples archivos:', err);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
};


exports.obtenerDetalleConvocatoria = async (req, res) => {
  const { id } = req.params;

  try {
    const convocatoriaRes = await pool.query(`
      SELECT c.*, tc.nombre_tipo_conv, p.programa AS nombre_programa, f.facultad AS nombre_facultad
      FROM convocatorias c
      JOIN tipos_convocatorias tc ON c.id_tipoconvocatoria = tc.id_tipoconvocatoria
      JOIN datos_universidad.alm_programas p ON c.id_programa = p.id_programa
      JOIN datos_universidad.alm_programas_facultades f ON p.id_facultad = f.id_facultad
      WHERE c.id_convocatoria = $1
    `, [id]);

    if (convocatoriaRes.rowCount === 0) {
      return res.status(404).json({ error: 'Convocatoria no encontrada' });
    }

    const materiasRes = await pool.query(`
  SELECT 
    cm.*, 
    m.materia, 
    m.cod_materia,
    m.horas_teoria,
    m.horas_practica,
    m.horas_laboratorio
  FROM convocatorias_materias cm
  JOIN datos_universidad.pln_materias m ON cm.id_materia = m.id_materia
  WHERE cm.id_convocatoria = $1
`, [id]);

const convocatoria = convocatoriaRes.rows[0];

return {
  ...convocatoria,
  materias: materiasRes.rows,
  totalHoras: materiasRes.rows.reduce((acc, m) => acc + (m.total_horas || 0), 0)
};
    const archivosRes = await pool.query(`
      SELECT 
        nombre_archivo,
        doc_conv,
        resolucion,
        dictamen,
        carta,
        nota,
        certificado_item,
        certificado_presupuestario
      FROM convocatorias_archivos
      WHERE id_convocatoria = $1
    `, [id]);

    res.json({
      convocatoria: convocatoriaRes.rows[0],
      materias: materiasRes.rows,
      archivos: archivosRes.rows[0] || {},
    });
  } catch (err) {
    console.error('Error al obtener detalle de la convocatoria:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
 
