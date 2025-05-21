console.log("✅ servicios.js cargado correctamente");

function inicializarModuloServicios() {
  console.log("✅ Inicializando módulo Servicios...");

  const switchMostrarServicios = document.getElementById('switchServicios'); // <- ID corregido
  const opcionesServicios = document.getElementById('opcionesServicios');
  const ayudaServiciosBtn = document.getElementById('ayudaServiciosBtn');
  const ayudaTextoServicios = document.getElementById('ayudaTextoServicios');

  const tipoServicioRadios = document.getElementsByName('tipoServicio');

  const seccionMantenimiento = document.getElementById('seccionMantenimiento');
  const seccionProfesionales = document.getElementById('seccionProfesionales');
  const seccionServicioOtros = document.getElementById('seccionServicioOtros');

  const detalleMantenimiento = document.getElementById('detalleMantenimiento');
  const tipo = document.getElementById('tipo'); // <- este es el campo de tipoProfesional que ahora se llama tipo
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

  // Estado inicial
  ocultarTodasLasSecciones();
  opcionesServicios.classList.add('d-none');

  // Mostrar/ocultar todo el módulo
  switchMostrarServicios.addEventListener('change', () => {
    if (switchMostrarServicios.checked) {
      opcionesServicios.classList.remove('d-none');
    } else {
      opcionesServicios.classList.add('d-none');
      ocultarTodasLasSecciones();
      tipoServicioRadios.forEach(r => r.checked = false);
    }
  });

  // Botón de ayuda
  ayudaServiciosBtn.addEventListener('click', () => {
    ayudaTextoServicios.classList.toggle('d-none');
  });

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
