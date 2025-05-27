import { generarIDTramite } from './idgenerator.js';
import { validarDatosGenerales, validarModuloEspecifico } from './validaciones.js';
import { mostrarModalExito, mostrarModalError } from './modalExito.js';
import { obtenerAreaDestino } from './areaDestino.js';

export async function enviarFormularioSinRespuesta(datos) {
  const boton = document.getElementById('btnEnviarFormulario');
  if (boton) {
    boton.disabled = true;
    boton.innerText = 'Enviando... 📤';
  }

  try {
    // Validaciones
    if (!validarDatosGenerales(datos) || !validarModuloEspecifico(datos.modulo, datos)) {
      boton.disabled = false;
      boton.innerText = '📤 Enviar Formulario';
      return;
    }

    // Generar ID
    const idTramite = generarIDTramite(datos.modulo);
    console.log("🆔 ID generado:", idTramite);

    // Calcular área destino
    const presupuesto = datos.modulo_general?.presupuesto || '0';
    const areaDestino = obtenerAreaDestino(presupuesto);

    const datosCompletos = {
      ...datos,
      idtramite: idTramite,
      usuario: {
        ...datos.usuario,
        areaDestino: areaDestino
      }
    };

    // 📨 PRIMER POST: Enviar todo con archivos
    const res1 = await fetch('http://localhost:3000/api/crear-carpeta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCompletos)
    });

    const json1 = await res1.json();
    console.log("📁 Carpeta creada / respuesta 1:", json1);

    if (json1.estado !== 'ok') {
      mostrarModalError(json1.mensaje || 'Error al crear carpeta.');
      return;
    }

    // 🧹 SEGUNDO POST: Enviar solo datos (sin archivos)
    const datosSinArchivos = JSON.parse(JSON.stringify(datosCompletos));

    // Eliminar archivos base64 de cada módulo si existen
    for (const key in datosSinArchivos) {
      if (key.startsWith('modulo_') && typeof datosSinArchivos[key] === 'object') {
        for (const subkey in datosSinArchivos[key]) {
          if (
            typeof datosSinArchivos[key][subkey] === 'object' &&
            datosSinArchivos[key][subkey].base64
          ) {
            delete datosSinArchivos[key][subkey];
          }
        }
      }
    }

    // 📨 SEGUNDO POST: solo datos
    const res2 = await fetch('http://localhost:3000/api/guardar-datos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosSinArchivos)
    });

    const json2 = await res2.json();
    console.log("📝 Datos guardados / respuesta 2:", json2);

    if (json2.estado !== 'ok') {
      mostrarModalError(json2.mensaje || 'Error al guardar los datos.');
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
