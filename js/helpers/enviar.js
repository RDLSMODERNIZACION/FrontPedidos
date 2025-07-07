import { generarIDTramite } from './idgenerator.js';
import { validarDatosGenerales, validarModuloEspecifico } from './validaciones.js';
import { mostrarModalExito, mostrarModalError } from './modalExito.js';
import { obtenerAreaDestino } from './areaDestino.js';
import { detectarModulos } from './detectarModulos.js';
import { API_URL_CREAR_CARPETA } from '../config/apiConfig.js';

export async function enviarFormularioSinRespuesta(datos, boton) {
  try {
    // 🔷 Detectar módulos y agregar a datos
    datos = detectarModulos(datos);

    // 📝 Validaciones
    if (!validarDatosGenerales(datos) || !validarModuloEspecifico(datos.modulo, datos)) {
      if (boton) {
        boton.disabled = false;
        boton.innerText = '📤 Enviar Formulario';
      }
      return;
    }

    // 🆔 Generar el ID utilizando todos los datos disponibles
    const idTramite = generarIDTramite(datos);
    console.log("🆔 ID generado:", idTramite);

    // 🧾 Calcular área destino
    const presupuesto = datos.modulo_general?.presupuesto || '0';
    const areaDestino = obtenerAreaDestino(presupuesto);
    console.log("📍 Área Destino:", areaDestino);

    // 📦 Armar datos completos
    const datosCompletos = {
      ...datos,
      idTramite,
      usuario: {
        ...datos.usuario,
        areaDestino
      }
    };

    // 📝 Mostrar en consola el JSON final antes de enviar
    console.log("🚀 JSON a enviar al servidor:");
    console.log(JSON.stringify(datosCompletos, null, 2));

    // 📨 POST único
    const res = await fetch(API_URL_CREAR_CARPETA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCompletos)
    });

    const json = await res.json();
    console.log("📁 Respuesta:", json);

    if (!json.ok) {
      mostrarModalError(json.mensaje || json.error || 'Error al procesar la solicitud.');
      return;
    }

    mostrarModalExito(idTramite);

  } catch (error) {
    console.error('❌ Error en envío:', error);
    mostrarModalError('❌ Hubo un problema al enviar el formulario.');
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerText = '📤 Enviar Formulario';
    }
  }
}
