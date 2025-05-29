console.log("✅ carga_pedidos.js cargado correctamente.");

function inicializarModuloAdquisicion() {
  console.log("✅ Inicializando módulo adquisición.");

  const opcionesCarga = document.getElementById('opcionesCarga');
  const modoManual = document.getElementById('modoManual');
  const modoArchivo = document.getElementById('modoArchivo');
  const seccionManual = document.getElementById('seccionManual');
  const seccionArchivo = document.getElementById('seccionArchivo');
  const agregarItemBtn = document.getElementById('agregarItemBtn');
  const tablaItemsBody = document.getElementById('tablaItemsBody');

  // Mostrar contenedor principal (ya no depende de switch)
  opcionesCarga.classList.remove('d-none');

  // Mostrar el tipo de carga elegido
  function actualizarVistaModoCarga() {
    seccionManual.classList.toggle('d-none', !modoManual.checked);
    seccionArchivo.classList.toggle('d-none', !modoArchivo.checked);
  }

  modoManual.addEventListener('change', actualizarVistaModoCarga);
  modoArchivo.addEventListener('change', actualizarVistaModoCarga);

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
