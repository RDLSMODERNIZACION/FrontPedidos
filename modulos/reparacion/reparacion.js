console.log("✅ reparacion.js cargado correctamente");

function inicializarModuloReparacion() {
  console.log("✅ Inicializando módulo Reparaciones...");

  const switchMostrarReparacion = document.getElementById('switchReparacion');
  const opcionesReparacion = document.getElementById('opcionesReparacion');
  const ayudaReparacionBtn = document.getElementById('ayudaReparacionBtn');
  const ayudaTextoReparacion = document.getElementById('ayudaTextoReparacion');

  const tipoReparacionRadios = document.getElementsByName('tipoReparacion');
  const seccionMaquinaria = document.getElementById('seccionMaquinaria');
  const seccionOtros = document.getElementById('seccionOtros');

  const contenedorMaquinarias = document.getElementById('contenedorMaquinarias');
  const agregarMaquinariaBtn = document.getElementById('agregarMaquinariaBtn');

  if (!tipoReparacionRadios.length) {
    console.error("❌ No se encontraron los radios tipoReparacion. El HTML no está disponible.");
    return;
  }

  // Inicialmente todo oculto
  opcionesReparacion.classList.add('d-none');
  seccionMaquinaria.classList.add('d-none');
  seccionOtros.classList.add('d-none');

  // Switch para mostrar/ocultar todo el módulo
  switchMostrarReparacion.addEventListener('change', () => {
    if (switchMostrarReparacion.checked) {
      opcionesReparacion.classList.remove('d-none');
    } else {
      opcionesReparacion.classList.add('d-none');
      seccionMaquinaria.classList.add('d-none');
      seccionOtros.classList.add('d-none');
      tipoReparacionRadios.forEach(radio => radio.checked = false);
    }
  });

  // Botón de ayuda ℹ️
  ayudaReparacionBtn.addEventListener('click', () => {
    ayudaTextoReparacion.classList.toggle('d-none');
  });

  // Cambio de tipo de reparación
  tipoReparacionRadios.forEach(radio => {
    radio.addEventListener('change', async () => {
      if (document.getElementById('reparacionMaquinaria').checked) {
        seccionMaquinaria.classList.remove('d-none');
        seccionOtros.classList.add('d-none');
        await cargarListaUnidadesEnTodosSelects();
      } else if (document.getElementById('reparacionOtros').checked) {
        seccionOtros.classList.remove('d-none');
        seccionMaquinaria.classList.add('d-none');
      }
    });
  });

  // Botón ➕ para agregar otra unidad a reparar
  if (agregarMaquinariaBtn) {
    agregarMaquinariaBtn.addEventListener('click', async () => {
      const nuevoBloque = document.createElement('div');
      nuevoBloque.className = 'row align-items-start mb-3 maquinaria-item';

      nuevoBloque.innerHTML = `
        <div class="col-md-6">
          <select class="form-select unidadMaquinaria" required>
            <option value="">Cargando unidades...</option>
          </select>
        </div>
        <div class="col-md-6">
          <textarea class="form-control detalleReparacionMaquinaria" rows="2" placeholder="Detalle de la reparación" required></textarea>
        </div>
      `;

      contenedorMaquinarias.appendChild(nuevoBloque);
      await cargarListaUnidadesEnSelect(nuevoBloque.querySelector('.unidadMaquinaria'));
    });
  }
}

// 🚀 Cargar opciones desde JSON en un select individual
async function cargarListaUnidadesEnSelect(selectElement) {
  try {
    const unidades = await fetch('../componentes/listas/maquinaria.json').then(r => r.json());
    selectElement.innerHTML = '<option value="">Seleccione una unidad</option>';

    unidades.forEach(unidad => {
      const option = document.createElement('option');
      if (typeof unidad === 'string') {
        option.value = unidad;
        option.textContent = unidad;
      } else if (typeof unidad === 'object' && unidad.nombre) {
        option.value = unidad.id;
        option.textContent = unidad.nombre;
      }
      selectElement.appendChild(option);
    });

  } catch (error) {
    console.error('❌ Error cargando lista de unidades en select:', error);
    selectElement.innerHTML = '<option value="">⚠️ Error al cargar</option>';
  }
}

// 🚀 Cargar unidades en todos los selects actuales
async function cargarListaUnidadesEnTodosSelects() {
  const selects = document.querySelectorAll('.unidadMaquinaria');
  for (const select of selects) {
    await cargarListaUnidadesEnSelect(select);
  }
}

// Inicializar al cargar DOM
document.addEventListener('DOMContentLoaded', inicializarModuloReparacion);


// 👇 Colgar la función en `window`
window.obtenerDatosReparacion = obtenerDatosReparacion;

console.log("✅ reparacion.js completamente inicializado y listo");