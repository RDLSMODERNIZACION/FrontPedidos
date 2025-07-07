import { mostrarModalExito, mostrarModalError } from '../helpers/modalExito.js';
import { API_URL_REENVIAR_PEDIDO } from '../config/apiConfig.js';
import { validarDatosGenerales, validarModuloEspecifico } from '../helpers/validaciones.js';

export async function reenviarPedido(datosBase) {
  const boton = document.getElementById('btn-reenviar-definitivo');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Reenviando... 📤';
  }

  try {
    console.log("📋 Datos base:", datosBase);

    // Detectar módulos
    const modulos = (datosBase.modulo || "")
      .split(",")
      .map(m => m.trim().toLowerCase())
      .filter(Boolean);

    const datosActualizados = {};

    for (const modulo of modulos) {
      const funcion = `obtenerDatos${capitalizar(modulo)}`;
      if (typeof window[funcion] === "function") {
        console.log(`📥 Ejecutando ${funcion}()`);
        const datosModulo = await window[funcion](); // ⚠️ importante: `await` si son async
        datosActualizados[`modulo_${modulo}`] = datosModulo;
      } else {
        console.warn(`⚠️ No se encontró la función ${funcion}() para ${modulo}`);
      }
    }

    // 🔷 Obtener datos del usuario desde los campos del formulario
    const nombreUsuario = document.querySelector('#nombre-usuario')?.value.trim() || '';
    const secretariaUsuario = document.querySelector('#secretaria-usuario')?.value.trim() || '';

    const usuario = {
      nombre: nombreUsuario,
      secretaria: secretariaUsuario
    };

    console.log("👤 Usuario recolectado:", usuario);

    const payload = {
      idTramite: datosBase.idTramite,
      accion: 'reenviarPedido',
      nuevoEstado: 'Reenviado',
      motivo: datosBase.observacion || 'Corrección de datos',
      usuario,
      modulo: datosBase.modulo || '',
      ...datosActualizados
    };

    console.log("📦 Payload completo para reenviar:", payload);

   

    const res = await fetch(API_URL_REENVIAR_PEDIDO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Respuesta no válida del servidor');
    }

    const json = await res.json();
    console.log("📨 Respuesta del backend:", json);

    if (json.estado === 'ok') {
      mostrarModalExito(datosBase.idTramite || 'Reenvío');
    } else {
      mostrarModalError(json.mensaje || 'Error al reenviar el pedido.');
    }

  } catch (err) {
    console.error("❌ Error al reenviar:", err);
    mostrarModalError(err.message || 'Hubo un problema al reenviar el pedido.');
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerText = '🚀 Reenviar pedido corregido';
    }
  }
}

function capitalizar(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
