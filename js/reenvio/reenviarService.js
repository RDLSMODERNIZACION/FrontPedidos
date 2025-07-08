import { mostrarModalExito, mostrarModalError } from '../helpers/modalExito.js';
import { API_URL_REENVIAR_PEDIDO } from '../config/apiConfig.js';

/**
 * Función para reenviar el pedido con todos los datos recolectados
 */
export async function reenviarPedido(datosBase) {
  const boton = document.getElementById('btn-reenviar-definitivo');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Reenviando... 📤';
  }

  try {
    console.log("📋 Datos base:", datosBase);

    // 🔷 Detectar módulos del pedido
    const modulos = (datosBase.modulo || "")
      .split(",")
      .map(m => m.trim().toLowerCase())
      .filter(Boolean);

    const datosActualizados = {};

    // 🔷 Ejecutar las funciones obtenerDatosX() para los módulos detectados
    for (const modulo of modulos) {
      const funcion = `obtenerDatos${capitalizar(modulo)}`;
      if (typeof window[funcion] === "function") {
        console.log(`📥 Ejecutando ${funcion}()`);
        const datosModulo = await window[funcion](); // ⚠️ importante: await si son async
        datosActualizados[`modulo_${modulo}`] = datosModulo;
      } else {
        console.warn(`⚠️ No se encontró la función ${funcion}() para ${modulo}`);
      }
    }

    // 🔷 Recolectar usuario desde los campos fijos del formulario
    const usuario = {
      nombre: document.querySelector('#nombre-usuario')?.value.trim() || '',
      secretaria: document.querySelector('#secretaria-usuario')?.value.trim() || ''
    };

    console.log("👤 Usuario recolectado:", usuario);

    // 🔷 Recolectar campos dinámicos en #contenedor-reenvio
    const camposDinamicos = {};
    const inputs = document.querySelectorAll("#contenedor-reenvio input, #contenedor-reenvio textarea");
    inputs.forEach(input => {
      const clave = input.name;
      let valor = input.value.trim();

      // Si es una fecha dd/mm/yyyy → opcionalmente convertir a ISO
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
        const [d, m, y] = valor.split("/");
        valor = `${y}-${m}-${d}`;
      }

      camposDinamicos[clave] = valor;
    });

    console.log("📄 Campos dinámicos:", camposDinamicos);

    // 🔷 Armar el payload completo
    const payload = {
      idTramite: datosBase.idTramite,
      accion: 'reenviarPedido',
      nuevoEstado: 'Reenviado',
      motivo: datosBase.observacion || 'Corrección de datos',
      usuario,
      modulo: datosBase.modulo || '',
      ...datosActualizados,
      ...camposDinamicos // 👈 se agregan los campos del formulario dinámico
    };

    console.log("📦 Payload final:", payload);

    // 🔷 Enviar al backend
    const res = await fetch(API_URL_REENVIAR_PEDIDO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Respuesta no válida del servidor');

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

/**
 * Capitaliza la primera letra de un texto
 */
function capitalizar(txt) {
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}
