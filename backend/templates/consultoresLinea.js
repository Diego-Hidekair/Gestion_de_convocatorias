// backend/templates/consultoresLinea.js

function generateConsultoresLineaHTML(convocatoria, materias, totalHoras) {
  const fechaInicio = new Date(convocatoria.fecha_inicio);
  const fechaFin = new Date(convocatoria.fecha_fin);
  const diaSemana = fechaFin.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaFin = fechaFin.getDate().toString().padStart(2, '0');
  const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'long' });
  const anioFin = fechaFin.getFullYear();
  const anioCreacion = new Date().getFullYear();
  const gestionTexto = convocatoria.gestion === 'GESTION 1'
    ? `GESTIÓN ACADÉMICA 1/${fechaInicio.toLocaleDateString('es-ES')}`
    : `GESTIÓN ACADÉMICA 2/${anioCreacion}`;
  const nombreCarrera = convocatoria.programa;
  const nombreFacultad = convocatoria.nombre_facultad;
  const tipoJornada = convocatoria.tipo_jornada;
  const perfilProfesional = convocatoria.perfil_profesional || 'No especificado';
  const pagoMensual = convocatoria.pago_mensual || 0;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      margin: 2cm;
      font-size: 12pt;
      color: #000;
      background: #fff;
    }
    h1, h2, h3 {
      text-align: center;
      font-weight: bold;
    }
    h1 { font-size: 16pt; }
    h2 { font-size: 14pt; margin-top: 20px; }
    h3 { font-size: 13pt; text-align: left; margin-bottom: 10px; }
    p { text-align: justify; }
    .centrado { text-align: center; }
    .negrilla { font-weight: bold; }
    .subrayado { text-decoration: underline; }
    .sangria { text-indent: 2em; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    table, th, td {
      border: 1px solid black;
    }
    th, td {
      padding: 8px;
      text-align: center;
    }
    .firma { width: 100%; margin-top: 40px; }
    .firma td { border: none; }
  </style>
</head>
<body>
  <h1>${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS PARA LA CONTRATACIÓN DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A ${tipoJornada} PARA LA CARRERA DE ${nombreCarrera} POR LA ${gestionTexto}</h1>
  <p class="sangria">
    Por determinación del Consejo de Carrera de <strong>${nombreCarrera}</strong>, mediante Dictamen N° <strong>${convocatoria.dictamen || 'N/A'}</strong>; homologado por Resolución del Consejo Facultativo N° <strong>${convocatoria.resolucion || 'N/A'}</strong> de la Facultad de <strong>${nombreFacultad}</strong>; se convoca a los profesionales en <strong>${perfilProfesional}</strong>, al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, como Docente Consultor de Línea a ${tipoJornada}, para la ${gestionTexto}.
  </p>
  <h3>1. MATERIAS OBJETO DE LA CONVOCATORIA:</h3>
  ${materias.map((_, i) => `<p><strong>ITEM ${i + 1}</strong>: ${tipoJornada}</p>`).join('')}
  <table>
    <thead>
      <tr>
        <th>SIGLA</th>
        <th>MATERIA</th>
        <th>HORAS SEMANA</th>
        <th>PERFIL REQUERIDO</th>
      </tr>
    </thead>
    <tbody>
      ${materias.map((m, i) => `
        <tr>
          <td>${m.cod_materia}</td>
          <td>${m.materia}</td>
          <td>${m.total_horas}</td>
          ${i === 0 ? `<td rowspan="${materias.length}">${perfilProfesional}</td>` : ''}
        </tr>
      `).join('')}
      <tr>
        <td colspan="2"><strong>Total Horas</strong></td>
        <td colspan="2"><strong>${totalHoras}</strong></td>
      </tr>
    </tbody>
  </table>
  <p class="sangria">Podrán participar todos los profesionales con Título en Provisión Nacional...</p>
  <p class="subrayado">Nota.- Se deja claramente establecido que NO podrán participar...</p>
  <h3>2. REQUISITOS MÍNIMOS HABILITANTES INDISPENSABLES:</h3>
  ${[
    "Carta de postulación dirigida al señor Rector...",
    "Currículum vitae debidamente documentado...",
    "Fotocopia legalizada del Diploma Académico...",
    "Fotocopia legalizada del Título en Provisión Nacional...",
    "Fotocopia de la Cédula de Identidad...",
    "Fotocopia del Título de Maestría o Diplomado...",
    "Acreditar experiencia profesional no menor a dos años...",
    "Certificación actualizada de no tener procesos Universitarios...",
    "Certificación actualizada de no tener antecedentes anti autonomistas...",
    "Plan de trabajo correspondiente a las materias...",
    "Certificación actualizada de no tener cuentas pendientes...",
    "Declaración jurada ante Notario de Fe Pública...",
    "Certificación de manejo de entornos virtuales..."
  ].map((r, i) => `<p><strong>${String.fromCharCode(97 + i)})</strong> ${r}</p>`).join('')}
  <h3>3. OTROS REQUISITOS:</h3>
  <p><strong>a)</strong> Producción intelectual (libros, ensayos...).</p>
  <p class="subrayado">La no presentación de uno de los requisitos MÍNIMOS HABILITANTES...</p>
  <p>El profesional que resulte ganador debe presentar:</p>
  <div class="sangria">
    1) Certificado CENVI<br>
    2) Certificado REJAP
  </div>
  <h3>4. HONORARIOS</h3>
  <table>
    <tr><th>Docente consultor de línea</th><th>Pago mensual (Bs.)</th></tr>
    <tr><td>${perfilProfesional} (${tipoJornada})</td><td>${pagoMensual}</td></tr>
  </table>
  <h3>5. POSTULACIONES</h3>
  <p class="centrado"><strong>Señor Rector... Ítem 1, Nombre del Postulante...</strong></p>
  <p>El plazo para la presentación fenece el <strong>${diaSemana} ${diaFin} de ${mesFin}</strong> de ${anioFin}</p>
  <p class="centrado">Potosí, ${fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <table class="firma">
    <tr>
      <td style="text-align: left;">M. Sc. Lic. Alberto Morales Colque<br><strong>Decano FF.CC.EE.FF.AA.</strong></td>
      <td style="text-align: center;"><strong>Vº Bº</strong></td>
      <td style="text-align: right;">M.Sc. Ing. David Soraide Lozano<br><strong>Vicerrector U.A.T.F.</strong></td>
    </tr>
  </table>
</body>
</html>
`;
}

module.exports = generateConsultoresLineaHTML;
