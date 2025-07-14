console.log("✅ carga_pedidos.js cargado correctamente.");

function inicializarModuloAdquisicion() {
  console.log("✅ Inicializando módulo adquisición (modo manual por defecto).");

  const opcionesCarga = document.getElementById('opcionesCarga');
  const seccionManual = document.getElementById('seccionManual');
  const agregarItemBtn = document.getElementById('agregarItemBtn');
  const tablaItemsBody = document.getElementById('tablaItemsBody');

  opcionesCarga?.classList.remove('d-none');
  seccionManual?.classList.remove('d-none');

  function agregarItem() {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><input type="text" class="form-control" name="descripcion[]" required></td>
      <td><input type="number" class="form-control" name="cantidad[]" min="0" required></td>
      <td><input type="text" class="form-control" name="unidad[]" required></td>
      <td><input type="text" class="form-control" name="observaciones[]"></td>
      <td><button type="button" class="btn btn-danger btn-sm eliminarFila">🗑️</button></td>
    `;
    tablaItemsBody.appendChild(fila);

    fila.querySelector('.eliminarFila').addEventListener('click', () => {
      fila.remove();
    });
  }

  // 👉 Asociar al botón
  agregarItemBtn?.addEventListener('click', agregarItem);

  // 👉 Agregar un ítem por defecto al cargar
  agregarItem();
}

window.inicializarModuloAdquisicion = inicializarModuloAdquisicion;

