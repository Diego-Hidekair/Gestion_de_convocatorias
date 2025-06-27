//backend/templates/extraordinario.js

function generateExtraordinarioHTML(convocatoria, materias, totalHoras) {
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
      margin: 4cm 3cm 2cm 3cm;
      font-size: 12pt;
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

  <p class="sangria">
    Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la Universidad Boliviana que cumplan los requisitos mínimos habilitantes de acuerdo al XII Congreso Nacional de Universidades.
  </p>
  <p class="subrayado">
    Nota.- Se deja claramente establecido que NO podrán participar Profesionales que presten sus servicios en otras instituciones públicas (incisos a) y d) de la Ley 856 y profesionales que trabajen en instituciones privadas a ${tipoJornada}.
  </p>

  <h3>2. REQUISITOS MÍNIMOS HABILITANTES INDISPENSABLES:</h3>
  ${[
    "Carta de postulación dirigida al señor Rector, especificando el ítem y las asignaturas a la que postula.",
    "Currículum vitae debidamente documentado, adjuntando fotocopias simples...",
    "Fotocopia legalizada del Diploma Académico... (ACTUALIZADA).",
    "Fotocopia legalizada del Título en Provisión Nacional... (ACTUALIZADA).",
    "Fotocopia de la Cédula de Identidad... (ACTUALIZADA).",
    "Fotocopia del Título de Maestría o Diplomado... (ACTUALIZADA).",
    "Acreditar experiencia profesional no menor a dos años...",
    "Certificación actualizada de no tener procesos Universitarios...",
    "Certificación actualizada de no tener antecedentes anti autonomistas...",
    "Plan de trabajo correspondiente a las materias...",
    "Certificación actualizada de no tener cuentas pendientes...",
    "Declaración jurada, actualizada, ante Notario de Fe Pública que especifique: <div class='sangria'>1. No estar comprendido en incompatibilidades...<br>2. No estar comprendido dentro de las limitaciones del D.S. 4848</div>",
    "Certificación de manejo de entornos virtuales..."
  ].map((r, i) => `<p><strong>${String.fromCharCode(97 + i)})</strong> ${r}</p>`).join('')}

  <h3>3. OTROS REQUISITOS:</h3>
  <p><strong>a)</strong> Producción intelectual (libros, ensayos, folletos...).</p>
  <p class="subrayado">La no presentación de uno de los requisitos MÍNIMOS HABILITANTES, dará lugar a la inhabilitación de su postulación.</p>
  <p>El profesional que resulte ganador tiene la obligación de presentar para la firma de contrato:</p>
  <div class="sangria">
    1) Certificado CENVI emitida por el Consejo de la Magistratura.<br>
    2) Certificado actualizado de no tener antecedentes penales (REJAP).
  </div>
  <p>Se deja claramente establecido que la documentación presentada no será devuelta.</p>

  <h3>4. HONORARIOS</h3>
  <table>
    <tr><th>Docente consultor de línea</th><th>Pago mensual (Bs.)</th></tr>
    <tr><td>${perfilProfesional} (${tipoJornada})</td><td>${pagoMensual}</td></tr>
  </table>
  <p class="sangria">
    Los honorarios del Consultor serán cancelados en forma mensual, previa presentación de los requisitos exigidos...
  </p>
  <p class="sangria">
    El Pago de los impuestos de ley es responsabilidad exclusiva del consultor...
  </p>

  <h3>5. POSTULACIONES</h3>
  <p>Las postulaciones deberán ser presentadas en Secretaría de Rectorado, Edificio Administrativo...</p>
  <p class="centrado"><strong>
    Señor:<br>
    Rector de la Universidad Autónoma “Tomás Frías”<br>
    Postulación a la ${convocatoria.etapa_convocatoria} Convocatoria a Concurso de Méritos...<br>
    Gestión Académica 2/${anioFin}<br>
    Ítem 1 ${tipoJornada}<br>
    Nombre del Postulante:<br>
    Celular y/o teléfono:<br>
    Presente
  </strong></p>

  <p>El plazo para la presentación de postulación fenece a horas 12 (medio día) del día <strong>${diaSemana} ${diaFin} de ${mesFin}</strong> de ${anioFin}, procediéndose con la apertura de sobres a horas 14:30...</p>

  <p class="centrado">
    Potosí, ${fechaInicio.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
  </p>

  <table class="firma">
    <tr>
      <td style="text-align: left;">
        M. Sc. Lic. Alberto Morales Colque<br>
        <strong>Decano FF.CC.EE.FF.AA.</strong>
      </td>
      <td style="text-align: center;"><strong>Vº Bº</strong></td>
      <td style="text-align: right;">
        M.Sc. Ing. David Soraide Lozano<br>
        <strong>Vicerrector U.A.T.F.</strong>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}


module.exports = generateExtraordinarioHTML;
