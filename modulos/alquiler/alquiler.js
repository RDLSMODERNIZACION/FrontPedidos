console.log("✅ alquiler.js cargado correctamente");

function inicializarModuloAlquiler() {
  console.log("✅ Inicializando módulo Alquiler...");

  const opcionesAlquiler = document.getElementById('opcionesAlquiler');
  const tipoAlquilerRadios = document.getElementsByName('tipoAlquiler');
  const seccionEdificio = document.getElementById('seccionEdificioAlquiler');
  const seccionMaquinaria = document.getElementById('seccionMaquinariaAlquiler');
  const seccionOtros = document.getElementById('seccionOtrosAlquiler');
  const contenedorCronograma = document.getElementById('contenedor-cronograma-alquiler');

  if (!tipoAlquilerRadios.length) {
    console.error("❌ No se encontraron los radios tipoAlquiler.");
    return;
  }

  // Mostrar directamente la sección de opciones
  opcionesAlquiler.classList.remove('d-none');

  // Ocultar todas las secciones específicas al inicio
  seccionEdificio.classList.add('d-none');
  seccionMaquinaria.classList.add('d-none');
  seccionOtros.classList.add('d-none');

  // Mostrar sección correspondiente al tipo seleccionado
  tipoAlquilerRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      contenedorCronograma.innerHTML = '';

      if (document.getElementById('alquilerEdificio').checked) {
        seccionEdificio.classList.remove('d-none');
        seccionMaquinaria.classList.add('d-none');
        seccionOtros.classList.add('d-none');
      } 
      else if (document.getElementById('alquilerMaquinaria').checked) {
        seccionMaquinaria.classList.remove('d-none');
        seccionEdificio.classList.add('d-none');
        seccionOtros.classList.add('d-none');

        await cargarListaMaquinariaAlquiler();
        await cargarComponenteCronogramaAlquiler();
      } 
      else if (document.getElementById('alquilerOtros').checked) {
        seccionOtros.classList.remove('d-none');
        seccionEdificio.classList.add('d-none');
        seccionMaquinaria.classList.add('d-none');
        contenedorCronograma.innerHTML = '';
      }
    });
  });
}

// ✅ Cargar lista de maquinaria desde JSON
async function cargarListaMaquinariaAlquiler() {
  try {
    const tipoMaquinariaSelect = document.getElementById('tipoMaquinariaAlquiler');
    const maquinaria = await fetch('../componentes/listas/tipomaquinas.json').then(r => r.json());

    tipoMaquinariaSelect.innerHTML = '<option value="">Seleccione tipo de maquinaria...</option>';

    maquinaria.forEach(item => {
      const option = document.createElement('option');
      if (typeof item === 'string') {
        option.value = item;
        option.textContent = item;
      } else if (typeof item === 'object' && item.nombre) {
        option.value = item.id;
        option.textContent = item.nombre;
      }
      tipoMaquinariaSelect.appendChild(option);
    });

    console.log('✅ Lista de maquinaria cargada.');
  } catch (error) {
    console.error('❌ Error cargando maquinaria:', error);
  }
}

// ✅ Cargar el cronograma dinámico
async function cargarComponenteCronogramaAlquiler() {
  try {
    const contenedor = document.getElementById('contenedor-cronograma-alquiler');
    const html = await fetch('../componentes/cronograma/cronograma.html').then(r => r.text());
    contenedor.innerHTML = html;

    const script = document.createElement('script');
    script.src = '../componentes/cronograma/cronograma.js';
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      setTimeout(() => {
        if (typeof inicializarComponenteCronograma === 'function') {
          inicializarComponenteCronograma();
          console.log("✅ Componente cronograma inicializado.");
        } else {
          console.warn("⚠️ No se encontró inicializarComponenteCronograma() después de cargar.");
        }
      }, 200);
    };
  } catch (error) {
    console.error('❌ Error cargando cronograma:', error);
  }
}

// ✅ Extraer y empaquetar datos como espera el backend
function obtenerDatosModuloAlquiler() {
  const tipoAlquiler = document.querySelector('input[name="tipoAlquiler"]:checked')?.value || '';

  const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const cronograma = [];

  dias.forEach(dia => {
    const checkbox = document.getElementById(dia);
    const inputHora = document.querySelector(`.hora-dia[data-dia="${dia}"]`);
    if (checkbox?.checked && inputHora?.value) {
      cronograma.push({ dia, horas: parseFloat(inputHora.value) || 0 });
    }
  });

  const cronogramaDesde = cronograma[0]?.dia || '';
  const cronogramaHasta = cronograma.at(-1)?.dia || '';
  const cronogramaHoras = cronograma.reduce((sum, d) => sum + d.horas, 0);

  return {
    tipoAlquiler,
    usoEdificioAlquiler: document.getElementById('usoEdificioAlquiler')?.value || '',
    ubicacionEdificioAlquiler: document.getElementById('ubicacionEdificioAlquiler')?.value || '',
    usoMaquinariaAlquiler: document.getElementById('usoMaquinariaAlquiler')?.value || '',
    tipoMaquinariaAlquiler: document.getElementById('tipoMaquinariaAlquiler')?.value || '',
    requiereCombustible: document.getElementById('combustibleAlquiler')?.checked || false,
    requiereChofer: document.getElementById('choferAlquiler')?.checked || false,
    usoOtrosAlquiler: document.getElementById('usoOtrosAlquiler')?.value || '',
    detalleOtrosAlquiler: document.getElementById('detalleOtrosAlquiler')?.value || '',
    cronogramaDesde,
    cronogramaHasta,
    cronogramaHoras: cronogramaHoras.toString()
  };
}

document.addEventListener('DOMContentLoaded', inicializarModuloAlquiler);

window.inicializarModuloAlquiler = inicializarModuloAlquiler;
window.obtenerDatosAlquiler = obtenerDatosModuloAlquiler;
