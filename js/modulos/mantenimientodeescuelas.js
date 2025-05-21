// modulos/mantenimientodeescuelas.js
console.log("✅ mantenimientodeescuelas.js cargado correctamente");

/**
 * Recopila los datos del formulario de Mantenimiento de Escuelas.
 * @returns {{escuela: string, detalleMantenimiento: string}|{}}
 */
export function obtenerDatosMantenimientodeescuelas() {
  // Busca el contenedor del módulo
  const modulo = document.querySelector('[data-modulo="mantenimientodeescuelas"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo de mantenimiento de escuelas");
    return {};
  }

  // Solo si el switch está activado
  const activo = document.getElementById('switchMantenimientodeescuelas')?.checked;
  console.log("🔍 Switch activo mantenimiento:", activo); // 🧪 Verificación

  if (!activo) {
    return {};
  }

  // Lee los campos
  const escuela = modulo.querySelector('#escuelaSelect')?.value.trim() || '';
  const detalle = modulo.querySelector('#detalleTrabajo')?.value.trim() || '';

  console.log("📦 Datos capturados módulo mantenimiento:", {
    escuela,
    detalleMantenimiento: detalle
  });

  return {
    escuela,
    detalleMantenimiento: detalle
  };
}
