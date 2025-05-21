(async function iniciarLoader() {
  console.log('🚀 loader.js ejecutándose...');

  try {
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
      console.error('❌ No se encontró usuario en localStorage.');
      alert('Sesión no iniciada. Redirigiendo al login...');
      window.location.href = '../index.html';
      return;
    }

    const secretaria = usuario.secretaria;
    const nombre = usuario.nombre;

    await esperarElemento('#info-nombre');
    await esperarElemento('#info-secretaria');
    await esperarElemento('#titulo-secretaria');

    console.log('🎯 Escribiendo datos en spans...');
    console.log('nombre:', nombre);
    console.log('secretaria:', secretaria);

    const spanNombre = document.getElementById('info-nombre');
    const spanSecretaria = document.getElementById('info-secretaria');
    const tituloSecretaria = document.getElementById('titulo-secretaria');

    if (spanNombre) spanNombre.innerText = nombre;
    if (spanSecretaria) spanSecretaria.innerText = secretaria;
    if (tituloSecretaria) tituloSecretaria.innerText = secretaria;

    console.log(`✅ Usuario cargado: ${nombre} - Secretaría: ${secretaria}`);

    const response = await fetch('../config/config_secretarias.json');
    const texto = await response.text();
    console.log('🧩 Respuesta recibida:', texto);

    const config = JSON.parse(texto);
    const modulosSecretaria = config[secretaria]?.modulos || [];

    await cargarModulo('general'); // Siempre cargar primero el módulo general

    for (const modulo of modulosSecretaria) {
      try {
        await cargarModulo(modulo);
      } catch (errorModulo) {
        console.error(`⚠️ Error cargando módulo "${modulo}":`, errorModulo);
      }
    }

    console.log('✅ Todos los módulos cargados exitosamente.');

    // 🚀 Ahora cargar el formulario.js, pero solo si todo salió bien
    const scriptFormulario = document.createElement('script');
    scriptFormulario.src = '../js/formulario.js';
    scriptFormulario.type = 'module';
    document.body.appendChild(scriptFormulario);

    scriptFormulario.onload = () => {
      console.log('✅ formulario.js cargado y ejecutado.');
    };

  } catch (error) {
    console.error('❌ Error durante la carga inicial:', error);
    const contenedor = document.getElementById('contenedor-modulos');
    if (contenedor) {
      contenedor.innerHTML = `<p class="text-danger">Error al cargar el formulario. Intente recargar la página.</p>`;
    }
  }
})();

// 🚀 Funciones auxiliares

function esperarElemento(selector) {
  return new Promise(resolve => {
    const esperar = () => {
      if (document.querySelector(selector)) {
        resolve();
      } else {
        requestAnimationFrame(esperar);
      }
    };
    esperar();
  });
}

async function cargarModulo(nombreModulo) {
  try {
    console.log(`⏳ Intentando cargar HTML de módulo: ${nombreModulo}`);
    const response = await fetch(`modulos/${nombreModulo}/${nombreModulo}.html`); // RUTA RELATIVA

    if (!response.ok) {
      throw new Error(`No se pudo cargar el HTML del módulo "${nombreModulo}". Estado: ${response.status}`);
    }

    const html = await response.text();
    document.getElementById('contenedor-modulos').insertAdjacentHTML('beforeend', html);

    await new Promise(resolve => setTimeout(resolve, 0)); // Esperar 1 frame

    const script = document.createElement('script');
    script.src = `modulos/${nombreModulo}/${nombreModulo}.js`; // RUTA RELATIVA
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log(`✅ Módulo ${nombreModulo} cargado.`);
      const nombreFuncion = `inicializarModulo${capitalizarPrimeraLetra(nombreModulo)}`;
      if (typeof window[nombreFuncion] === 'function') {
        console.log(`🚀 Inicializando ${nombreFuncion}() automáticamente...`);
        window[nombreFuncion]();
      } else {
        console.warn(`⚠️ No se encontró función ${nombreFuncion}() para inicializar ${nombreModulo}.`);
      }
    };

  } catch (error) {
    console.error(`❌ Error cargando módulo ${nombreModulo}:`, error);
    throw error;
  }
}

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
