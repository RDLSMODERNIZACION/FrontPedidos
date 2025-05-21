console.log("✅ serviciosextension.js cargado");

function inicializarModuloServiciosextension() {
  console.log("✅ Inicializando módulo Servicios Extension...");

  const modulo = document.getElementById('modulo-serviciosextension');

  const tipoServicioRadios = modulo.querySelectorAll('input[name="tipoServicioExtension"]');
  const seccionMantenimiento = modulo.querySelector('#seccionMantenimientoExtension');
  const seccionProfesionales = modulo.querySelector('#seccionProfesionalesExtension');
  const contenedorCronograma = modulo.querySelector('#contenedor-cronograma-extension');

  const tipoMantenimientoRadios = modulo.querySelectorAll('input[name="tipoMantenimientoExtension"]');
  const seccionEscuelas = modulo.querySelector('#seccionEscuelasExtension');
  const seccionOtrosMantenimientos = modulo.querySelector('#seccionOtrosMantenimientosExtension');

  if (!tipoServicioRadios.length) {
    console.error("❌ No se encontraron los radios tipoServicioExtension.");
    return;
  }

  tipoServicioRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      if (modulo.querySelector('#servicioMantenimientoExtension').checked) {
        seccionMantenimiento.classList.remove('d-none');
        seccionProfesionales.classList.add('d-none');
        contenedorCronograma.innerHTML = '';
        limpiarSubseccionesMantenimiento(modulo);
      } 
      else if (modulo.querySelector('#servicioProfesionalesExtension').checked) {
        seccionProfesionales.classList.remove('d-none');
        seccionMantenimiento.classList.add('d-none');
        await cargarComponenteCronogramaExtension(modulo);
      }
    });
  });

  tipoMantenimientoRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      if (modulo.querySelector('#mantenimientoEscuelasExtension').checked) {
        seccionEscuelas.classList.remove('d-none');
        seccionOtrosMantenimientos.classList.add('d-none');
        await cargarListaEscuelas(modulo);
      } else if (modulo.querySelector('#mantenimientoOtrosExtension').checked) {
        seccionOtrosMantenimientos.classList.remove('d-none');
        seccionEscuelas.classList.add('d-none');
      }
    });
  });
}

// Limpia las subsecciones internas del mantenimiento
function limpiarSubseccionesMantenimiento(modulo) {
  modulo.querySelector('#seccionEscuelasExtension').classList.add('d-none');
  modulo.querySelector('#seccionOtrosMantenimientosExtension').classList.add('d-none');
}

// 🚀 Cargar lista de escuelas
async function cargarListaEscuelas(modulo) {
  try {
    const selectEscuelas = modulo.querySelector('#escuelaSeleccionadaExtension');
    const escuelas = await fetch('componentes/listas/escuelas.json').then(r => r.json());

    selectEscuelas.innerHTML = '<option value="">Seleccione una escuela</option>';
    escuelas.forEach(escuela => {
      const option = document.createElement('option');
      option.value = escuela;
      option.textContent = escuela;
      selectEscuelas.appendChild(option);
    });

  } catch (error) {
    console.error('❌ Error cargando lista de escuelas:', error);
  }
}

// 🚀 Cargar componente cronograma
async function cargarComponenteCronogramaExtension(modulo) {
  try {
    const contenedor = modulo.querySelector('#contenedor-cronograma-extension');

    const html = await fetch('componentes/cronograma/cronograma.html').then(r => r.text());
    contenedor.innerHTML = html;

    const script = document.createElement('script');
    script.src = 'componentes/cronograma/cronograma.js';
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (typeof inicializarComponenteCronograma === 'function') {
        inicializarComponenteCronograma();
      } else {
        console.warn("⚠️ No se encontró inicializarComponenteCronograma().");
      }
    };
  } catch (error) {
    console.error('❌ Error cargando componente cronograma:', error);
  }
}
