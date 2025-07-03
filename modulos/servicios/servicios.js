console.log("✅ servicios.js cargado correctamente");

function inicializarModuloServicios() {
  console.log("✅ Inicializando módulo Servicios...");

  const opcionesServicios = document.getElementById('opcionesServicios');
  const tipoServicioRadios = document.getElementsByName('tipoServicio');

  const seccionMantenimiento = document.getElementById('seccionMantenimiento');
  const seccionProfesionales = document.getElementById('seccionProfesionales');
  const seccionServicioOtros = document.getElementById('seccionServicioOtros');

  const detalleMantenimiento = document.getElementById('detalleMantenimiento');
  const tipo = document.getElementById('tipo');
  const detalleServicioOtrosTexto = document.getElementById('detalleServicioOtrosTexto');

  const cronogramaDesde = document.getElementById('cronogramaDesde');
  const cronogramaHasta = document.getElementById('cronogramaHasta');
  const cronogramaHoras = document.getElementById('cronogramaHoras');

  function ocultarTodasLasSecciones() {
    seccionMantenimiento.classList.add('d-none');
    seccionProfesionales.classList.add('d-none');
    seccionServicioOtros.classList.add('d-none');

    if (detalleMantenimiento) detalleMantenimiento.removeAttribute('required');
    if (tipo) tipo.removeAttribute('required');
    if (detalleServicioOtrosTexto) detalleServicioOtrosTexto.removeAttribute('required');
  }

  // Mostrar directamente al cargar
  opcionesServicios.classList.remove('d-none');
  ocultarTodasLasSecciones();

  // Escuchar cambios en los radios
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


// 👇 Cuelga la función en window
window.obtenerDatosServicios = obtenerDatosServicios;

console.log("✅ servicios.js completamente inicializado y listo");