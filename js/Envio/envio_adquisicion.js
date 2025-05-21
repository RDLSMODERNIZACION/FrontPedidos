// 🔁 Función llamada desde el script principal para recolectar datos del módulo de adquisición
async function recolectarDatosAdquisicion(moduloDiv) {
    const datos = {};
    datos.motivoCompra = moduloDiv.querySelector('#motivoCompra')?.value.trim() || '';
    datos.modoCarga = moduloDiv.querySelector('input[name="modoCarga"]:checked')?.value || '';
  
    if (datos.modoCarga === 'manual') {
      const filas = moduloDiv.querySelectorAll('#tablaItemsBody tr');
      const items = [];
  
      filas.forEach(fila => {
        const descripcion = fila.querySelector('[name="descripcion[]"]')?.value.trim() || '';
        const cantidad = fila.querySelector('[name="cantidad[]"]')?.value.trim() || '';
        const unidad = fila.querySelector('[name="unidad[]"]')?.value.trim() || '';
        const observaciones = fila.querySelector('[name="observaciones[]"]')?.value.trim() || '';
  
        if (descripcion || cantidad || unidad) {
          items.push({ descripcion, cantidad, unidad, observaciones });
        }
      });
  
      datos.items = items;
    }
  
    if (datos.modoCarga === 'archivo') {
      const archivo = await archivoAObjetoBase64(document.getElementById('archivoPedidos'));
      if (archivo) {
        datos.archivo_pedidos = archivo;
      }
    }
  
    return datos;
  }
  