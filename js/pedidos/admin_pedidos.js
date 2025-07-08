window.inicializarListadoPedidosAdmin = async function () {

  console.log("🚀 inicializarMisPedidosAdmin() iniciado");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("❌ No hay sesión iniciada.");
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycbxPNiF3miRa9Bv0JppagI8X7RJxNVGJepQo-kg3pIZpBYgLdSn11hGlK-HOnmBUegzC3Q/exec?t=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });
  const pedidos = await response.json();

  const cuerpo = document.getElementById('tabla-mis-pedidos-admin');
  const inputBusqueda = document.getElementById("inputBusquedaPedidosAdmin");

  if (!cuerpo) {
    console.warn("❌ No se encontró la tabla.");
    return;
  }

  const pedidosFiltrados = pedidos.sort(
    (a, b) => new Date(b["FECHA ACTUAL"]) - new Date(a["FECHA ACTUAL"])
  );

  function renderPedidos(filtroTexto = "") {
    const termino = normalizar(filtroTexto);
    const visibles = pedidosFiltrados.filter(p => {
      return (
        normalizar(p.IDTRAMITE).includes(termino) ||
        normalizar(p.secretaria).includes(termino) ||
        normalizar(p.areaDestino).includes(termino) ||
        normalizar(p.MODULO).includes(termino) ||
        normalizar(p["ESTADO APROBACION"]).includes(termino) ||
        normalizar(formatearFecha(p["FECHA ACTUAL"])).includes(termino)
      );
    });

    cuerpo.innerHTML = "";

    if (visibles.length === 0) {
      cuerpo.innerHTML = `<tr><td colspan="6" class="text-center">🚫 No hay pedidos.</td></tr>`;
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

  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", () => {
      renderPedidos(inputBusqueda.value);
    });
  }

  document.addEventListener("click", function (e) {
    const boton = e.target.closest(".btn-ver-pedido");
    if (boton) {
      const id = boton.getAttribute("data-id");
      window.location.href = `pedidos/detalle.html?id=${encodeURIComponent(id)}`;
    }
  });

  function normalizar(texto) {
    return (
      texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim() || ""
    );
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO);
    return isNaN(f) ? fechaISO : f.toLocaleDateString("es-AR");
  }

  console.log("✅ Mis Pedidos (Admin) renderizados");
};
