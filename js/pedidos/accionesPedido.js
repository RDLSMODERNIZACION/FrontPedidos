import { API_URL_ACTUALIZAR_ESTADO } from '../config/apiConfig.js';

async function actualizarEstadoPedido(idTramite, nuevoEstado, motivo = "", botonClicado = null) {
  bloquearBotonesAccion(botonClicado);

  try {
    const respuesta = await fetch(API_URL_ACTUALIZAR_ESTADO, {
      method: "POST",
      body: JSON.stringify({
        accion: "actualizarEstado",
        idTramite: idTramite,
        nuevoEstado: nuevoEstado,
        motivo: motivo,
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
      Swal.fire("✅ Éxito", "Estado actualizado correctamente", "success").then(() => {
        document.getElementById("estado-pedido").innerText = nuevoEstado;
        document.getElementById("acciones-pedido").style.display = "none";

        if (resultado.motivo) {
          const motivoElem = document.getElementById("motivo-observacion");
          if (motivoElem) motivoElem.innerText = resultado.motivo;
        }

        document.getElementById("campo-motivo").style.display = "none";
      });
    } else {
      Swal.fire("⚠️ Error", resultado.mensaje || "No se pudo actualizar el estado", "error");
    }

  } catch (error) {
    console.error("❌ Error al enviar:", error);
    Swal.fire("Error", "No se pudo conectar con el servidor", "error");
  } finally {
    desbloquearBotonesAccion();
  }
}

function bloquearBotonesAccion(botonClicado) {
  const botones = document.querySelectorAll('#acciones-pedido button');
  botones.forEach(btn => {
    btn.disabled = true;
    btn.classList.add('disabled');
    if (btn === botonClicado) {
      btn.dataset.originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Enviando...`;
      btn.classList.add('btn-primary');
    } else {
      btn.style.opacity = "0.6";
    }
  });
}

function desbloquearBotonesAccion() {
  const botones = document.querySelectorAll('#acciones-pedido button');
  botones.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('disabled');
    btn.style.opacity = "1";
    if (btn.dataset.originalText) {
      btn.innerHTML = btn.dataset.originalText;
      delete btn.dataset.originalText;
    }
  });
}

let estadoTemporal = "";

window.mostrarCampoMotivo = function (estado, btn) {
  estadoTemporal = estado;
  document.getElementById("campo-motivo").style.display = "block";
  window.botonActual = btn;
};

window.enviarConMotivo = function () {
  const motivo = document.getElementById("input-motivo").value.trim();
  if (!motivo) {
    Swal.fire("⚠️ Debe ingresar un motivo", "", "warning");
    return;
  }

  actualizarEstadoPedido(idPedidoGlobal, estadoTemporal, motivo, window.botonActual);
};

window.aprobarPedido = function (btn) {
  actualizarEstadoPedido(idPedidoGlobal, 'Aprobado', '', btn);
};

window.observarPedido = function (btn) {
  window.mostrarCampoMotivo('Observado', btn);
};

window.rechazarPedido = function (btn) {
  window.mostrarCampoMotivo('Rechazado', btn);
};

// Exponer la función principal para los manejadores en detalle.html
window.actualizarEstadoPedido = actualizarEstadoPedido;
