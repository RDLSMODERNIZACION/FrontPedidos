import { archivoAObjetoBase64 } from '../helpers/base64.js';

export async function obtenerDatosAdquisicion() {
  const modulo = document.querySelector('[data-modulo="adquisicion"]');
  const datos = {};

  datos.detalleServicio = modulo.querySelector('#motivoCompra')?.value.trim() || '';
  datos.tipoCarga = '[Sin tipo]';
  datos.contenidoCarga = '[Sin datos]';

  const modo = modulo.querySelector('input[name="modoCarga"]:checked')?.value;

  if (modo === 'manual') {
    const filas = modulo.querySelectorAll('#tablaItemsBody tr');
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

    datos.tipoCarga = 'MANUAL';
    datos.contenidoCarga = JSON.stringify(items);
  }

  if (modo === 'archivo') {
    const archivoInput = document.getElementById('archivoPedidos');
    const archivo = await archivoAObjetoBase64(archivoInput);

    datos.tipoCarga = 'ARCHIVO';
    datos.contenidoCarga = archivo?.nombre ? `ARCHIVO: ${archivo.nombre}` : '[Sin archivo]';
  }

  return datos;
}
