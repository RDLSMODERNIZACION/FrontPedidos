console.log("✅ reparacion.js cargado correctamente");

function inicializarModuloReparacion() {
  console.log("✅ Inicializando módulo Reparaciones...");

  const ayudaReparacionBtn = document.getElementById('ayudaReparacionBtn');
  const tipoReparacionRadios = document.getElementsByName('tipoReparacion');
  const seccionMaquinaria = document.getElementById('seccionMaquinaria');
  const seccionOtros = document.getElementById('seccionOtros');

  if (!tipoReparacionRadios.length) {
    console.error("❌ No se encontraron los radios tipoReparacion. El HTML no está disponible.");
    return;
  }

  // Oculta inicialmente
  seccionMaquinaria.classList.add('d-none');
  seccionOtros.classList.add('d-none');

  // Botón de ayuda (opcional, si tienes un texto)
  if (ayudaReparacionBtn) {
    ayudaReparacionBtn.addEventListener('click', () => {
      const ayudaTexto = document.getElementById('ayudaTextoReparacion');
      if (ayudaTexto) ayudaTexto.classList.toggle('d-none');
    });
  }

  // Cambio de tipo de reparación
  tipoReparacionRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      if (document.getElementById('reparacionMaquinaria').checked) {
        seccionMaquinaria.classList.remove('d-none');
        seccionOtros.classList.add('d-none');
        await cargarListaUnidades();
      } else if (document.getElementById('reparacionOtros').checked) {
        seccionOtros.classList.remove('d-none');
        seccionMaquinaria.classList.add('d-none');
      }
    });
  });
}

// 🚀 Cargar opciones desde JSON en el único select
async function cargarListaUnidades() {
  const select = document.querySelector('.unidadMaquinaria');
  if (!select) return;

  try {
    const unidades = await fetch('../componentes/listas/maquinaria.json').then(r => r.json());
    select.innerHTML = '<option value="">Seleccione una unidad</option>';

    unidades.forEach(unidad => {
      const option = document.createElement('option');
      option.value = typeof unidad === 'string' ? unidad : unidad.nombre;
      option.textContent = typeof unidad === 'string' ? unidad : unidad.nombre;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('❌ Error cargando lista de unidades:', error);
    select.innerHTML = '<option value="">⚠️ Error al cargar</option>';
  }
}

// 📤 Exporta los datos para enviar
function obtenerDatosReparacion() {
  const modulo = document.querySelector('[data-modulo="reparacion"]');
  const datos = {};

  const tipoReparacion = modulo.querySelector('input[name="tipoReparacion"]:checked')?.value || '';
  datos.rubro = tipoReparacion;

  if (tipoReparacion === 'maquinaria') {
    const unidad = modulo.querySelector('.unidadMaquinaria')?.value?.trim() || '';
    const detalle = modulo.querySelector('.detalleReparacionMaquinaria')?.value?.trim() || '';
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

// Inicializar al cargar DOM
window.inicializarModuloReparacion = inicializarModuloReparacion;
window.obtenerDatosReparacion = obtenerDatosReparacion;


console.log("✅ reparacion.js completamente inicializado y listo");
