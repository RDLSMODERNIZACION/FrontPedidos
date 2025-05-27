import { archivoAObjetoBase64 } from '../helpers/base64.js';

export async function obtenerDatosGeneral() {
  console.log("🔍 Iniciando recolección de datos del módulo GENERAL...");

  const modulo = document.querySelector('[data-modulo="general"]');
  const datos = {};

  const campos = modulo.querySelectorAll('input[name], select[name], textarea[name]');
  campos.forEach(campo => {
    const nombre = campo.name;
    if (!nombre) return;

    if (campo.type === 'checkbox') {
      datos[nombre] = campo.checked;
    } else if (campo.type === 'radio') {
      if (campo.checked) datos[nombre] = campo.value;
    } else if (campo.type !== 'file') {
      datos[nombre] = campo.value.trim();
    }
  });

  // 👉 Descomponer el campo "periodo"
  const periodoTexto = datos.periodo || '';
  let [fechaperiododesde, fechaperiodohasta] = periodoTexto.split(' to ').map(x => x?.trim() || '');

  datos.fechadesde = datos.fecha || '';
  datos.fechaperiododesde = convertirMesAnioAFechaISO(fechaperiododesde);
  datos.fechaperiodohasta = fechaperiodohasta;
  datos.observacion = datos.observaciones || '';

  // 🧠 Comparar la fecha del pedido con hoy
  const hoy = new Date().toISOString().slice(0, 10);
  const fechaPedido = datos.fechadesde;

  console.log("📅 Fecha del pedido:", fechaPedido);
  console.log("📅 Fecha actual:", hoy);

  if (fechaPedido && fechaPedido !== hoy) {
    const input1 = document.getElementById('presupuesto1');
    const input2 = document.getElementById('presupuesto2');

    console.log("📂 Input presupuesto1:", input1);
    console.log("📂 Input presupuesto2:", input2);

    console.log("📄 Archivos seleccionados (1):", input1?.files?.length || 0);
    console.log("📄 Archivos seleccionados (2):", input2?.files?.length || 0);

    const archivo1 = await archivoAObjetoBase64(input1);
    const archivo2 = await archivoAObjetoBase64(input2);

    console.log("🧪 Resultado archivo 1:", archivo1);
    console.log("🧪 Resultado archivo 2:", archivo2);

    datos.presupuesto1 = archivo1 || '';
    datos.presupuesto2 = archivo2 || '';

    if (!archivo1) console.warn("⚠️ No se adjuntó presupuesto1");
    if (!archivo2) console.warn("⚠️ No se adjuntó presupuesto2");

  } else {
    console.log("📭 No se requieren presupuestos (fecha de hoy)");
    datos.presupuesto1 = '';
    datos.presupuesto2 = '';
  }

  // 🧹 Limpiar campos que no se usan en backend
  delete datos.periodo;
  delete datos.fecha;
  delete datos.observaciones;

  console.log("📦 Datos capturados de [general]:", datos);
  return datos;
}

function convertirMesAnioAFechaISO(texto) {
  const meses = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };

  const partes = texto.toLowerCase().trim().split(' ');
  if (partes.length === 2 && meses[partes[0]]) {
    const anio = partes[1];
    const mes = meses[partes[0]];
    return `${anio}-${mes}-01`;
  }

  return texto;
}
