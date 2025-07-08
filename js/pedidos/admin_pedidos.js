async function inicializarListadoPedidosAdmin() {
  console.log("🚀 inicializarListadoPedidosAdmin() iniciado");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  console.log("👤 Usuario recuperado:", usuario);
  if (!usuario) {
    console.warn("⚠️ No hay usuario en localStorage, abortando");
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycbxPNiF3miRa9Bv0JppagI8X7RJxNVGJepQo-kg3pIZpBYgLdSn11hGlK-HOnmBUegzC3Q/exec?t=${Date.now()}`;
  console.log("🌐 Fetch URL:", url);

  let response, pedidos;
  try {
    response = await fetch(url, { cache: 'no-store' });
    console.log("✅ Fetch response OK");
    pedidos = await response.json();
    console.log("📦 Pedidos obtenidos:", pedidos);
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err);
    return;
  }

  const cuerpo = document.getElementById('tabla-pedidos-admin');
  if (!cuerpo) {
    console.warn('❌ No se encontró el elemento #tabla-pedidos-admin.');
    return;
  }
  console.log("✅ Elemento #tabla-pedidos-admin encontrado");

  let pedidosFiltrados = pedidos;

  // 🎯 filtrado según rol
  console.log("🔎 Rol del usuario:", usuario.rol);
  if (usuario.rol === 'admin_compras') {
    pedidosFiltrados = pedidos.filter(p => p.areaDestino === 'Compras');
    console.log("📄 Pedidos filtrados por Compras:", pedidosFiltrados);
  } else if (usuario.rol === 'admin_contrataciones') {
    pedidosFiltrados = pedidos.filter(p => p.areaDestino === 'Contrataciones');
    console.log("📄 Pedidos filtrados por Contrataciones:", pedidosFiltrados);
  } else {
    console.log("📄 Pedidos sin filtro adicional (admin completo)");
  }

  pedidosFiltrados.sort((a, b) => new Date(b["FECHA ACTUAL"]) - new Date(a["FECHA ACTUAL"]));
  console.log("📄 Pedidos ordenados:", pedidosFiltrados);

  function renderPedidos(filtro = '') {
    console.log("🔎 Renderizando pedidos con filtro:", filtro);
    const termino = normalizar(filtro);
    const visibles = pedidosFiltrados.filter(p =>
      normalizar(p.IDTRAMITE).includes(termino) ||
      normalizar(p.MODULO).includes(termino) ||
      normalizar(p.areaDestino).includes(termino) ||
      normalizar(p["ESTADO APROBACION"]).includes(termino) ||
      normalizar(formatearFecha(p["FECHA ACTUAL"])).includes(termino)
    );
    console.log("👀 Pedidos visibles:", visibles);

    cuerpo.innerHTML = '';

    if (visibles.length === 0) {
      cuerpo.innerHTML = `<tr><td colspan="6" class="text-center">🚫 No hay pedidos que coincidan.</td></tr>`;
    } else {
      visibles.forEach(p => {
        cuerpo.innerHTML += `
          <tr>
            <td>${p.IDTRAMITE}</td>
            <td>${p.secretaria}</td>
            <td>${p.areaDestino}</td>
            <td>${p["ESTADO APROBACION"]}</td>
            <td>${formatearFecha(p["FECHA ACTUAL"])}</td>
            <td>
              <button class="btn btn-sm btn-primary btn-ver-pedido" data-id="${p.IDTRAMITE}">👁 Ver</button>
            </td>
          </tr>
        `;
      });
    }
  }

  renderPedidos();

  const inputBusqueda = document.getElementById('inputBusquedaPedidosAdmin');
  if (inputBusqueda) {
    console.log("✅ Input de búsqueda encontrado");
    inputBusqueda.addEventListener('input', e => {
      renderPedidos(e.target.value);
    });
  } else {
    console.warn("⚠️ Input de búsqueda NO encontrado");
  }

  document.addEventListener('click', function (e) {
    const boton = e.target.closest('.btn-ver-pedido');
    if (boton) {
      const id = boton.getAttribute('data-id');
      console.log("➡️ Click en Ver pedido:", id);
      window.location.href = `pedidos/detalle.html?id=${encodeURIComponent(id)}`;
    }
  });

  function normalizar(texto) {
    return texto?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim() || '';
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO);
    return isNaN(f) ? fechaISO : f.toLocaleDateString('es-AR');
  }

  console.log("✅ inicializarListadoPedidosAdmin() finalizado");
}
