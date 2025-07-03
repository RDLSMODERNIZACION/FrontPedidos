// 📄 alquiler.js

function obtenerDatosAlquiler() {
  const modulo = document.querySelector('[data-modulo="alquiler"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo [alquiler]");
    return {};
  }

  const datos = {};

  datos.rubro = modulo.querySelector('input[name="tipoAlquiler"]:checked')?.value || '';

  datos.detalleUso =
    modulo.querySelector('#usoEdificioAlquiler')?.value ||
    modulo.querySelector('#usoMaquinariaAlquiler')?.value ||
    modulo.querySelector('#usoOtrosAlquiler')?.value || '';

  datos.objeto =
    modulo.querySelector('#ubicacionEdificioAlquiler')?.value ||
    modulo.querySelector('#tipoMaquinariaAlquiler')?.value ||
    modulo.querySelector('#detalleOtrosAlquiler')?.value || '';

  datos.requiereCombustible =
    document.getElementById('combustibleAlquiler')?.checked || false;

  datos.requiereChofer =
    document.getElementById('choferAlquiler')?.checked || false;

  datos.cronogramaDesde =
    document.getElementById('cronogramaDesde')?.value || '';

  datos.cronogramaHasta =
    document.getElementById('cronogramaHasta')?.value || '';

  datos.cronogramaHoras =
    document.getElementById('cronogramaHoras')?.value || '0';

  console.log("📦 Datos capturados de [alquiler]:", datos);
  return datos;
}

// 👇 Esto lo hace accesible desde cualquier lugar
window.obtenerDatosAlquiler = obtenerDatosAlquiler;

console.log("✅ alquiler.js cargado correctamente");
