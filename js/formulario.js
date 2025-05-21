import { archivoAObjetoBase64 } from './helpers/base64.js';
import { enviarFormularioSinRespuesta } from './helpers/enviar.js';
import { limpiarFormulario } from './helpers/limpiar.js';

import { obtenerDatosGeneral } from './modulos/general.js';
import { obtenerDatosAlquiler } from './modulos/alquiler.js';
import { obtenerDatosAdquisicion } from './modulos/adquisicion.js';
import { obtenerDatosMantenimientodeescuelas } from './modulos/mantenimientodeescuelas.js';
import { obtenerDatosObras } from './modulos/obras.js';
import { obtenerDatosReparacion } from './modulos/reparacion.js';
import { obtenerDatosServicios } from './modulos/servicios.js';

// Escucha el botón de envío
document.getElementById('btnEnviarFormulario').addEventListener('click', async function () {
  const boton = this;
  if (boton.disabled) return;

  boton.disabled = true;
  boton.innerText = 'Enviando... 📤';

  const datosRecopilados = {
    usuario: {
      nombre: document.getElementById('info-nombre')?.textContent.trim() || '',
      secretaria: document.getElementById('info-secretaria')?.textContent.trim() || ''
    }
  };

  // Detecta los módulos activos (general siempre está incluido)
  const modulosActivos = Array.from(document.querySelectorAll('.modulo[data-modulo]')).filter(modulo => {
    const nombre = modulo.dataset.modulo;
    if (nombre === 'general') return true;
    const idSwitch = `switch${nombre.charAt(0).toUpperCase()}${nombre.slice(1)}`;
    return document.getElementById(idSwitch)?.checked;
  });

  // Recolecta los datos de cada módulo activado
  for (const divModulo of modulosActivos) {
    const nombre = divModulo.dataset.modulo;
    let datosModulo = {};

    await esperarModuloCargado(nombre); // Asegura que el DOM esté listo

    switch (nombre) {
      case 'general': datosModulo = await obtenerDatosGeneral(); break;
      case 'alquiler': datosModulo = await obtenerDatosAlquiler(); break;
      case 'adquisicion': datosModulo = await obtenerDatosAdquisicion(); break;
      case 'mantenimientodeescuelas': datosModulo = await obtenerDatosMantenimientodeescuelas(); break;
      case 'obras': datosModulo = await obtenerDatosObras(); break;
      case 'reparacion': datosModulo = await obtenerDatosReparacion(); break;
      case 'servicios': datosModulo = await obtenerDatosServicios(); break;
    }

    console.log(`📦 Datos capturados de [${nombre}]:`, datosModulo);
    datosRecopilados[`modulo_${nombre}`] = datosModulo;
  }

  // Define cuál es el módulo principal (el primero que no sea "general")
  datosRecopilados.modulo = modulosActivos.find(m => m.dataset.modulo !== 'general')?.dataset.modulo || 'general';

  console.log('🧪 JSON FINAL A ENVIAR:', JSON.stringify(datosRecopilados, null, 2));

  // Envío del formulario (genera el ID adentro de enviar.js)
  await enviarFormularioSinRespuesta(datosRecopilados);

  // Limpieza
  limpiarFormulario();

  // Restaurar botón
  boton.disabled = false;
  boton.innerText = '📤 Enviar Formulario';
});

/**
 * Espera a que el módulo esté completamente cargado en el DOM
 * @param {string} nombreModulo
 * @returns {Promise<HTMLElement>}
 */
function esperarModuloCargado(nombreModulo) {
  return new Promise(resolve => {
    const check = () => {
      const el = document.querySelector(`[data-modulo="${nombreModulo}"]`);
      if (el) return resolve(el);
      requestAnimationFrame(check);
    };
    check();
  });
}
