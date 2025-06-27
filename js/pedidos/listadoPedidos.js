async function inicializarListadoPedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return;

  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQbenShUkUQFJA7lVcFFZaXXU0nTZBwWmKK2DlURXEQGqkVwrVsCqn3KMQAsUCiant96FovjFh_35jc/pub?gid=0&single=true&output=csv");
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

  cuerpo.innerHTML = '';

  if (pedidosFiltrados.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5" class="text-center">🚫 No hay pedidos cargados aún.</td></tr>`;
  } else {
    pedidosFiltrados.forEach(p => {
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

  document.addEventListener('click', function (e) {
    const boton = e.target.closest('.btn-ver-pedido');
    if (boton) {
      const id = boton.getAttribute('data-id');
      window.location.href = `pedidos/detalle.html?id=${encodeURIComponent(id)}`;
    }
  });

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
