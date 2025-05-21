export function mostrarModalExito(id = '') {
  const modalId = 'modalExito';

  // Evita duplicar el modal si ya existe
  if (!document.getElementById(modalId)) {
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="${modalId}Label">Formulario enviado ✅</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center">
              <p>¡Tu solicitud fue enviada correctamente!</p>
              <p><strong>ID del trámite:</strong><br><span class="text-primary">${id}</span></p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  } else {
    // Si ya existe, actualiza solo el contenido del ID
    const idContainer = document.querySelector(`#${modalId} .modal-body span.text-primary`);
    if (idContainer) {
      idContainer.textContent = id;
    }
  }

  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}
