document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const modo = urlParams.get("modo");
  const id = urlParams.get("id");
  const esReenvio = localStorage.getItem("modoReenvio") === "true";

  if (modo === "editar" && id && esReenvio) {
    try {
      const response = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQbenShUkUQFJA7lVcFFZaXXU0nTZBwWmKK2DlURXEQGqkVwrVsCqn3KMQAsUCiant96FovjFh_35jc/pub?gid=0&single=true&output=csv");
      const texto = await response.text();
      const pedidos = parseCSV(texto);
      const pedido = pedidos.find(p => p.IDTRAMITE === id);

      if (!pedido) {
        Swal.fire("⚠️", "No se encontraron los datos del trámite.", "warning");
        return;
      }

      // Verificar si hay un motivo de observación
      const motivo = pedido["MOTIVO OBSERVACION"];
      if (motivo && motivo.trim() !== "") {
        Swal.fire({
          icon: "info",
          title: "🔁 Pedido observado",
          html: `
            <p>Este formulario fue reabierto tras una observación.</p>
            <p><strong>Motivo:</strong> ${motivo}</p>
            <p>Revisá y corregí los datos antes de reenviar.</p>
          `,
          confirmButtonText: "Entendido"
        });
      }

      // Precargar selector del módulo
      const modulo = pedido["MODULO"]?.toLowerCase();
      const selector = document.getElementById("moduloSelector");
      if (selector && modulo) {
        selector.value = modulo;
        selector.dispatchEvent(new Event("change"));
      }

    } catch (error) {
      console.error("❌ Error al precargar datos:", error);
    }
  }
});

/**
 * Función de utilidad para parsear CSV
 */
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
