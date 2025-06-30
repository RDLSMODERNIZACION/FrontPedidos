import { archivoAObjetoBase64 } from '../helpers/base64.js';

console.log("✅ obras.js cargado correctamente");

export async function obtenerDatosObras() {
  const modulo = document.querySelector('[data-modulo="obras"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo de obras");
    return {};
  }

  console.log("🧪 obtenerDatosObras: módulo encontrado");

  const tipoSeleccionado = modulo.querySelector('input[name="tipo"]:checked')?.value || '';

  // 🔐 Inicializamos con anexo como objeto vacío y base64 vacío
  const datos = {
    tipo: tipoSeleccionado,
    obra: '',
    anexo: {
      base64: '',
      nombre: ''
    }
  };

  if (tipoSeleccionado === 'existente') {
    datos.obra = modulo.querySelector('#obra')?.value.trim() || '';

  } else if (tipoSeleccionado === 'nueva') {
    const inputFile = modulo.querySelector('#anexo2Archivo');
    const archivo = inputFile?.files?.[0];

    if (archivo) {
      console.log("🧪 obtenerDatosObras: archivo seleccionado", archivo.name);
      const base64obj = await archivoAObjetoBase64(archivo);
      datos.obra = archivo.name;
      datos.anexo = {
        base64: base64obj.base64 || '',
        nombre: archivo.name
      };
    } else {
      console.warn("⚠ Se seleccionó tipo 'nueva', pero no hay archivo adjunto");
    }

  } else if (tipoSeleccionado === 'otra') {
    datos.obra = modulo.querySelector('#detalleOtraObra')?.value.trim() || '';
  }

  console.log("📦 Datos capturados módulo obras:", datos);
  return datos;
}
