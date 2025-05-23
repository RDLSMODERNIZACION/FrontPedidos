document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
  
    if (!usuario) {
      alert('❌ Sesión no iniciada.');
      window.location.href = '../index.html';
      return;
    }
  
    // Mostrar datos usuario - mejorado visualmente
    mostrarInfoUsuario(usuario);
  
    // Mostrar bienvenida y luego cambiar el título
    mostrarTituloDinamico(usuario);
  
    // Cargar menú
    cargarMenu();
  
    // Botones cerrar sesión
    document.getElementById('cerrarSesionBtn')?.addEventListener('click', cerrarSesion);
    document.getElementById('cerrarSesionBtnMovil')?.addEventListener('click', cerrarSesion);
  
    // Escuchar clicks en todo el documento
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-vista]');
      if (link) {
        e.preventDefault();
        const vista = link.getAttribute('data-vista');
        if (vista) {
          cargarVista(vista);
        }
      }
    });
  });
  
  // 🚀 Función para mostrar nombre, secretaría y tipo en bonito
  function mostrarInfoUsuario(usuario) {
    const { nombre, secretaria, tipo } = usuario;
  
    // Para el sidebar fijo
    const infoUsuarioDesktop = document.getElementById('info-usuario');
    if (infoUsuarioDesktop) {
      infoUsuarioDesktop.innerHTML = `
        <div class="fw-bold fs-5">${nombre}</div>
        <div class="text-muted small">${secretaria}</div>
        <div><span class="badge bg-primary">${tipo}</span></div>
      `;
    }
  
    // Para el menú móvil
    const infoUsuarioMovil = document.getElementById('info-usuario-movil');
    if (infoUsuarioMovil) {
      infoUsuarioMovil.innerHTML = `
        <div class="fw-bold">${nombre}</div>
        <div class="small">${secretaria}</div>
        <span class="badge bg-light text-primary">${tipo}</span>
      `;
    }
  }
  
  // 🚀 Función para mostrar "Bienvenido" y luego cambiar a "Portal de Gestión" con transiciones suaves
function mostrarTituloDinamico(usuario) {
    const titulo = document.getElementById('titulo-principal');
  
    if (!titulo) return;
  
    // Mostrar "Bienvenido"
    titulo.textContent = `👋 Bienvenido, ${usuario.nombre}`;
    titulo.classList.remove('text-secondary');
    titulo.classList.add('text-primary');
  
    // Fade-out antes de cambiar el texto
    setTimeout(() => {
      titulo.style.opacity = 0;
  
      setTimeout(() => {
        // Cambiar el texto y color
        titulo.textContent = 'Portal de Gestión';
        titulo.classList.remove('text-primary');
        titulo.classList.add('text-secondary');
  
        // Fade-in
        titulo.style.opacity = 1;
      }, 500); // Espera 0.5s para cambiar texto
  
    }, 2500); // Espera 2.5s antes de empezar a desaparecer
  }
  
  
  
  // 🚀 Función para cargar menú en desktop y móvil
  function cargarMenu() {
    const menuDesktop = document.getElementById('menu-principal');
    const menuMovil = document.getElementById('menu-principal-movil');
  
    const opciones = [
      { nombre: 'Buscar Pedido', vista: 'buscar_pedido', icono: 'bi-search' },
      { nombre: 'Mis Pedidos', vista: 'mis_pedidos', icono: 'bi-file-earmark-text' },
      { nombre: 'Nuevo Pedido', vista: 'formulario_base', icono: 'bi-plus-lg' },
    ];
  
    opciones.forEach(op => {
      // Ítem escritorio
      const liDesktop = document.createElement('li');
      liDesktop.className = 'list-group-item d-flex align-items-center gap-2';
      liDesktop.innerHTML = `
        <i class="bi ${op.icono}"></i> 
        <a href="#" class="link-menu-desktop" data-vista="${op.vista}">
          ${op.nombre}
        </a>
      `;
      menuDesktop.appendChild(liDesktop);
  
      // Ítem móvil
      const liMovil = document.createElement('li');
      liMovil.className = 'list-group-item bg-primary d-flex align-items-center gap-2';
      liMovil.innerHTML = `
        <i class="bi ${op.icono} text-white"></i> 
        <a href="#" class="link-menu-movil text-white" data-vista="${op.vista}">
          ${op.nombre}
        </a>
      `;
      menuMovil.appendChild(liMovil);
    });
  }
  

  // 🚀 Función para cerrar sesión
  function cerrarSesion() {
    localStorage.removeItem('usuario');
    window.location.href = '../index.html';
  }

  
  // 🚀 Función para cargar vistas dinámicamente
  async function cargarVista(vista) {
    try {
      const response = await fetch(`../vistas/${vista}.html`);
      const html = await response.text();
      document.getElementById('contenido-principal').innerHTML = html;
      console.log(`✅ Vista ${vista} cargada.`);

      // Si la vista es mis_pedidos, cargar script externo
      if (vista === 'mis_pedidos') {
  console.log('📥 Cargando listadoPedidos.js...');
  const script = document.createElement('script');
  script.src = '../js/pedidos/listadoPedidos.js';
  script.defer = true;
  script.onload = () => {
    console.log('✅ listadoPedidos.js cargado.');

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log('👤 Usuario:', usuario);
    console.log('📌 Secretaría del usuario:', usuario.secretaria);

    if (typeof inicializarListadoPedidos === 'function') {
      inicializarListadoPedidos();
    } else {
      console.warn('⚠️ inicializarListadoPedidos no está definida.');
    }
  };
  document.body.appendChild(script);
}



  
      // 🛠️ SI LA VISTA ES formulario_base:
      if (vista === 'formulario_base') {
        console.log('🛠️ Inicializando formulario base...');
  
        // Cargar datos del usuario en spans
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (usuario) {
          const spanNombre = document.getElementById('info-nombre');
          const spanSecretaria = document.getElementById('info-secretaria');
          const tituloSecretaria = document.getElementById('titulo-secretaria');
  
          if (spanNombre) spanNombre.textContent = usuario.nombre;
          if (spanSecretaria) spanSecretaria.textContent = usuario.secretaria;
          if (tituloSecretaria) tituloSecretaria.textContent = usuario.secretaria;
        }

  
        // 🚀 Ahora cargar los módulos
        if (typeof inicializarFormularioBase === 'function') {
          console.log('🚀 inicializarFormularioBase() detectada. Ejecutando...');
          inicializarFormularioBase();
        } else {
          // Si no existe la función todavía, cargar loader.js
          console.log('🛠️ loader.js no detectado. Cargando manualmente...');
          const loaderScript = document.createElement('script');
          loaderScript.src = '../js/loader.js';
          loaderScript.defer = true;
          loaderScript.onload = () => {
            console.log('✅ loader.js cargado. Ejecutando inicializarFormularioBase()...');
            if (typeof inicializarFormularioBase === 'function') {
              inicializarFormularioBase();
            }
          };
          document.body.appendChild(loaderScript);
        }
      }
  
    } catch (error) {
      console.error(`❌ Error cargando vista ${vista}:`, error);
      document.getElementById('contenido-principal').innerHTML = `<p class="text-danger">Error al cargar la vista.</p>`;
    }
  }
  