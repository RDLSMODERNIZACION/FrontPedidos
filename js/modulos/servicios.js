console.log("✅ servicios.js cargado correctamente");

export function obtenerDatosServicios() {
  const modulo = document.querySelector('[data-modulo="servicios"]');
  if (!modulo) {
    console.warn("❌ No se encontró el módulo de servicios");
    return {};
  }

  const tipoServicio = modulo.querySelector('input[name="tipoServicio"]:checked')?.value || '';
  const datos = {
    rubro: tipoServicio,
    tipo: '',
    detalleMantenimiento: '',
    cronogramaDesde: '',
    cronogramaHasta: '',
    cronogramaHoras: ''
  };

  if (tipoServicio === 'mantenimiento') {
    datos.detalleMantenimiento = modulo.querySelector('#detalleMantenimiento')?.value.trim() || '';

  } else if (tipoServicio === 'profesionales') {
    datos.tipo = modulo.querySelector('#tipo')?.value.trim() || '';
    datos.cronogramaDesde = modulo.querySelector('#cronogramaDesde')?.value || '';
    datos.cronogramaHasta = modulo.querySelector('#cronogramaHasta')?.value || '';
    datos.cronogramaHoras = modulo.querySelector('#cronogramaHoras')?.value || '';

  } else if (tipoServicio === 'otros') {
    datos.detalleMantenimiento = modulo.querySelector('#detalleServicioOtrosTexto')?.value.trim() || '';
  }

  return datos;
}

function inicializarModuloServicios() {
  console.log("✅ Inicializando módulo Servicios...");

  const switchMostrarServicios = document.getElementById('switchServicios');
  const opcionesServicios = document.getElementById('opcionesServicios');
  const ayudaServiciosBtn = document.getElementById('ayudaServiciosBtn');
  const ayudaTextoServicios = document.getElementById('ayudaTextoServicios');

  const tipoServicioRadios = document.getElementsByName('tipoServicio');

  const seccionMantenimiento = document.getElementById('seccionMantenimiento');
  const seccionProfesionales = document.getElementById('seccionProfesionales');
  const seccionServicioOtros = document.getElementById('seccionServicioOtros');

  const detalleMantenimiento = document.getElementById('detalleMantenimiento');
  const tipo = document.getElementById('tipo');
  const detalleServicioOtrosTexto = document.getElementById('detalleServicioOtrosTexto');

  function ocultarTodasLasSecciones() {
    seccionMantenimiento.classList.add('d-none');
    seccionProfesionales.classList.add('d-none');
    seccionServicioOtros.classList.add('d-none');

    if (detalleMantenimiento) detalleMantenimiento.removeAttribute('required');
    if (tipo) tipo.removeAttribute('required');
    if (detalleServicioOtrosTexto) detalleServicioOtrosTexto.removeAttribute('required');
  }

  ocultarTodasLasSecciones();
  opcionesServicios.classList.add('d-none');

  switchMostrarServicios.addEventListener('change', () => {
    if (switchMostrarServicios.checked) {
      opcionesServicios.classList.remove('d-none');
    } else {
      opcionesServicios.classList.add('d-none');
      ocultarTodasLasSecciones();
      tipoServicioRadios.forEach(r => r.checked = false);
    }
  });

  ayudaServiciosBtn.addEventListener('click', () => {
    ayudaTextoServicios.classList.toggle('d-none');
  });

  tipoServicioRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      ocultarTodasLasSecciones();

      if (radio.id === 'servicioMantenimiento') {
        seccionMantenimiento.classList.remove('d-none');
        if (detalleMantenimiento) detalleMantenimiento.setAttribute('required', 'true');

      } else if (radio.id === 'servicioProfesionales') {
        seccionProfesionales.classList.remove('d-none');
        if (tipo) tipo.setAttribute('required', 'true');

      } else if (radio.id === 'servicioOtros') {
        seccionServicioOtros.classList.remove('d-none');
        if (detalleServicioOtrosTexto) detalleServicioOtrosTexto.setAttribute('required', 'true');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', inicializarModuloServicios);
