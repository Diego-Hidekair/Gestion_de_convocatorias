// backend/templates/extraordinario.js
function capitalizarNombrePropio(nombre) {
  if (!nombre || typeof nombre !== 'string') return '';
  return nombre
    .toLowerCase()
    .split(' ')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

function toMinusculas(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto.toLowerCase();
}

function capitalizarPrimeraLetra(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

function generateExtraordinarioHTML(convocatoria) {
  const fechaFin = new Date(convocatoria.fecha_fin);
  const diaSemana = fechaFin.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaFin = fechaFin.getDate().toString().padStart(2, '0');
  const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'long' });
  const anioFin = fechaFin.getFullYear();

  let textoGestion = "";
  if (convocatoria.gestion === "GESTION 1") {
    textoGestion = `SOLO POR LA GESTION 1/${anioFin}`;
  } else if (convocatoria.gestion === "GESTION 2") {
    textoGestion = `SOLO POR LA GESTION 2/${anioFin}`;
  } else if (convocatoria.gestion === "GESTION 1 Y 2") {
    textoGestion = `POR LA GESTION/${anioFin}`;
  }

  // Agrupar materias por ítem
  const materiasPorItem = {};
  convocatoria.materias.forEach(materia => {
    const item = materia.item || 'A'; // Default a 'A' si no tiene item
    if (!materiasPorItem[item]) {
      materiasPorItem[item] = [];
    }
    materiasPorItem[item].push(materia);
  });

  // Generar tablas separadas por ítem
  const tablasPorItem = Object.entries(materiasPorItem).map(([item, materias]) => {
    const tablaMaterias = materias.map((m, index) => {
      if (index === 0) {
        return `<tr>
          <td>${m.cod_materia}</td>
          <td>${m.materia}</td>
          <td>${m.total_horas}</td>
          <td rowspan="${materias.length}">${convocatoria.perfil_profesional}</td>
        </tr>`;
      } else {
        return `<tr>
          <td>${m.cod_materia}</td>
          <td>${m.materia}</td>
          <td>${m.total_horas}</td>
        </tr>`;
      }
    }).join('');

    const totalHorasItem = materias.reduce((sum, m) => sum + (m.total_horas || 0), 0);

    return `
      <p><strong>ITEM "${item}" - ${convocatoria.tipo_jornada}</strong></p>
      <table>
        <tr>
          <th>SIGLA</th>
          <th>MATERIA</th>
          <th>HORAS SEMANA</th>
          <th>PERFIL REQUERIDO</th>
        </tr>
        ${tablaMaterias}
        <tr>
          <td colspan="2"><strong>TOTAL HORAS ITEM ${item}</strong></td>
          <td><strong>${totalHorasItem}</strong></td>
          <td></td>
        </tr>
      </table>
    `;
  }).join('');

  // Calcular total general de horas
  const totalHorasGeneral = convocatoria.materias.reduce((sum, m) => sum + (m.total_horas || 0), 0);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'leelawadee', sans-serif;
      font-size: 11pt;
      margin: 2pt;
      line-height: 16pt;
      position: relative;
      text-align: justify;
    }
    h1, h2, h3 {
      text-align: center;
      font-weight: bold;
    }
    h1 {
      font-size: 12pt;
    }
    h3 {
      font-size: 12pt;
      text-align: left;
    }
    p, li, pre {
      text-align: justify;
      text-indent: 36pt;
      font-size: 11pt;
      margin-bottom: 2pt;
      line-height: 16pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #000;
      padding: 6px;
      text-align: center;
    }
    ul {
      margin-top: 0;
      padding-left: 20pt;
    }
    .centrado {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .subrayado {
      text-decoration: underline;
    }
    .numero-convocatoria {
      position: absolute;
      top: 1cm;
      right: 1cm;
      font-size: 10pt;
      color: #555;
    }
    .total-general {
      margin-top: 15px;
      font-weight: bold;
      text-align: right;
    }
  </style>
</head>
<body>
  <div style="text-align: right; margin-bottom: 10px;">
    <strong>CON_N° ${convocatoria.id_convocatoria}</strong>
  </div>
  
  <h1 class="centrado bold">
    ${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS PARA LA PROVISIÓN DE DOCENTE EXTRAORDINARIO EN CALIDAD INTERINO A ${convocatoria.tipo_jornada} DE LA CARRERA DE ${convocatoria.programa} ${textoGestion}
  </h1>
  
  <p>
    Por determinación de la Comisión de Estudios de la Carrera de ${capitalizarNombrePropio(convocatoria.programa)}, mediante Dictamen N°${convocatoria.dictamen}/${anioFin} homologado por Resolución del Consejo Facultativo N°${convocatoria.resolucion}/${anioFin} de la Facultad de <strong>${capitalizarNombrePropio(convocatoria.nombre_facultad)}</strong>; se convoca a los profesionales "<strong>${toMinusculas(convocatoria.perfil_profesional)}</strong>", al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, como <strong>Docente Extraordinario en calidad de Interino</strong> a ${capitalizarNombrePropio(convocatoria.tipo_jornada)}, solo por la gestión académica ${anioFin}.
  </p>
  
  <h3><strong>1. MATERIAS OBJETO DE LA CONVOCATORIA:</strong></h3>
  
  ${tablasPorItem}
  
  <div class="total-general">
    <strong>TOTAL GENERAL DE HORAS: ${totalHorasGeneral}</strong>
  </div>
  
  <p>Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la Universidad Boliviana que cumplan los siguientes requisitos mínimos habilitantes de acuerdo al XII Congreso Nacional de Universidades.</p>
  
  <h3><strong>2. REQUISITOS MÍNIMOS HABILITANTES:</strong></h3>
  <ul>
    <li><strong>a)</strong> Carta de solicitud de postulación dirigida al señor Decano de la Facultad de ${convocatoria.nombre_facultad}, especificando la(s) asignatura(s) a la(s) que postula.</li>
    <li><strong>b)</strong> Curriculum vitae debidamente documentado, adjuntando fotocopias simples. El convocante se reservará el derecho de solicitar la presentación de los documentos originales. (Incisos c.i y c.6 del Art 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaria General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las universidades del Sistema de la Universidad Boliviana. (Art. 77 inc. c.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong></li>
    <li><strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las Universidades del Sistema de la Universidad Boliviana. (Art.77 inc. c.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong></li>
    <li><strong>e)</strong> Fotocopia de la Cédula de Identidad, con verificación de datos por Secretaría General de la Universidad Autónoma "Tomás Frías"<strong>ACTUALIZADA</strong></li>
    <li><strong>f)</strong> Fotocopia del Título de Maestría, Doctorado y/o Diplomado en Educación Superior como mínimo, dictado o reconocido por el Sistema de la Universidad Boliviana, (Art. 71 inc. e y art. 77 inc. C.4 del Reglamento del Régimen Académico Docente de la Universidad Boliviana), legalizado por la Universidad que confirió dicho documento, debidamente actualizada.</li>
    <li><strong>g)</strong> Acreditar experiencia profesional no menor a dos años, a partir de la obtención del Título en Provisión Nacional. (Art. 71 inc. c y art. 77 inc. c.3 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>h)</strong> Certificación actualizada de no tener procesos Universitarios otorgado por la Secretaria General de la Universidad Autónoma "Tomás Frías".</li>
    <li><strong>i)</strong> Certificación actualizada de no tener antecedentes anti autonomistas, en nuestra Universidad, otorgado por la Secretaria General de la Universidad Autónoma "Tomás Frías".</li>
    <li><strong>j)</strong> Plan de trabajo correspondiente a las materias que postula con un enfoque basado en competencias en la modalidad presencial, semipresencial de acuerdo a las características de las asignaturas de la Carrera, este plan debe ser factible para los recursos con que cuenta la Universidad Autónoma "Tomás Frías" (art. 77 inc. c.8 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>k)</strong> Certificación actualizada de no tener cuentas pendientes con la Carrera o Universidad Autónoma "Tomás Frías" (cursos de Posgrado y otras obligaciones pendientes de pago o rendición de cuentas). Expedido por la Dirección Administrativa Financiera.</li>
    <li><strong>l)</strong> Declaración jurada, actualizada, ante Notario de Fe Pública que especifique los siguientes extremos:<br> 1. No estar comprendido en: las incompatibilidades establecidas por el Reglamento de Incompatibilidades aprobado por el Honorable Consejo Universitario (Resolución N° 86-2007 delHCU).<br> 2. No estar comprendido dentro de las limitaciones establecidas en el artículo 12 del Decreto Supremo 4848 (remuneración máxima en el sector público) y artículo 24 (doble percepción) del Decreto Supremo 4848.</li>
    <li><strong>m)</strong> Certificación de manejo de entornos virtuales para la enseñanza virtual acorde al área de conocimiento que postula</li>
  </ul>
  
  <h3><strong>3. OTROS REQUISITOS</strong></h3>
  <ul>
    <p><strong>a)</strong> Producción intelectual (libros, ensayos, folletos, artículos de revistas y otros) que será valorado en el proceso de calificación.</p>
    <p class="subrayado">La no presentación de uno de los requisitos MÍNIMOS HABILITANTES, dará lugar a la inhabilitación de su postulación.</p>
    <p>El profesional que resulte ganador tiene la obligación de presentar de manera obligatoria para la firma de contrato, la siguiente documentación:</p>
  </ul>
  <ul>
    <li><strong>1)</strong> Certificado CENVI emitida por el Consejo de la Magistratura.</li>
    <li><strong>2)</strong> Certificado actualizado de no tener antecedentes penales (REJAP) emitido por el Consejo de la Magistratura.</li>
  </ul>
  
  <p>Se deja claramente establecido que la documentación presentada no será devuelta. Las postulaciones deberán ser presentadas en la Secretaría de la Facultad de ${capitalizarNombrePropio(convocatoria.nombre_facultad)}, en sobre cerrado dirigido al señor Decano de la Facultad de ${capitalizarNombrePropio(convocatoria.nombre_facultad)}; , adjuntando los requisitos exigidos debidamente foliados, con el siguiente rótulo:</p>
  
  <pre>
