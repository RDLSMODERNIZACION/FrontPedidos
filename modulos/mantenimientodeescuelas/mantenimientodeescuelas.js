console.log('🚀 mantenimiento_de_escuelas.js cargado.');

function inicializarModuloMantenimientodeescuelas() {
  console.log('✅ Ejecutando inicializarModuloMantenimientodeescuelas()');

  const switchMantenimiento = document.getElementById('switchMantenimientodeescuelas');
  const detalleMantenimiento = document.getElementById('detalleMantenimiento');
  const ayudaBtn = document.getElementById('ayudaBtn');
  const ayudaTexto = document.getElementById('ayudaTexto');

  if (!switchMantenimiento || !detalleMantenimiento || !ayudaBtn || !ayudaTexto) {
    console.error('❌ No se encontraron elementos necesarios para el módulo de Mantenimiento de Escuelas.');
    return;
  }

  // Mostrar u ocultar el detalle según el switch
  switchMantenimiento.addEventListener('change', () => {
    if (switchMantenimiento.checked) {
      detalleMantenimiento.classList.remove('d-none');
      detalleMantenimiento.classList.add('show');
    } else {
      detalleMantenimiento.classList.add('d-none');
      detalleMantenimiento.classList.remove('show');

      // Limpiar campos
      document.getElementById('escuelaSelect').value = "";
      document.getElementById('detalleTrabajo').value = "";
    }
  });

  // Botón de ayuda ℹ️
  ayudaBtn.addEventListener('click', () => {
    ayudaTexto.classList.toggle('d-none');
  });

  // Cargar la lista de escuelas
  cargarEscuelas();
}

// 🚀 Función para cargar la lista de escuelas desde JSON
async function cargarEscuelas() {
  try {
    const response = await fetch('../componentes/listas/escuelas.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const escuelas = await response.json();
    const escuelaSelect = document.getElementById('escuelaSelect');

    // Limpiar opciones anteriores
    escuelaSelect.innerHTML = '<option value="">Seleccione...</option>';

    // Agregar opciones
    escuelas.forEach(escuela => {
      const opcion = document.createElement('option');
      if (typeof escuela === 'string') {
        opcion.value = escuela;
        opcion.textContent = escuela;
      } else if (typeof escuela === 'object') {
        opcion.value = escuela.id;
        opcion.textContent = escuela.nombre;
      }
      escuelaSelect.appendChild(opcion);
    });

    console.log('✅ Escuelas cargadas correctamente.');
  } catch (error) {
    console.error('❌ Error cargando escuelas:', error);
  }
}

// Ejecutar al cargar el HTML
document.addEventListener('DOMContentLoaded', inicializarModuloMantenimientodeescuelas);
