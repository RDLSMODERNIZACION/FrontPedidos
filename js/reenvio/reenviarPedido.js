document.addEventListener('DOMContentLoaded', async () => {
  await esperarEstadoPedido(); // Espera hasta que se cargue el estado del DOM

  const estadoElem = document.getElementById("estado-pedido");
  const estado = estadoElem?.innerText.trim().toLowerCase();

  console.log("🕵️ Estado del pedido (normalizado):", estado);

  if (estado === "observado") {
    const contenedor = document.getElementById("boton-reenviar-container");
    if (contenedor) {
      contenedor.style.display = "block";
      console.log("✅ Botón 'Reenviar pedido' mostrado.");
    }
  } else {
    console.log("ℹ️ El estado no es 'observado', no se muestra botón de reenvío.");
  }

  const boton = document.getElementById("btn-reenviar");
  if (boton) {
    boton.addEventListener("click", () => {
      const confirmacion = confirm("Este pedido fue observado. ¿Deseás reenviarlo con modificaciones?");
      if (!confirmacion) return;

      if (!idPedidoGlobal) {
        alert("❌ No se pudo identificar el ID del trámite.");
        return;
      }

      localStorage.setItem("modoReenvio", "true");
      localStorage.setItem("idReenvio", idPedidoGlobal);
      window.location.href = `../../vistas/pedidos/const secretaria = (usuario.secretaria .html?modulo=formulario&id=${idPedidoGlobal}&modo=editar`;

    });
  }
});

function esperarEstadoPedido() {
  return new Promise(resolve => {
    const revisar = () => {
      const estadoElem = document.getElementById("estado-pedido");
      const texto = estadoElem?.innerText.trim();
      if (texto) {
        resolve();
      } else {
        requestAnimationFrame(revisar);
      }
    };
    revisar();
  });
}
