let idPedidoGlobal = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('info-pedido').innerHTML = `
      <div class="alert alert-danger">❌ No se encontró el ID del pedido.</div>
    `;
    return;
  }

  idPedidoGlobal = id;
  await cargarDetallePedido(id);
});

async function cargarDetallePedido(id) {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const response = await fetch("https://script.google.com/macros/s/AKfycbxPNiF3miRa9Bv0JppagI8X7RJxNVGJepQo-kg3pIZpBYgLdSn11hGlK-HOnmBUegzC3Q/exec");
  const pedidos = await response.json();

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
      <tr><th>Estado</th><td id="estado-pedido">${pedido["ESTADO APROBACION"]}</td></tr>
      <tr><th>Secretaría</th><td>${pedido.Secretaria}</td></tr>
      <tr><th>Fecha</th><td>${formatearFecha(pedido["FECHA ACTUAL"])}</td></tr>
      <tr><th>Archivo</th><td>${linkHTML}</td></tr>
    </table>
  `;

  document.getElementById('info-pedido').innerHTML = infoHTML;

  const secretaria = (usuario.secretaria || "").toLowerCase().trim();
  const estado = (pedido["ESTADO APROBACION"] || "").toLowerCase().trim();
  console.log("🔍 Secretaría detectada:", secretaria);
  console.log("📄 Estado del pedido:", estado);

  const secretariasPermitidas = ["economía", "juzgado de faltas"];
  const puedeAprobar = secretariasPermitidas.includes(secretaria);

  if (estado === "pendiente" && puedeAprobar) {
    document.getElementById('acciones-pedido').style.display = 'flex';
    console.log("✅ Botones mostrados");
  } else {
    console.log("❌ Botones ocultos (estado o secretaría no válida)");
  }

  // Mostrar motivo si corresponde
  const motivo = pedido["MOTIVO OBSERVACION"]?.trim();

 if ((estado === "observado" || estado === "rechazado") && motivo) {
  const contenedorMotivo = document.getElementById("motivo-observacion");
  if (contenedorMotivo) {
    const clase = estado === "rechazado" ? "alert-danger" : "alert-warning";
    const botonReenviar = estado === "observado" ? `
  <div class="text-end" style="min-width: 150px;">
    <button id="btn-reenviar" class="btn btn-outline-secondary btn-sm">🔄 Reenviar pedido</button>
  </div>



    ` : "";
  contenedorMotivo.innerHTML = `
  <div class="alert ${clase} d-flex justify-content-between align-items-start flex-wrap mt-3 p-4" style="border-left: 6px solid #ff9800; background-color: #fff8e1;">
    <div class="me-3" style="flex: 1;">
      <div class="d-flex align-items-center mb-2">
        <span style="font-size: 1.5rem; margin-right: 0.5rem;">📝</span>
        <strong style="font-size: 1.1rem;">Motivo de ${estado}:</strong>
      </div>
      <div style="white-space: pre-wrap; font-size: 1rem; color: #333;">
        ${motivo}
      </div>
    </div>
    ${botonReenviar}
  </div>
`;


    // Agregá el evento si el botón existe
    const btnReenviar = document.getElementById("btn-reenviar");
    if (btnReenviar) {
      btnReenviar.addEventListener("click", () => {
        const confirmacion = confirm("Este pedido fue observado. ¿Deseás reenviarlo con modificaciones?");
        if (!confirmacion) return;
        localStorage.setItem("modoReenvio", "true");
        window.location.href = `../../vistas/pedidos/reenvio.html?id=${id}&modo=editar`;
      });
    }
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
}

function rechazarPedido() {
  const confirmacion = confirm('¿Seguro que querés rechazar este pedido?');
  if (confirmacion) {
    alert('❌ Pedido rechazado. (Simulado)');
   }
} }
