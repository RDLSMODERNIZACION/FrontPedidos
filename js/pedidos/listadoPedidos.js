function inicializarListadoPedidos() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) return;

  const pedidos = [
    {
      id: 'GE-20250523-001',
      servicio: 'Adquisición',
      estado: 'Pendiente',
      fecha: '2025-05-23',
      secretaria: 'Secretaría de Hacienda'
    },
    {
      id: 'GE-20250522-002',
      servicio: 'Reparación',
      estado: 'Aprobado',
      fecha: '2025-05-22',
      secretaria: 'Obras Públicas'
    },
    {
      id: 'GE-20250521-003',
      servicio: 'Servicios',
      estado: 'Pendiente',
      fecha: '2025-05-21',
      secretaria: 'SECRETARÍA DE HACIENDA'
    }
  ];

  const cuerpo = document.getElementById('tabla-mis-pedidos');
  if (!cuerpo) {
    console.warn('❌ No se encontró la tabla de pedidos.');
    return;
  }

  const pedidosFiltrados = pedidos
    .filter(p => normalizar(p.secretaria) === normalizar(usuario.secretaria))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  cuerpo.innerHTML = '';

  if (pedidosFiltrados.length === 0) {
    cuerpo.innerHTML = `<tr><td colspan="5" class="text-center">🚫 No hay pedidos cargados aún.</td></tr>`;
  } else {
    pedidosFiltrados.forEach(p => {
      cuerpo.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.servicio}</td>
          <td>${p.estado}</td>
          <td>${formatearFecha(p.fecha)}</td>
          <td>
            <button class="btn btn-sm btn-primary btn-ver-pedido" data-id="${p.id}">👁 Ver</button>
          </td>
        </tr>
      `;
    });
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO);
    return f.toLocaleDateString('es-AR');
  }

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, '')  // quita tildes
      .replace(/\s+/g, ' ')             // normaliza espacios múltiples
      .trim();
  }

  document.addEventListener('click', function (e) {
    const boton = e.target.closest('.btn-ver-pedido');
    if (boton) {
      const id = boton.getAttribute('data-id');
      window.location.href = `pedidos/detalle.html?id=${encodeURIComponent(id)}`;
    }
  });
}