Señor Decano de la Facultad de ${capitalizarNombrePropio(convocatoria.nombre_facultad)}
Postulación a Concurso de Méritos para Provisión de Docente Extraordinario en Calidad de Interino para la Carrera de ${capitalizarNombrePropio(convocatoria.programa)}
Gestión Académica ${anioFin}
Ítem al cual postula: 
Nombre del Postulante: 
Celular y/o teléfono: 
Presente
  </pre>
  
  <p style="margin-top: 2em;">
    El plazo para la presentación de postulación fenece a horas <strong>${convocatoria.plazo_presentacion_horas_formateado}</strong> del día <strong>${diaSemana} ${diaFin} de ${mesFin} de ${anioFin}</strong>, procediéndose con la apertura de sobres el día <strong>${convocatoria.apertura_formateada.dia_semana} ${convocatoria.apertura_formateada.dia} de ${convocatoria.apertura_formateada.mes} de ${convocatoria.apertura_formateada.anio}</strong> a horas <strong>${convocatoria.apertura_formateada.hora}</strong> en oficinas de la Decanatura. Las postulaciones ingresadas fuera de plazo no serán tomadas en cuenta.
  </p>
  
  <p class="centrado">Potosí, ${convocatoria.inicio_formateado.dia_semana} ${convocatoria.inicio_formateado.dia} de ${convocatoria.inicio_formateado.mes} de ${convocatoria.inicio_formateado.anio}</p>
  
  <pre> </pre>
  
  <p style="text-align: left;"><strong>${capitalizarNombrePropio(convocatoria.nombre_decano)}</strong></p>
  <p style="text-align: left;">Decano de la Facultad de ${capitalizarNombrePropio(convocatoria.nombre_facultad)}</p>
  
  <pre> </pre>
  
  <p style="text-align: center;"><strong>V° B°</strong></p>
  
  <pre> </pre>
  
  <p style="text-align: right;">
    <strong>${capitalizarNombrePropio(convocatoria.nombre_vicerector)}</strong>
  </p>
  <p style="text-align: right;">
    Vicerrector de la "U.A.T.F."
  </p>
</body>
</html>`;
}

module.exports = generateExtraordinarioHTML;