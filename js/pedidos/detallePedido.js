document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('info-pedido').innerHTML = `
      <div class="alert alert-danger">❌ No se encontró el ID del pedido.</div>
    `;
    return;
  }

  cargarDetallePedido(id);
});

function cargarDetallePedido(id) {
  const pedidos = [
    {
      id: 'GE-20250523-001',
      servicio: 'Adquisición',
      estado: 'Pendiente',
      secretaria: 'Educación',
      fecha: '2025-05-23',
      descripcion: 'Compra de materiales escolares.',
      observaciones: 'Urgente para inicio de ciclo lectivo.',
      archivo: 'presupuesto.pdf'
    },
    {
      id: 'GE-20250522-002',
      servicio: 'Reparación',
      estado: 'Aprobado',
      secretaria: 'Obras Públicas',
      fecha: '2025-05-22',
      descripcion: 'Reparación eléctrica en Escuela 45.',
      observaciones: '',
      archivo: null
    }
  ];

  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    document.getElementById('info-pedido').innerHTML = `
      <div class="alert alert-warning">⚠️ El pedido con ID <strong>${id}</strong> no fue encontrado.</div>
    `;
    return;
  }

  const infoHTML = `
    <table class="table table-bordered">
      <tr><th>ID Trámite</th><td>${pedido.id}</td></tr>
      <tr><th>Servicio</th><td>${pedido.servicio}</td></tr>
      <tr><th>Estado</th><td>${pedido.estado}</td></tr>
      <tr><th>Secretaría</th><td>${pedido.secretaria}</td></tr>
      <tr><th>Fecha</th><td>${formatearFecha(pedido.fecha)}</td></tr>
      <tr><th>Descripción</th><td>${pedido.descripcion}</td></tr>
      <tr><th>Observaciones</th><td>${pedido.observaciones || '—'}</td></tr>
      <tr><th>Archivo</th><td>${
        pedido.archivo 
          ? `<a href="../../archivos/${pedido.archivo}" target="_blank">📎 Ver archivo</a>` 
          : '—'
      }</td></tr>
    </table>
  `;

  document.getElementById('info-pedido').innerHTML = infoHTML;

  // Mostrar botones solo si estado === Pendiente
  if (pedido.estado === 'Pendiente') {
    document.getElementById('acciones-pedido').style.display = 'flex';
  }
}

function formatearFecha(fecha) {
  const f = new Date(fecha);
  return f.toLocaleDateString('es-AR');
}

function aprobarPedido() {
  alert('✅ Pedido aprobado. (Simulado)');
  // acá conectarías con API o actualizarías estado en backend/Sheets
}

function rechazarPedido() {
  const confirmacion = confirm('¿Seguro que querés rechazar este pedido?');
  if (confirmacion) {
    alert('❌ Pedido rechazado. (Simulado)');
  }
}
