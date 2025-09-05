// backend/templates/ordinario.js
function capitalizarNombrePropio(texto) {
  if (!texto || typeof texto !== 'string') return '';
  return texto
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

function generateOrdinarioHTML(convocatoria) {
  const fechaFin = new Date(convocatoria.fecha_fin);
  const diaSemana = fechaFin.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaFin = fechaFin.getDate().toString().padStart(2, '0');
  const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'long' });
  const anioFin = fechaFin.getFullYear();

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
        return `
          <tr>
            <td>${m.cod_materia}</td>
            <td>${m.materia}</td>
            <td>${m.total_horas}</td>
            <td rowspan="${materias.length}">${convocatoria.perfil_profesional}</td>
          </tr>`;
      } else {
        return `
          <tr>
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
          <th>ASIGNATURA</th>
          <th>HORAS SEMANA</th>
          <th>PERFIL PROFESIONAL</th>
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
    h1, h2, h3 { text-align: center; font-weight: bold; }
    h1 { font-size: 12pt; }
    h2 { font-size: 12pt; }
    h3 { font-size: 12pt; text-align: left; }
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
    ul { margin-top: 0; padding-left: 20pt; }
    .centrado { text-align: center; }
    .bold { font-weight: bold; }
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
  ${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS Y EXÁMENES DE COMPETENCIA PARA LA PROVISIÓN DE DOCENTE ORDINARIO PARA LA CARRERA DE ${convocatoria.programa} - GESTIÓN ${anioFin}
</h1>

<p>
  En aplicación de la Nota de Instrucción N° 001/2023 y N° 043/2023 emitidas por el Señor Rector de la Universidad, y por Dictamen de la Comisión Académica N° 10/2023 homologado por la Resolución del Honorable Consejo Universitario N° 09/2024 y cumpliendo con la normativa universitaria se convoca a los profesionales <strong>${capitalizarNombrePropio(convocatoria.perfil_profesional)}</strong>, a la <strong>${convocatoria.etapa_convocatoria} CONVOCATORIA DE MÉRITOS Y EXÁMENES DE COMPETENCIA</strong> para optar por la docencia universitaria en la categoría de <strong>Docente Ordinario</strong> en aplicación del Art. 70 del Reglamento del Régimen Académico Docente de la Universidad Boliviana, ingresando el ganador como docente Contratado, conforme lo dispone el Art. 72 del mismo cuerpo normativo, para luego ser sometido a evaluación continua y pasar a la categoría de titular, tal como lo establece el Art. 73 del Reglamento referido, como <strong>Docente Ordinario</strong> en la siguiente asignatura:
</p>

<h3><strong>1. MATERIA OBJETO DE LA ${convocatoria.etapa_convocatoria} CONVOCATORIA:</strong></h3>
<p><strong>DOCENTES ORDINARIOS</strong></p>
${tablasPorItem}

<div class="total-general">
  <strong>TOTAL GENERAL DE HORAS: ${totalHorasGeneral}</strong>
</div>

<p>Podrán participar todos ios profesionales con Título en Provisión Nacional otorgado por la Universidad Boliviana que cumplan los siguientes requisitos mínimos habilitantes de acuerdo al XII Congreso Nacional de Universidades.</p>

<h3><strong>2. REQUISITOS MÍNIMOS HABILITANTES</strong></h3>
<ul>
    <li><strong>a)</strong> Carta de solicitud de postulación dirigida al señor Decano de la Facultad de <strong>${convocatoria.nombre_facultad}</strong>especificando la asignatura y sigla a la que postula.</li>
    <li><strong>b)</strong> Curriculum vitae debidamente documentado, adjuntando fotocopias simples. El convocante se reservará el derecho de solicitar la presentación de los documentos originales. (Incisos c.1 y c.6 del Art. 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaría General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las universidades del Sistema de la Universidad Boliviana. (Art. 77 inc. C.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana)<strong>ACTUALIZADA</strong>conforme a la Resolución Rectoral N° 410/2019.</li>
    <li><strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las Universidades del Sistema de la Universidad Boliviana. (Art.77 inc. C.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong>conforme a la Resolución Rectoral N° 410/2019.</li>
    <li><strong>e)</strong>Fotocopia de la Cédula de Identidad, con verificación de datos por Secretaría General de la Universidad Autónoma "Tomás Frías" <strong>ACTUALIZADA</strong>conforme a la Resolución Rectoral N° 410/2019.</li>
    <li><strong>f)</strong> Fotocopia del Título de Maestría, Doctorado y/o Diplomado en Educación Superior como mínimo, dictado o reconocido por el Sistema de la Universidad Boliviana, (Art. 71 inc. E y art. 77 inc. C.4 del Reglamento del Régimen Académico Docente de la Universidad Boliviana), legalizado por la Universidad que confirió dicho documento, debidamente actualizada.</li>
    <li><strong>g)</strong> Acreditar experiencia profesional no menor a dos años, a partir de la obtención del Título en Provisión Nacional. (Art. 71 inc. c y art. 77 inc. c.3 de! Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>h)</strong> Certificación actualizada de no tener procesos Universitarios otorgado por la Secretaria General de la Universidad Autónoma "Tomás Frías".</li>
    <li><strong>¡)</strong> Certificación actualizada de no tener antecedentes anti autonomistas, en nuestra Universidad, otorgado por la Secretaria General de la Universidad Autónoma "Tomás Frías".</li>
    <li><strong>j)</strong> Plan de trabajo correspondiente a las materias que postula con un enfoque basado en competencias en la modalidad presencial y semi presencial, de acuerdo a las características de las asignaturas de la Carrera, este plan debe ser factible para los recursos con que cuenta la Universidad Autónoma "Tomás Frías" (art. 77 inc. c.8 del Reglamento del Régimen Académico Docente de la Universidad Boliviana).</li>
    <li><strong>k)</strong> Certificación actualizada de no tener cuentas pendientes con la Carrera o Universidad Autónoma "Tomás Frías" (cursos de Posgrado y otras obligaciones pendientes de pago o rendición de cuentas). Expedido por la Dirección Administrativa Financiera.</li>
    <li><strong>l)</strong> Declaración Jurada, actualizada, ante Notario de Fe Pública de no estar comprendido dentro de las limitaciones establecidas en el artículo 12 (remuneración máxima en el sector público) y artículo 24 (doble percepción) del D.S. 3755 del 2 de enero de 2019.</li>
    <li><strong>m)</strong> Certificado de curso (con carga horaria mínima de 40 horas) de manejo de entornos virtuales para la enseñanza virtual acorde al área de conocimiento que postula, dictado por una de las Universidades del Sistema de la Universidad. Boliviana.</li>
</ul>
<h3><strong>3. OTROS REQUISITOS</strong></h3>
<ul>
  <li><strong>a)</strong>Documentos que acredite la participación en la vida universitaria del sistema de la Universidad Boliviana.</li>
  <li><strong>b)</strong> Producción intelectual (libros, ensayos, folletos, artículos de revistas y otros) que será valorado en el proceso de calificación.</li>
  <li>La no presentación de uno de los requisitos <strong>MÍNIMOS HABILITANTES</strong> dará lugar a la inhabilitación de la postulación.</li>
</ul>
<p> El profesional que resulte ganador tiene la obligación de presentar de manera obligatoria para la firma de contrato, la siguiente documentación:</p>
<ul>
  <li><strong>1)</strong> Certificado CENVI emitida por el Consejo de la Magistratura.</li>
  <li><strong>2)</strong>Certificado actualizado de no tener antecedentes penales (REJAP) emitido por el Consejo de la Magistratura..</li>
</ul>

<p>Se deja claramente establecido que la documentación presentada no será devuelta.</p>
<p>Queda plenamente establecido que, en aplicación de la Matriz de Cumplimiento suscrita por la Universidad con el Gobierno del Estado Plurinacional de Solivia, el proceso de categorización o recategorización, estará sujeta a los resultados de dicha matriz, en el tiempo establecido en dicho documento.</p>

<p>Se deja claramente establecido que la documentación presentada no será devuelta. Las postulaciones deberán ser presentadas en Secretaría de la Facultad de ${convocatoria.nombre_facultad},Dirigido al Decano de la Facultad de ${convocatoria.nombre_facultad}, adjuntando los requisitos exigidos debidamente foliados, con el siguiente rótulo:</p>

<pre>
Señor
Decano de la Facultad de ${convocatoria.nombre_facultad}
Postulación a ${convocatoria.etapa_convocatoria} Convocatoria a Concurso de Méritos y Examen de Competencia para 
Provisión de Docente Ordinario para la Carrera de ${convocatoria.programa}
Nombre del Postulante:
Celular y/o teléfono:
Sigla y materia a la que postula:
Presente
</pre>

<p style="margin-top: 2em;"> 
  El plazo para la presentación de postulación fenece a horas <strong>${convocatoria.plazo_presentacion_horas_formateado}</strong> del día <strong>${diaSemana} ${diaFin} de ${mesFin} de ${anioFin}</strong>, procediéndose con la apertura de sobres el día <strong>${convocatoria.apertura_formateada.dia_semana} ${convocatoria.apertura_formateada.dia} de ${convocatoria.apertura_formateada.mes} de ${convocatoria.apertura_formateada.anio}</strong> a horas <strong>${convocatoria.apertura_formateada.hora}</strong> en oficinas de la Decanatura. Las postulaciones ingresadas fuera de plazo no serán tomadas en cuenta.
</p>

<p class="centrado">Potosí, ${convocatoria.inicio_formateado.dia_semana} ${convocatoria.inicio_formateado.dia} de ${convocatoria.inicio_formateado.mes} de ${convocatoria.inicio_formateado.anio}</p>

<pre>

  



</pre>

<p style="text-align: left;"><strong>${capitalizarNombrePropio(convocatoria.nombre_decano)}</strong></p>
<p style="text-align: left;">Decano de la Facultad de ${capitalizarNombrePropio(convocatoria.nombre_facultad)}</p>

 <pre>
 </pre>
  
  <p style="text-align: center;"><strong>V° B°</strong></p>
  <pre>
 </pre>
<p style="text-align: right;"> <strong>${capitalizarNombrePropio(convocatoria.nombre_vicerector)}</strong></p> 
<p style="text-align: right;"> Vicerrector de la  "U.A.T.F." </p>

</body>
</html>`;
}

module.exports = generateOrdinarioHTML;