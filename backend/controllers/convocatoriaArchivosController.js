//backend/controllers/convocatoriaArchivosController.js
const pool = require('../db');
const fs = require('fs');
const path = require('path');

const getArchivos = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
        id_conv_doc,
        CASE 
          WHEN doc_conv IS NOT NULL THEN 'Documento Convocatoria'
          WHEN resolucion IS NOT NULL THEN 'Resolución'
          WHEN dictamen IS NOT NULL THEN 'Dictamen'
          WHEN carta IS NOT NULL THEN 'Carta'
          WHEN nota IS NOT NULL THEN 'Nota'
          WHEN certificado_item IS NOT NULL THEN 'Certificado Ítem'
          WHEN certificado_presupuestario IS NOT NULL THEN 'Certificado Presupuestario'
        END as tipo,
        fecha_creacion
      FROM convocatorias_archivos
      WHERE id_convocatoria = $1`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadArchivos = async (req, res) => {
  const { id } = req.params;

  try {
    const existe = await pool.query(
      'SELECT id_conv_doc FROM convocatorias_archivos WHERE id_convocatoria = $1',
      [id]
    );

    const archivos = {
      doc_conv: req.files['doc_conv']?.[0]?.buffer,
      resolucion: req.files['resolucion']?.[0]?.buffer,
      dictamen: req.files['dictamen']?.[0]?.buffer,
      carta: req.files['carta']?.[0]?.buffer,
      nota: req.files['nota']?.[0]?.buffer,
      certificado_item: req.files['certificado_item']?.[0]?.buffer,
      certificado_presupuestario: req.files['certificado_presupuestario']?.[0]?.buffer
    };

    const nombreArchivo = `CONVOCATORIA_${id}_${new Date().toISOString().slice(0,10)}.pdf`;

    if (existe.rows.length > 0) {
      await pool.query(
        `UPDATE convocatorias_archivos SET
          nombre_archivo = $1,
          doc_conv = COALESCE($2, doc_conv),
          resolucion = COALESCE($3, resolucion),
          dictamen = COALESCE($4, dictamen),
          carta = COALESCE($5, carta),
          nota = COALESCE($6, nota),
          certificado_item = COALESCE($7, certificado_item),
          certificado_presupuestario = COALESCE($8, certificado_presupuestario),
          fecha_creacion = CURRENT_TIMESTAMP
        WHERE id_convocatoria = $9`,
        [
          nombreArchivo,
          archivos.doc_conv,
          archivos.resolucion,
          archivos.dictamen,
          archivos.carta,
          archivos.nota,
          archivos.certificado_item,
          archivos.certificado_presupuestario,
          id
        ]
      );
    } else {
       await pool.query(
        `INSERT INTO convocatorias_archivos (
          nombre_archivo, doc_conv, resolucion, dictamen, carta, nota,
          certificado_item, certificado_presupuestario, id_convocatoria
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          nombreArchivo,
          archivos.doc_conv,
          archivos.resolucion,
          archivos.dictamen,
          archivos.carta,
          archivos.nota,
          archivos.certificado_item,
          archivos.certificado_presupuestario,
          id
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ error: error.message });
  }
};

const downloadArchivo = async (req, res) => {
  const { id, tipo } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT ${tipo}, nombre_archivo 
       FROM convocatorias_archivos 
       WHERE id_convocatoria = $1`,
      [id]
    );

    if (!result.rows[0] || !result.rows[0][tipo]) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${result.rows[0].nombre_archivo}`);
    res.send(result.rows[0][tipo]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getArchivos, uploadArchivos, downloadArchivo };