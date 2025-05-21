// enviarFormularioSinRespuesta.js

import { generarIDTramite } from './idgenerator.js';
import { validarDatosGenerales, validarModuloEspecifico } from './validaciones.js';

export async function enviarFormularioSinRespuesta(datos) {
  const boton = document.getElementById('btnEnviarFormulario');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Enviando... 📤';
  }

  try {
    // ✅ Validaciones antes de enviar
    const errorGeneral = validarDatosGenerales(datos);
    const errorModulo = validarModuloEspecifico(datos.modulo, datos);

    if (errorGeneral || errorModulo) {
      alert(`❌ Error en el formulario:\n\n${errorGeneral || errorModulo}`);
      return;
    }

    // 🆔 Generar ID
    const idTramite = generarIDTramite(datos.modulo);
    console.log("🆔 ID generado:", idTramite);

    // 📁 Primer envío: solo ID y módulo para crear carpeta
    const datosPrimeraEtapa = {
      idtramite: idTramite,
      modulo: datos.modulo
    };
    console.log("📤 Enviando PRIMER POST (crear carpeta):", datosPrimeraEtapa);

    await fetch('https://script.google.com/macros/s/AKfycbw6n6aS9HvKYAR1VjOwqYP7MlPU4hIn2u2ECbShMlJD9W1nQgd-tahpriS55xOh-LmxfQ/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPrimeraEtapa)
    });

    // 📄 Segundo envío: datos completos con ID
    const datosConID = {
      ...datos,
      idtramite: idTramite
    };
    console.log("📤 Enviando SEGUNDO POST (generar nota):", datosConID);

    await fetch('https://script.google.com/macros/s/AKfycbzVaO3CjYb6xoIBjte0I72PHftHr9eZQTVpfIJs51c7Ann_CUGgSZ8OTmHLhxV6eDq_/exec', {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosConID)
    });

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
