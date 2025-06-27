document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('info-pedido').innerHTML = `
      <div class="alert alert-danger">❌ No se encontró el ID del pedido.</div>
    `;
    return;
  }

  await cargarDetallePedido(id);
});

async function cargarDetallePedido(id) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQbenShUkUQFJA7lVcFFZaXXU0nTZBwWmKK2DlURXEQGqkVwrVsCqn3KMQAsUCiant96FovjFh_35jc/pub?gid=0&single=true&output=csv");
  const texto = await response.text();

  const pedidos = parseCSV(texto);
  const pedido = pedidos.find(p => p.IDTRAMITE === id);

  if (!pedido) {
    document.getElementById('info-pedido').innerHTML = `
      <div class="alert alert-warning">⚠️ El pedido con ID <strong>${id}</strong> no fue encontrado.</div>
    `;
    return;
  }

  const carpetaURL = pedido["Carpeta Drive URL"]?.trim();
  const linkHTML = carpetaURL
    ? `<a href="${carpetaURL}" target="_blank">📎 Ver carpeta</a>`
    : '—';

  const infoHTML = `
    <table class="table table-bordered">
      <tr><th>ID Trámite</th><td>${pedido.IDTRAMITE}</td></tr>
      <tr><th>Servicio</th><td>${pedido.MODULO}</td></tr>
      <tr><th>Estado</th><td>${pedido["ESTADO APROBACION"]}</td></tr>
      <tr><th>Secretaría</th><td>${pedido.Secretaria}</td></tr>
      <tr><th>Fecha</th><td>${formatearFecha(pedido["FECHA ACTUAL"])}</td></tr>
      <tr><th>Área</th><td>${pedido.AREA || '—'}</td></tr>
      <tr><th>Archivo</th><td>${linkHTML}</td></tr>
    </table>
  `;

  document.getElementById('info-pedido').innerHTML = infoHTML;

  // Solo muestra botones si la Secretaría es Economía y el estado es Pendiente
  const puedeAprobar = usuario.secretaria?.toLowerCase().includes("economía");
  if (pedido["ESTADO APROBACION"] === "Pendiente" && puedeAprobar) {
    document.getElementById('acciones-pedido').style.display = 'flex';
  }
}

function formatearFecha(fecha) {
  const f = new Date(fecha);
  return isNaN(f) ? fecha : f.toLocaleDateString('es-AR');
}

function parseCSV(texto) {
  const lineas = texto.trim().split("\n");
  const encabezado = lineas[0].split(",").map(e => e.trim());
  return lineas.slice(1).map(linea => {
    const valores = linea.split(",").map(e => e.trim());
    const obj = {};
    encabezado.forEach((col, i) => {
      obj[col] = valores[i];
    });
    return obj;
  });
}

function aprobarPedido() {
  alert('✅ Pedido aprobado. (Simulado)');
  // Aquí podrías enviar el cambio a un backend (Apps Script o API)
}

function rechazarPedido() {
  const confirmacion = confirm('¿Seguro que querés rechazar este pedido?');
  if (confirmacion) {
    alert('❌ Pedido rechazado. (Simulado)');
    // Aquí podrías enviar el cambio a un backend
  }
}
