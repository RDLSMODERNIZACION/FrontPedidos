console.log("✅ carga_pedidos.js cargado correctamente.");

function inicializarModuloAdquisicion() {
  console.log("✅ Inicializando módulo adquisición.");

  const switchMostrarSecciones = document.getElementById('switchAdquisicion');
  const opcionesCarga = document.getElementById('opcionesCarga');
  const modoManual = document.getElementById('modoManual');
  const modoArchivo = document.getElementById('modoArchivo');
  const seccionManual = document.getElementById('seccionManual');
  const seccionArchivo = document.getElementById('seccionArchivo');
  const ayudaBtn = document.getElementById('ayudaBtn');
  const ayudaTexto = document.getElementById('ayudaTexto');
  const agregarItemBtn = document.getElementById('agregarItemBtn');
  const tablaItemsBody = document.getElementById('tablaItemsBody');

  // Ocultar todo al iniciar
  opcionesCarga.classList.add('d-none');
  seccionManual.classList.add('d-none');
  seccionArchivo.classList.add('d-none');

  // Mostrar/Ocultar secciones al usar switch
  switchMostrarSecciones.addEventListener('change', () => {
    const activo = switchMostrarSecciones.checked;
    opcionesCarga.classList.toggle('d-none', !activo);
    seccionManual.classList.add('d-none');
    seccionArchivo.classList.add('d-none');
    modoManual.checked = false;
    modoArchivo.checked = false;
  });

  // Mostrar el tipo de carga elegido
  function actualizarVistaModoCarga() {
    seccionManual.classList.toggle('d-none', !modoManual.checked);
    seccionArchivo.classList.toggle('d-none', !modoArchivo.checked);
  }

  modoManual.addEventListener('change', actualizarVistaModoCarga);
  modoArchivo.addEventListener('change', actualizarVistaModoCarga);

  ayudaBtn.addEventListener('click', () => {
    ayudaTexto.classList.toggle('d-none');
  });

  // Agregar ítem
  agregarItemBtn.addEventListener('click', () => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><input type="text" class="form-control" name="descripcion[]" required></td>
      <td><input type="number" class="form-control" name="cantidad[]" min="0" required></td>
      <td><input type="text" class="form-control" name="unidad[]" required></td>
      <td><input type="text" class="form-control" name="observaciones[]"></td>
      <td><button type="button" class="btn btn-danger btn-sm eliminarFila">🗑️</button></td>
    `;
    tablaItemsBody.appendChild(fila);

    // Eliminar ítem
    fila.querySelector('.eliminarFila').addEventListener('click', () => {
      fila.remove();
    });
  });
}

document.addEventListener('DOMContentLoaded', inicializarModuloAdquisicion);
