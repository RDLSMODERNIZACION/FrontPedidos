async function actualizarEstadoPedido(idTramite, nuevoEstado, motivo = "") {
  try {
    const respuesta = await fetch("http://localhost:3000/api/actualizar-estado", {
      method: "POST",
      body: JSON.stringify({
        accion: "actualizarEstado",
        idTramite: idTramite,
        nuevoEstado: nuevoEstado,
        motivo: motivo,  // ✅ Lo mandamos al backend si corresponde
        usuario: localStorage.getItem('usuario')
          ? JSON.parse(localStorage.getItem('usuario')).nombre
          : 'Desconocido'
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const resultado = await respuesta.json();
    console.log("📝 Respuesta del servidor:", resultado);

    if (resultado.estado === "ok") {
      let mensaje = "Estado actualizado correctamente";

      if (resultado.motivo) {
        mensaje += `\n📝 Motivo: ${resultado.motivo}`;
      }

      Swal.fire("✅ Éxito", mensaje, "success").then(() => {
        document.getElementById("estado-pedido").innerText = nuevoEstado;
        document.getElementById("acciones-pedido").style.display = "none";

        // Si hay motivo, lo mostramos en la parte inferior
        if (resultado.motivo) {
          const motivoElem = document.getElementById("motivo-observacion");
          if (motivoElem) motivoElem.innerText = resultado.motivo;
        }

        // También ocultamos el campo de motivo si estaba visible
        document.getElementById("campo-motivo").style.display = "none";
      });
    } else {
      Swal.fire("⚠️ Error", resultado.mensaje || "No se pudo actualizar el estado", "error");
    }

  } catch (error) {
    console.error("❌ Error al enviar:", error);
    Swal.fire("Error", "No se pudo conectar con el servidor", "error");
  }
}

let estadoTemporal = "";

// ✅ Estas funciones deben estar disponibles en el scope global
window.mostrarCampoMotivo = function(estado) {
  estadoTemporal = estado;
  document.getElementById("campo-motivo").style.display = "block";
};

window.enviarConMotivo = function() {
  const motivo = document.getElementById("input-motivo").value.trim();
  if (!motivo) {
    Swal.fire("⚠️ Debe ingresar un motivo", "", "warning");
    return;
  }

  actualizarEstadoPedido(idPedidoGlobal, estadoTemporal, motivo);
};
