// backend/templates/consultoresLinea.js

function generateConsultoresLineaHTML(convocatoria) {
  const fechaFin = new Date(convocatoria.fecha_fin);
  const diaSemana = fechaFin.toLocaleDateString('es-ES', { weekday: 'long' });
  const diaFin = fechaFin.getDate().toString().padStart(2, '0');
  const mesFin = fechaFin.toLocaleDateString('es-ES', { month: 'long' });
  const anioFin = fechaFin.getFullYear();
  const hoy = new Date();
  const fechaHoy = hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const tablaMaterias = convocatoria.materias.map(m => `
    <tr>
      <td>${m.cod_materia}</td>
      <td>${m.materia}</td>
      <td>${m.total_horas}</td>
      <td>${convocatoria.perfil_profesional}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'leelawadee', sans-serif;
      margin: 2cm;
      font-size: 12pt;
      line-height: 1.5;
    }
    h1, h2, h3 { text-align: center; font-weight: bold; }
    h1 { font-size: 12pt; }
    h2 { font-size: 12pt; }
    h3 { font-size: 12pt; text-align: left; }
    p { text-align: justify; text-indent: 36pt; font-size: 12pt; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #000;
      padding: 6px;
      text-align: center;
    }
    ul { margin-top: 0; padding-left: 20pt; }
    .centrado { text-align: center; }
    .bold { font-weight: bold; }
    .subrayado { text-decoration: underline; }
  </style>
</head>
<body>

<h1 class="centrado bold">
  ${convocatoria.etapa_convocatoria} CONVOCATORIA A CONCURSO DE MÉRITOS PARA LA CONTRATACIÓN DE DOCENTES EN CALIDAD DE CONSULTORES DE LÍNEA A ${convocatoria.tipo_jornada} PARA LA CARRERA DE ${convocatoria.programa} POR LA GESTIÓN ACADÉMICA ${convocatoria.gestion}/${anioFin}
</h1>

<p>
  Por determinación del Consejo de Carrera de ${convocatoria.programa}, mediante Dictamen N°${convocatoria.dictamen}; homologado por Resolución del Consejo Facultativo N°${convocatoria.resolucion} de la Facultad de ${convocatoria.nombre_facultad}; se convoca a los profesionales en ${convocatoria.perfil_profesional}, al <strong>CONCURSO DE MÉRITOS</strong> para optar por la docencia universitaria, como <strong>Docente Consultor de Línea</strong> a ${convocatoria.tipo_jornada}, para la gestión académica ${convocatoria.gestion}/${anioFin}.
</p>

<h3><strong>1) MATERIAS OBJETO DE LA CONVOCATORIA:</strong></h3>
<p><strong>ITEM “1” ${convocatoria.tipo_jornada}</strong>
    ${convocatoria.horas_asignadas ? ` con una carga horaria de <strong>${convocatoria.horas_asignadas} hrs.</strong>` : ''}
</p>
<table>
  <tr>
    <th>SIGLA</th><th>MATERIA</th><th>HORAS SEMANA</th><th>PERFIL REQUERIDO</th>
  </tr>
  ${tablaMaterias}
  <tr>
    <td colspan="2"><strong>TOTAL HORAS</strong></td>
    <td><strong>${convocatoria.totalHoras}</strong></td>
    <td></td>
  </tr>
</table>

<p>Podrán participar todos los profesionales con Título en Provisión Nacional otorgado por la Universidad Boliviana que cumplan los requisitos mínimos habilitantes de acuerdo al XII Congreso Nacional de Universidades.</p>
<p class="subrayado">Nota.- Se deja claramente establecido que NO podrán participar Profesionales que presten sus servicios en otras instituciones públicas (incisos a) y d) de la Ley 856 y profesionales que trabajen en instituciones privadas a Tiempo Completo.</p>

<h3><strong>2. REQUISITOS MÍNIMOS HABILITANTES INDISPENSABLES:</strong></h3>
<p><strong>a)</strong> Carta de postulación <strong>dirigida al señor Rector</strong>, especificando el ítem y las asignaturas a la que postula.</p>
<p><strong>b)</strong> Currículum vitae debidamente documentado, adjuntando fotocopias simples(incisos c.1 y c.6 del Art. 77 del Reglamento del Régimen Académico Docente de la Universidad Boliviana). La Universidad se reservará el derecho de solicitar la presentación de los documentos originales en cualquier momento del proceso de contratación y de manera obligatoria la presentación para la firma de contrato.</p>

<p><strong>c)</strong> Fotocopia legalizada del Diploma Académico por Secretaría General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las universidades del Sistema de la Universidad Boliviana (Art. 77 inc. c.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong>.</p>

<p><strong>d)</strong> Fotocopia legalizada del Título en Provisión Nacional por Secretaría General de la Universidad que confirió dicho documento, el cual debe ser otorgado por una de las universidades del Sistema de la Universidad Boliviana (Art. 77 inc. c.2 Reglamento del Régimen Académico Docente de la Universidad Boliviana) <strong>ACTUALIZADA</strong>.</p>

<p><strong>e)</strong> Fotocopia de la Cédula de Identidad, con verificación de datos por Secretaría General de la Universidad Autónoma “Tomás Frías” <strong>ACTUALIZADA</strong>.</p>

<p><strong>f)</strong> Fotocopia del Título de Maestría o Doctorado y/o Certificado de Diplomado en Educación Superior como mínimo, dictado o reconocido por una de las Universidades del Sistema de la Universidad Boliviana. (art. 71 inc. e y art. 77 inc. c.4 del Reglamento del Régimen Académico Docente de la Universidad Boliviana), legalizado por la Universidad que confirió dicho documento <strong>ACTUALIZADA</strong>.</p>

<p><strong>g)</strong> Acreditar experiencia profesional no menor a dos años, computable a partir de la obtención del Título en Provisión Nacional. (Art. 71 inc. c y art. 77 inc. c.3 del Reglamento del Régimen Académico Docente de la Universidad Boliviana). </p>

<p><strong>h)</strong> Certificación actualizada de no tener procesos Universitarios otorgado por la Secretaria General de la Universidad Autónoma “Tomás Frías”. </p>

<p><strong>i)</strong> Certificación actualizada de no tener antecedentes anti autonomistas, en nuestra Universidad, otorgado por la Secretaria General de la Universidad Autónoma “Tomás Frías”. </p>

<p><strong>j)</strong> Plan de trabajo correspondiente a las materias que postula con un enfoque basado en competencias en la modalidad presencial, semipresencial de acuerdo a las características de las asignaturas de la Carrera, este plan debe ser factible para los  recursos con que cuenta la Universidad Autónoma “Tomás Frías” (art. 77 inc. c.8 del Reglamento del Régimen Académico Docente de la Universidad Boliviana). </p>

<p><strong>k)</strong> Certificación actualizada de no tener cuentas pendientes con la Carrera o Universidad Autónoma “Tomás Frías” (cursos de Postgrado y otras obligaciones pendientes de pago o rendición de cuentas). Expedido por la Dirección Administrativa Financiera. </p>

<p><strong>l)</strong> Declaración jurada, actualizada, ante Notario de Fe Pública que especifique los siguientes extremos: </p>
<P>   1. No estar comprendido en: las incompatibilidades establecidas por el
         Reglamento de Incompatibilidades aprobado por el Honorable Consejo
         Universitario (Resolución N° 86-2007 del HCU). 
      2. No estar comprendido dentro de las limitaciones establecidas en el
         artículo 12 del Decreto Supremo 4848 (remuneración máxima en el
         sector público) y artículo 24 (doble percepción) del Decreto
         Supremo 4848.  </p>

<p><strong>m)</strong> Certificación de manejo de entornos virtuales para la enseñanza virtual acorde al área de conocimiento que postula.</p>

<h3><strong>3. OTROS REQUISITOS</strong></h3>
<p><strong>a)</strong> Producción intelectual (libros, ensayos, folletos, artículos de revistas y otros) que será valorado en el proceso de calificación.</p>
<p class="subrayado">La no presentación de uno de los requisitos MÍNIMOS HABILITANTES, dará lugar a la inhabilitación de su postulación</p>

<p>
  El profesional que resulte ganador tiene la obligación de presentar de manera obligatoria para la firma de contrato, la siguiente documentación: 
</p>
<p>     1) Certificado CENVI emitida por el Consejo de la Magistratura. 
        2) Certificado actualizado de no tener antecedentes penales (REJAP)
         emitido por el Consejo de la Magistratura.</p>
<p> Se deja claramente establecido que la documentación presentada no será devuelta.</p>

<h3><strong>4. HONORARIOS</strong></h3>
<table>
  <tr>
    <th>Docente consultor de Línea</th>
    <th>Pago mensual (Bs.)</th>
  </tr>
  <tr>
    <td>Docente consultor de Línea (${convocatoria.tipo_jornada})</td>
    <td>${convocatoria.pago_mensual}</td>
  </tr>
</table>

<p>Los honorarios del Consultor serán cancelados en forma mensual, previa presentación de los requisitos exigidos por la División de Tesoro dependiente de la Dirección Administrativa y Financiera. </p>

<p>El Pago de los impuestos de ley es responsabilidad exclusiva del consultor, debiendo presentar factura o una fotocopia de su declaración jurada trimestral en Impuestos Nacionales, caso contrario se realizará la retención correspondiente a los impuestos de ley. El consultor será responsable de realizar los pagos de los aportes establecidos en la ley 065 de Pensiones y su Reglamentación. </p>

<h3><strong>5. POSTULACIONES.</strong></h3>
<p>Las postulaciones deberán ser presentadas en Secretaria de Rectorado, Edificio Administrativo, 4to. Piso de la Universidad Autónoma “Tomás Frías” ubicada en Av. Cívica esquina Serrudo, en sobre cerrado dirigido al señor Rector, adjuntando los requisitos exigidos debidamente foliados, con el siguiente rótulo: </p>

<pre>
Señor:
Rector de la Universidad Autónoma “Tomás Frías”
Postulación a la ${convocatoria.etapa_convocatoria} Convocatoria a Concurso de Méritos...
Gestión Académica ${convocatoria.gestion}/${anioFin}
Ítem 1 ${convocatoria.tipo_jornada}
Nombre del Postulante:
Celular y/o teléfono:
Presente
</pre>
<p>El plazo para la presentación de postulación fenece a horas 12:00 del día <strong>${diaSemana} ${diaFin} de ${mesFin} de ${anioFin}</strong> procediéndose con la apertura de sobres a horas 14:30 en oficinas de la Dirección Administrativa y Financiera D.A.F., las postulaciones presentadas fuera de plazo no serán tomadas en cuenta. </p>
<p class="centrado">Potosí, ${fechaHoy}</p>



<pre>
  
  



</pre>

<p style="text-align: left;"><strong>${convocatoria.nombre_decano}</strong><br>Decano de la Facultad de ${convocatoria.nombre_facultad}</p>
 <pre>
 </pre>
  
  <p style="text-align: center;"><strong>V° B°</strong></p>
  <pre>
 </pre>
<p style="text-align: right;"><strong>${convocatoria.nombre_vicerector}</strong><br>VICERRECTOR UNIVERSIDAD AUTÓNOMA "TOMÁS FRÍAS"</p>

</body>
</html>`;
}

module.exports = generateConsultoresLineaHTML;
