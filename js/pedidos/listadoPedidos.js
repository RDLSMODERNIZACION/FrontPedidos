async function inicializarListadoPedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;

  const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQbenShUkUQFJA7lVcFFZaXXU0nTZBwWmKK2DlURXEQGqkVwrVsCqn3KMQAsUCiant96FovjFh_35jc/pub?gid=0&single=true&output=csv&t=${Date.now()}`;
const response = await fetch(url, { cache: 'no-store' });

  const texto = await response.text();
  const pedidos = parseCSV(texto);

  const cuerpo = document.getElementById('tabla-mis-pedidos');
  if (!cuerpo) {
    console.warn('❌ No se encontró la tabla de pedidos.');
    return;
  }

  const pedidosFiltrados = pedidos
    .filter(p => normalizar(p.Secretaria) === normalizar(usuario.secretaria))
    .sort((a, b) => new Date(b["FECHA ACTUAL"]) - new Date(a["FECHA ACTUAL"]));

  // Función para renderizar tabla con filtro opcional
  function renderPedidos(filtro = '') {
    const termino = normalizar(filtro);
    const pedidosVisibles = pedidosFiltrados.filter(p =>
      normalizar(p.IDTRAMITE).includes(termino) ||
      normalizar(p.MODULO).includes(termino) ||
      normalizar(p["ESTADO APROBACION"]).includes(termino) ||
      normalizar(formatearFecha(p["FECHA ACTUAL"])).includes(termino)
    );

    cuerpo.innerHTML = '';

    if (pedidosVisibles.length === 0) {
      cuerpo.innerHTML = `<tr><td colspan="5" class="text-center">🚫 No hay pedidos que coincidan con la búsqueda.</td></tr>`;
    } else {
      pedidosVisibles.forEach(p => {
        cuerpo.innerHTML += `
          <tr>
            <td>${p.IDTRAMITE}</td>
            <td>${p.MODULO}</td>
            <td>${p["ESTADO APROBACION"]}</td>
            <td>${formatearFecha(p["FECHA ACTUAL"])}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-ver-pedido" data-id="${p.IDTRAMITE}">👁 Ver</button>
            </td>
          </tr>
        `;
      });
    }
  }

  // Mostrar todos al inicio
  renderPedidos();

  // Agregar escucha al campo de búsqueda
  const inputBusqueda = document.getElementById('inputBusquedaPedidos');
  if (inputBusqueda) {
    inputBusqueda.addEventListener('input', e => {
      renderPedidos(e.target.value);
    });
  }

  // Evento para ver detalles
  document.addEventListener('click', function (e) {
    const boton = e.target.closest('.btn-ver-pedido');
    if (boton) {
      const id = boton.getAttribute('data-id');
      window.location.href = `pedidos/detalle.html?id=${encodeURIComponent(id)}`;
    }
  });

  // Funciones auxiliares
  function normalizar(texto) {
    return texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim() || '';
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO);
    return isNaN(f) ? fechaISO : f.toLocaleDateString('es-AR');
  }

  function parseCSV(texto) {
    const lineas = texto.trim().split("\n");
    const encabezado = lineas[0].split(",").map(e => e.trim());
    return lineas.slice(1).map(linea => {
      const valores = linea.split(",").map(e => e.trim());
      const obj = {};
      encabezado.forEach((col, i) => obj[col] = valores[i]);
      return obj;
    });
  }
}
