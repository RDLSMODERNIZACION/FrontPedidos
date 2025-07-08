document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    alert('❌ Sesión no iniciada.');
    window.location.href = '../index.html';
    return;
  }

  mostrarInfoUsuario(usuario);
  mostrarTituloDinamico(usuario);
  cargarMenu();

  document.getElementById('cerrarSesionBtn')?.addEventListener('click', cerrarSesion);
  document.getElementById('cerrarSesionBtnMovil')?.addEventListener('click', cerrarSesion);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-vista]');
    if (link) {
      e.preventDefault();
      const vista = link.getAttribute('data-vista');
      if (vista) {
        cargarVista(vista);

        const sidebarMovil = document.querySelector('.offcanvas.show');
        if (sidebarMovil) {
          const instancia = bootstrap.Offcanvas.getInstance(sidebarMovil);
          if (instancia) instancia.hide();
        }
      }
    }
  });
});

function mostrarInfoUsuario(usuario) {
  const { nombre, secretaria, tipo } = usuario;

  const infoUsuarioDesktop = document.getElementById('info-usuario');
  if (infoUsuarioDesktop) {
    infoUsuarioDesktop.innerHTML = `
      <div class="fw-bold fs-5">${nombre}</div>
      <div class="text-muted small">${secretaria}</div>
      <div><span class="badge bg-primary">${tipo}</span></div>
    `;
  }

  const infoUsuarioMovil = document.getElementById('info-usuario-movil');
  if (infoUsuarioMovil) {
    infoUsuarioMovil.innerHTML = `
      <div class="fw-bold">${nombre}</div>
      <div class="small">${secretaria}</div>
      <span class="badge bg-light text-primary">${tipo}</span>
    `;
  }
}

function mostrarTituloDinamico(usuario) {
  const titulo = document.getElementById('titulo-principal');

  if (!titulo) return;

  titulo.textContent = `👋 Bienvenido, ${usuario.nombre}`;
  titulo.classList.remove('text-secondary');
  titulo.classList.add('text-primary');

  setTimeout(() => {
    titulo.style.opacity = 0;

    setTimeout(() => {
      titulo.textContent = 'Panel de Administración';
      titulo.classList.remove('text-primary');
      titulo.classList.add('text-secondary');
      titulo.style.opacity = 1;
    }, 500);

  }, 2500);
}

function cargarMenu() {
  const menuDesktop = document.getElementById('menu-principal');
  const menuMovil = document.getElementById('menu-principal-movil');

  const opciones = [
    { nombre: 'Mis Pedidos (Admin)', vista: 'mis_pedidos_admin', icono: 'bi-shield-lock' },
    { nombre: 'Administración', vista: 'administracion', icono: 'bi-gear' }
  ];

  opciones.forEach(op => {
    const liDesktop = document.createElement('li');
    liDesktop.className = 'list-group-item d-flex align-items-center gap-2';
    liDesktop.innerHTML = `
      <i class="bi ${op.icono}"></i> 
      <a href="#" class="link-menu-desktop" data-vista="${op.vista}">
        ${op.nombre}
      </a>
    `;
    menuDesktop.appendChild(liDesktop);

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

function cerrarSesion() {
  localStorage.removeItem('usuario');
  window.location.href = '../index.html';
}

async function cargarVista(vista) {
  try {
    const response = await fetch(`../vistas/${vista}.html`);
    const html = await response.text();
    document.getElementById('contenido-principal').innerHTML = html;
    console.log(`✅ Vista ${vista} cargada.`);

    if (vista === 'mis_pedidos_admin') {
      console.log('📥 Cargando admin_pedidos.js...');
      const script = document.createElement('script');
      script.src = '../js/pedidos/admin_pedidos.js';
      script.defer = true;
      script.onload = () => {
        console.log('✅ admin_pedidos.js cargado.');
        if (typeof inicializarListadoPedidosAdmin === 'function') {
          inicializarListadoPedidosAdmin();
        } else {
          console.warn('⚠️ inicializarListadoPedidosAdmin no está definida.');
        }
      };
      document.body.appendChild(script);
    }

    if (vista === 'administracion') {
      console.log('🛠️ Inicializando vista administración...');
      // Si tienes lógica para administración puedes cargar otro script aquí
    }

  } catch (error) {
    console.error(`❌ Error cargando vista ${vista}:`, error);
    document.getElementById('contenido-principal').innerHTML = `<p class="text-danger">Error al cargar la vista.</p>`;
  }
}
