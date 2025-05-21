document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
  
    if (!usuario) {
      alert('❌ Sesión no iniciada.');
      window.location.href = '../index.html';
      return;
    }
  
    const infoUsuario = document.getElementById('info-usuario');
    infoUsuario.textContent = `${usuario.nombre} - ${usuario.secretaria} (${usuario.tipo})`;
  
    const menu = document.getElementById('menu-principal');
    menu.innerHTML = `
      <li><a href="#" data-vista="buscar_pedido">🔎 Buscar Pedido</a></li>
    `;
  
    if (usuario.tipo === "Secretaría" || usuario.tipo === "Administrador") {
      menu.innerHTML += `<li><a href="#" data-vista="mis_pedidos">📄 Mis Pedidos</a></li>`;
    }
  
    if (usuario.tipo === "Secretaría") {
      menu.innerHTML += `<li><a href="#" data-vista="formulario_base">➕ Nuevo Pedido</a></li>`;
    }
  
    if (usuario.tipo === "Administrador") {
      menu.innerHTML += `<li><a href="#" data-vista="administracion">🛠 Administración</a></li>`;
    }
  
    document.getElementById('cerrarSesionBtn').addEventListener('click', () => {
      localStorage.removeItem('usuario');
      window.location.href = '../index.html';
    });
  
    // 📦 Escuchar clicks en el menú
    document.querySelectorAll('#menu-principal a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const vista = link.getAttribute('data-vista');
        if (vista) {
          cargarVista(vista);
        }
      });
    });
  });
  
  // 🚀 Función mágica para cargar las vistas dentro del contenido principal
  async function cargarVista(vista) {
    try {
      const response = await fetch(`../vistas/${vista}.html`);
      const html = await response.text();
      document.getElementById('contenido-principal').innerHTML = html;
      console.log(`✅ Vista ${vista} cargada.`);
    } catch (error) {
      console.error(`❌ Error cargando vista ${vista}:`, error);
      document.getElementById('contenido-principal').innerHTML = `<p class="text-danger">Error al cargar la vista.</p>`;
    }
  }
  