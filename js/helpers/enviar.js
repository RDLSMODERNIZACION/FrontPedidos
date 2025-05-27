import { generarIDTramite } from './idgenerator.js';
import { validarDatosGenerales, validarModuloEspecifico } from './validaciones.js';
import { mostrarModalExito, mostrarModalError } from './modalExito.js';

export async function enviarFormularioSinRespuesta(datos) {
  const boton = document.getElementById('btnEnviarFormulario');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Enviando... 📤';
  }

  try {
    // Validaciones
    const errorGeneral = validarDatosGenerales(datos);
    const errorModulo = validarModuloEspecifico(datos.modulo, datos);

    // Generar ID
    const idTramite = generarIDTramite(datos.modulo);
    console.log("🆔 ID generado:", idTramite);

    // Datos con ID
    const datosConID = {
      ...datos,
      idtramite: idTramite
    };

    // Envío único al proxy
    const respuesta = await fetch('http://localhost:3000/api/enviar-formulario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosConID)
    });

    const json = await respuesta.json();
    console.log("📥 Respuesta desde Apps Script (vía proxy):", json);

    // Mostrar logs si están presentes
    if (json.logs && Array.isArray(json.logs)) {
      console.groupCollapsed("📝 Logs del backend");
      json.logs.forEach(linea => console.log(linea));
      console.groupEnd();
    }

    if (json.estado !== 'ok') {
      mostrarModalError(json.mensaje || 'Error inesperado.');
      return;
    }

    mostrarModalExito(idTramite);

  } catch (error) {
    console.error('❌ Error en envío:', error);
    alert('❌ Hubo un problema al enviar el formulario.');
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerText = '📤 Enviar Formulario';
    }
  }
}
