import { generarID } from './idgenerator.js';
import { mostrarModalExito } from './modalExito.js';

/**
 * Envía los datos del formulario en dos pasos:
 * 1. Guarda en hoja de cálculo y genera carpeta.
 * 2. (opcional) Genera nota PDF con los mismos datos.
 *
 * @param {Object} datos - Objeto completo con usuario, módulos y tipo.
 */
export async function enviarFormularioSinRespuesta(datos) {
  const boton = document.getElementById('btnEnviarFormulario');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Enviando... 📤';
  }

  try {
    // 🆔 1. Generar ID único del trámite
    const id = generarID(datos.modulo || 'CT');
    datos.idtramite = id;

    console.log(`🆔 ID generado: ${id}`);

    // ✅ 2. PRIMER POST: guardar en hoja y crear carpeta
    await fetch(
      'https://script.google.com/macros/s/AKfycbzkpORd0dhrwQ3kwuKbwGY9XFyml-Pz9MG77L-tEQAqUZVqKBtqM4Cz-z8pPFARGeIM5A/exec',
      {
        method: 'POST',
        mode: 'no-cors', // Evita error CORS, pero no permite leer respuesta
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      }
    );

    console.log('✅ Primer POST enviado (guardar datos y carpeta)');

    // 📄 3. SEGUNDO POST: generación de nota PDF (desactivado temporalmente)
    /*
    const cuerpoNota = {
      idtramite: id,
      modulo: datos.modulo,
      usuario: datos.usuario,
      [`modulo_${datos.modulo}`]: datos[`modulo_${datos.modulo}`]
    };

    await fetch(
      'https://script.google.com/macros/s/AKfycbxJxjO4gfUo6xLbdwbU0R9TeDz9tE5xOCBpyvRa/exec',
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuerpoNota)
      }
    );

    console.log('📄 Segundo POST enviado (nota PDF)');
    */

    // ✅ 4. Mostrar modal con ID
    mostrarModalExito(id);

  } catch (error) {
    console.error('❌ Error durante el envío del formulario:', error);
    alert('⚠️ Ocurrió un error al enviar el formulario. Intente nuevamente.');
  } finally {
    if (boton) {
      boton.disabled = false;
      boton.innerText = '📤 Enviar Formulario';
    }
  }
}
