export function obtenerDatosReparacion() {
    const modulo = document.querySelector('[data-modulo="reparacion"]');
    const datos = {};
  
    const tipoReparacion = modulo.querySelector('input[name="tipoReparacion"]:checked')?.value || '';
    datos.rubro = tipoReparacion;
  
    if (tipoReparacion === 'maquinaria') {
      const unidades = [];
  
      modulo.querySelectorAll('#contenedorMaquinarias .maquinaria-item').forEach(grupo => {
        const unidad = grupo.querySelector('.unidadMaquinaria')?.value?.trim() || '';
        const detalle = grupo.querySelector('.detalleReparacionMaquinaria')?.value?.trim() || '';
        if (unidad || detalle) unidades.push({ unidad, detalle });
      });
  
      datos.objeto = JSON.stringify(unidades);
      datos.detalleReparacion = '';
    } else if (tipoReparacion === 'otros') {
      datos.objeto = modulo.querySelector('#nombreOtro')?.value?.trim() || '';
      datos.detalleReparacion = modulo.querySelector('#detalleReparacionOtros')?.value?.trim() || '';
    } else {
      datos.objeto = '';
      datos.detalleReparacion = '';
    }
  
    return datos;
  }
  