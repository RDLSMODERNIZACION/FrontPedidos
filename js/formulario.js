import { archivoAObjetoBase64 } from './helpers/base64.js';
import { enviarFormularioSinRespuesta } from './helpers/enviar.js';

import { validarDatosGenerales, validarModuloEspecifico } from './helpers/validaciones.js';

import { obtenerDatosGeneral } from './modulos/general.js';
import { obtenerDatosAlquiler } from './modulos/alquiler.js';
import { obtenerDatosAdquisicion } from './modulos/adquisicion.js';
import { obtenerDatosMantenimientodeescuelas } from './modulos/mantenimientodeescuelas.js';
import { obtenerDatosObras } from './modulos/obras.js';
import { obtenerDatosReparacion } from './modulos/reparacion.js';
import { obtenerDatosServicios } from './modulos/servicios.js';

/**
 * Espera a que un elemento exista en el DOM
 */
function esperarElemento(selector) {
  return new Promise(resolve => {
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * Espera a que el módulo esté completamente cargado en el DOM
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

// 🔷 Aquí envuelves todo en una IIFE
(async () => {
  await esperarElemento('#btnEnviarFormulario');
  const boton = document.getElementById('btnEnviarFormulario');

  boton.addEventListener('click', async function () {
    if (boton.disabled) return;

    // 🧹 Limpiar mensajes de error y clases de validación previas
  document.querySelectorAll('.is-invalid, .error-message').forEach(el => {
    el.classList.remove('is-invalid');
    if (el.classList.contains('error-message')) el.remove();
  });

  boton.disabled = true;
  boton.innerText = 'Enviando... 📤';

  const datosRecopilados = {
    usuario: {
      nombre: document.getElementById('info-nombre')?.textContent.trim() || '',
      secretaria: document.getElementById('info-secretaria')?.textContent.trim() || ''
    }
  };



    boton.disabled = true;
    boton.innerText = 'Enviando... 📤';



    const select = document.getElementById('moduloSelector');
    const moduloSeleccionado = select?.value || '';

    const modulosActivos = [];

    const moduloGeneral = document.querySelector('[data-modulo="general"]');
    if (moduloGeneral) modulosActivos.push(moduloGeneral);

    const moduloObras = document.querySelector('[data-modulo="obras"]');
    if (moduloObras) modulosActivos.push(moduloObras);

    if (moduloSeleccionado) {
      const moduloEspecifico = document.querySelector(`[data-modulo="${moduloSeleccionado}"]`);
      if (moduloEspecifico) modulosActivos.push(moduloEspecifico);
    }

    const moduloMantenimiento = document.querySelector('[data-modulo="mantenimientodeescuelas"]');
    const switchMantenimiento = document.getElementById('switchMantenimientodeescuelas');
    if (moduloMantenimiento && switchMantenimiento?.checked) {
      modulosActivos.push(moduloMantenimiento);
    }

    for (const divModulo of modulosActivos) {
      const nombre = divModulo.dataset.modulo;
      let datosModulo = {};

      await esperarModuloCargado(nombre);

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

    datosRecopilados.modulo = modulosActivos.find(m => m.dataset.modulo !== 'general')?.dataset.modulo || 'general';

    if (!validarDatosGenerales(datosRecopilados)) {
  boton.disabled = false;
  boton.innerText = '📤 Enviar Formulario';
  return;
}

// validar TODOS los módulos activos
for (const divModulo of modulosActivos) {
  const nombre = divModulo.dataset.modulo;
  if (!validarModuloEspecifico(nombre, datosRecopilados)) {
    boton.disabled = false;
    boton.innerText = '📤 Enviar Formulario';
    return;
  }
}


    if (datosRecopilados.modulo_general) {
      const general = datosRecopilados.modulo_general;

      if (general.presupuesto1 && general.presupuesto1.base64) {
        general.archivo_presupuesto1 = general.presupuesto1;
        general.presupuesto1 = 'SI';
      } else {
        general.presupuesto1 = 'NO';
      }

      if (general.presupuesto2 && general.presupuesto2.base64) {
        general.archivo_presupuesto2 = general.presupuesto2;
        general.presupuesto2 = 'SI';
      } else {
        general.presupuesto2 = 'NO';
      }
    }

    console.log('🧪 JSON FINAL A ENVIAR:', datosRecopilados);

    await enviarFormularioSinRespuesta(datosRecopilados, boton);


    boton.disabled = false;
    boton.innerText = '📤 Enviar Formulario';
  });
})();
