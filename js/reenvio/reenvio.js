// 📁 reenvio.js

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const hojaURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbenShUkUQFJA7lVcFFZaXXU0nTZBwWmKK2DlURXEQGqkVwrVsCqn3KMQAsUCiant96FovjFh_35jc/pub?gid=0&single=true&output=csv";

document.addEventListener("DOMContentLoaded", async () => {
  await cargarDatosReenvio();

  const botonReenviar = document.getElementById("btn-reenviar-definitivo");
  if (botonReenviar) {
    botonReenviar.addEventListener("click", () => {
      console.log("🔁 Pedido reenviado (simulado).");
      // TODO: Implementar lógica de reenvío real aquí
    });
  } else {
    console.warn("❌ No se encontró el botón #btn-reenviar-definitivo.");
  }
});

async function cargarDatosReenvio() {
  try {
    const response = await fetch(hojaURL);
    const texto = await response.text();
    const pedidos = parseCSV(texto);
    const pedido = pedidos.find(p => p.IDTRAMITE === id);

    if (!pedido) {
      document.getElementById("contenedor-reenvio").innerHTML =
        `<div class="alert alert-danger">❌ No se encontró el pedido con ID ${id}</div>`;
      return;
    }

    document.getElementById("id-tramite").value = pedido.IDTRAMITE || '';
    
    const moduloField = document.getElementById("modulo");
    const modulosActivos = (pedido.MODULO || "")
  .split(",")
  .map(m => m.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean); // elimina vacíos

    if (moduloField) {
  moduloField.value = modulosActivos.join(", ");
    }



    document.getElementById("secretaria").value = (pedido.Secretaria || "").replace(/^["']|["']$/g, "").trim();

    document.getElementById("observacion").value = pedido["MOTIVO OBSERVACION"] || '';
    document.getElementById("detalle").value = pedido["DETALLE"] || '';

  } catch (error) {
    console.error("❌ Error al cargar datos del pedido:", error);
  }
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
