export function obtenerDatosReparacion() {
  const modulo = document.querySelector('[data-modulo="reparacion"]');
  const datos = {};

  const tipoReparacion = modulo.querySelector('input[name="tipoReparacion"]:checked')?.value || '';
  datos.rubro = tipoReparacion;

  if (tipoReparacion === 'maquinaria') {
    // Solo tomamos la primera maquinaria-item
    const grupo = modulo.querySelector('#contenedorMaquinarias .maquinaria-item');
    const unidad = grupo?.querySelector('.unidadMaquinaria')?.value?.trim() || '';
    const detalle = grupo?.querySelector('.detalleReparacionMaquinaria')?.value?.trim() || '';

    datos.objeto = unidad;
    datos.detalleReparacion = detalle;

  } else if (tipoReparacion === 'otros') {
    datos.objeto = modulo.querySelector('#nombreOtro')?.value?.trim() || '';
    datos.detalleReparacion = modulo.querySelector('#detalleReparacionOtros')?.value?.trim() || '';

  } else {
    datos.objeto = '';
    datos.detalleReparacion = '';
  }

  return datos;
}
